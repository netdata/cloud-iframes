import axios from "axios"
import { useCallback, useEffect, useState } from "react"

const GLOBAL_TIMEOUT = 15_000

export const axiosInstance = axios.create({
  timeout: GLOBAL_TIMEOUT,
  headers: {
    "Cache-Control": "no-cache, no-store",
    Pragma: "no-cache",
  },
})


export const useHttp = <T = unknown>(
  url: string | undefined,
  shouldMakeCall : boolean = true,
  isExternal?: boolean,
) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<T | null>(null)
  useEffect(() => {
    if (shouldMakeCall && url && !isError) {
      const options = isExternal
        ? { headers: null, withCredentials: false }
        : {}

      setIsFetching(true)
      axiosInstance.get(url, options)
        .then((r) => {
          if (r.data) {
            setData(r.data)
            setIsError(false)
            setIsFetching(false)
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.warn(`error fetching ${url}`, error)
          setIsError(true)
          setIsFetching(false)
        })
    }
  }, [isError, isExternal, shouldMakeCall, url])

  const resetCallback = useCallback(() => {
    setData(null)
  }, [])

  // force triple instead of array
  return [data, resetCallback, isFetching, isError] as [T | null, () => void, boolean, boolean]
}
