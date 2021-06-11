import { useCallback, useEffect, useState } from "react"
import { useInterval, usePrevious } from "react-use"
import { stateBasedArrayMerge } from "utils/state-handler"
import { axiosInstance } from "hooks/use-http"

export const DEFAULT_POLL_INTERVAL = 10_000
export const BIGGEST_INTERVAL_NUMBER = 2 ** 31 - 1


const createUrlWithLastUpdated = (url: string, lastUpdated: string | undefined) => (
  lastUpdated ? `${url}?last_updated=${lastUpdated}` : url
)

interface RequestResult<T extends {}> {
  results: T[]
  updatedAt: string
}

// currently support only array types
export const useHttpPoll = <T>(
  url: string,
  shouldMakeCall: boolean = true,
  pollInterval: number = DEFAULT_POLL_INTERVAL,
) => {
  const [lastUpdated, setLastUpdated] = useState<string>()
  const prevLastUpdated = usePrevious<string | undefined>(lastUpdated)
  const [mergedData, setMergedData] = useState<RequestResult<T>>()

  const [hasStarted, setHasStarted] = useState<boolean>()
  useEffect(() => {
    if (mergedData !== undefined) {
      setMergedData(undefined)
      setHasStarted(false)
      setLastUpdated(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]) // deliberately checking only url (reset state on change)

  const currentUrl = createUrlWithLastUpdated(url, lastUpdated)
  // eslint-disable-next-line no-nested-ternary
  const interval = shouldMakeCall
    ? (hasStarted
      ? pollInterval
      : 0 // start immediately when no call haven't been made
    )
    : BIGGEST_INTERVAL_NUMBER

  useInterval(() => {
    setHasStarted(true)
    axiosInstance
      .get<RequestResult<T>>(currentUrl)
      .then((response) => {
        if (response.data) {
          const currentData = mergedData ? mergedData.results : []
          const mergedArray = stateBasedArrayMerge<T>(currentData || [], response.data.results)
            .result
          setMergedData({
            ...response.data,
            results: mergedArray,
          })
          setLastUpdated(response.data.updatedAt)
        }
      })
  }, interval)
  const resetCallback = useCallback(() => {
    setMergedData(undefined)
  }, [])

  return [
    mergedData,
    resetCallback,
    prevLastUpdated,
  ] as [RequestResult<T> | null, () => void, string]
}
