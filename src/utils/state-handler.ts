// this file is copied from cloud-frontend. Don't modify only this, to prevent
// getting desync. todo - add to common repo
import { view, lensPath, pick } from "ramda"

type PathT = (string | number)[]

type StateOptions = "current" | "updated" | "deleted"

type SettingsT = {
  statePath: PathT
  compareKey: string
  diffEntityKeys: string[]
}

type CRUDResultT<T> = Pick<T, Exclude<keyof T, Exclude<keyof T, string>>> | T

export type ResultT<T, RT = Map<T[Extract<keyof T, string>], T>> = {
  hasChanges: boolean
  result: RT
  created: CRUDResultT<T>[]
  updated: CRUDResultT<T>[]
  deleted: CRUDResultT<T>[]
}

type HandlerMapper<T> = (
  accumulator: ResultT<T>,
  currentElement: T,
  settings: SettingsT
) => ResultT<T>

type HandlerDict<T> = {
  current: HandlerMapper<T>
  updated: HandlerMapper<T>
  deleted: HandlerMapper<T>
}

const defaultSettings: SettingsT = {
  statePath: ["state"],
  compareKey: "id",
  diffEntityKeys: [],
}

function reduceBasisCreator<T>(baseCollection: Map<T[Extract<keyof T, string>], T>): ResultT<T> {
  return {
    get hasChanges() {
      return this.created.length > 0 || this.updated.length > 0 || this.deleted.length > 0
    },
    result: baseCollection,
    created: [],
    updated: [],
    deleted: [],
  }
}

function mapToCurrent<T>(compareKey: string) {
  return (accumulator: ResultT<T>, currentElement: T, settings: SettingsT) => {
    const { result, created } = accumulator
    const { diffEntityKeys } = settings

    const currentId = currentElement[compareKey as Extract<keyof T, string>]

    if (result.has(currentId)) {
      return accumulator
    }
    const elementToLog = diffEntityKeys.length
      ? pick(diffEntityKeys, currentElement)
      : currentElement

    result.set(currentId, currentElement)
    created.push(elementToLog)
    return { ...accumulator, result, created }
  }
}

function mapToDeleted<T>(compareKey: string) {
  //  argument deleted settings: SettingsT
  return (accumulator: ResultT<T>, currentElement: T) => {
    const { result, deleted } = accumulator
    // const { diffEntityKeys } = settings

    const currentId: T[Extract<keyof T, string>] = currentElement[
      compareKey as Extract<keyof T, string>
    ]
    // const elementToLog = diffEntityKeys.length
    //  ? pick(diffEntityKeys, currentElement)
    //  : currentElement
    const entityToBeDeleted = result.has(currentId) ? result.get(currentId) : currentElement
    deleted.push({ ...entityToBeDeleted, state: "deleted" } as T)
    result.delete(currentId)

    return { ...accumulator, result, deleted }
  }
}

function mapToUpdated<T>(compareKey: string) {
  return (accumulator: ResultT<T>, currentElement: T, settings: SettingsT) => {
    const { updated, created, result } = accumulator
    const { diffEntityKeys } = settings

    const currentId: T[Extract<keyof T, string>] = currentElement[
      compareKey as Extract<keyof T, string>
    ]
    const elementToLog = diffEntityKeys.length
      ? pick(diffEntityKeys, currentElement)
      : currentElement

    if (result.has(currentId)) {
      updated.push(elementToLog)
    } else {
      created.push(elementToLog)
    }

    result.set(currentId, currentElement)

    return {
      ...accumulator, result, updated, created,
    }
  }
}

function createHandlers<T>(compareKey: string & keyof T): HandlerDict<T> {
  return {
    current: mapToCurrent<T>(compareKey),
    updated: mapToUpdated<T>(compareKey),
    deleted: mapToDeleted<T>(compareKey),
  }
}

function stateLensCreator<T>(path: PathT = defaultSettings.statePath) {
  return view<T, StateOptions>(lensPath(path))
}

export function stateBasedArrayMerge<T>(
  updateTarget: T[],
  update: T[],
  settings: Partial<SettingsT> = defaultSettings,
): ResultT<T, T[]> {
  if (!update.length) {
    return {
      result: updateTarget, updated: [], created: [], deleted: [], hasChanges: false,
    }
  }
  const fullSettings = { ...defaultSettings, ...settings }
  const { statePath, compareKey } = fullSettings

  const getState = stateLensCreator<T>(statePath)

  const handlers = createHandlers<T>(compareKey as Extract<keyof T, string>)
  const mapToPatch = new Map(
    updateTarget.map((item) => [item[compareKey as Extract<keyof T, string>], item]),
  )

  const parsedCollection = update.reduce((acc: ResultT<T>, cur: T) => {
    const handler = handlers[getState(cur)]
    return handler(acc, cur, fullSettings)
  }, reduceBasisCreator<T>(mapToPatch))

  return {
    ...parsedCollection,
    result: Array.from(parsedCollection.result.values()),
  }
}

export function stateBasedObjectMerge<T>(
  updateTarget: { [key: string]: T },
  update: T[],
  settings: Partial<SettingsT> = defaultSettings,
): ResultT<T, { [key: string]: T }> {
  const { compareKey } = { ...defaultSettings, ...settings }
  const { result, ...rest } = stateBasedArrayMerge<T>(Object.values(updateTarget), update, settings)

  const objectResult = result.reduce((acc, cur: T) => {
    const idKey = cur[compareKey as Extract<keyof T, string>]
    return { ...acc, [(idKey as unknown) as string]: cur }
  }, {})
  return { result: objectResult, ...rest }
}
