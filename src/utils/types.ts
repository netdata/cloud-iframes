export interface SpacesPayload {
  updatedAt: string
  results: {
    id: string
    slug: string
    name: string
    description: null | string
    iconURL: null | string
    state: string
    createdAt: string
  }[]
}

export interface RoomsMessagePayload {
  updatedAt: string
  spaceName: string
  spaceSlug: string
  results: {
    id: string
    slug: string
    name: string
  }[]
}

export interface RoomsPayload {
  updatedAt: string
  results: {
    id: string
    slug: string
    name: string
  }[]
}

export type AlarmsMessagePayload = {
  roomID: string
  alarmCounter: {
    critical: number
    warning: number
  }
  unreachableCount: number
  state: string
}[]

export interface AlarmsCallPayload {
  updatedAt: string
  results: AlarmsMessagePayload
}

export interface VisitedNode {
  id: string
  name: string
  urls: string[]
  accessCount: number
  lastAccessTime: string
}

export type VisitedNodes = VisitedNode[]

export type NodesPayload = {
  results: VisitedNodes
}

export interface RegistryMachine {
  guid: string
  url: string
  lastTimestamp: number
  accesses: number
  name: string
  alternateUrls: string[]
}
