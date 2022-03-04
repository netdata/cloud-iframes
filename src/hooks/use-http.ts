import axios from "axios"
import { useCallback, useEffect, useState } from "react"

const GLOBAL_TIMEOUT = 15_000

type Error = {
  errorCode: string
  errorMsgKey: "ErrUnauthenticated"
  errorMessage: "no cookie"
  status: number
}

export const axiosInstance = axios.create({
  timeout: GLOBAL_TIMEOUT,
  headers: {
    "Cache-Control": "no-cache, no-store",
    Pragma: "no-cache",
  },
})

const requestOptions = {
  timeout: GLOBAL_TIMEOUT,
  headers: {
    "Cache-Control": "no-cache, no-store",
    Pragma: "no-cache",
  },
}

export const useHttp = <T = unknown>(
  url: string | undefined,
  shouldMakeCall: boolean = true,
  watchedProperty?: unknown
) => {
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<T | null>(null)
  useEffect(() => {
    if (shouldMakeCall && url && !error) {
      setIsFetching(true)
      axios
        .get(url, requestOptions)
        .then(r => {
          if (r.data) {
            setData(r.data)
            setError(undefined)
            setIsFetching(false)
          }
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.warn(`error fetching ${url}`, error)
          setError({ ...error.response?.data, status: error.response?.status })
          setIsFetching(false)
        })
    }
  }, [error, watchedProperty, shouldMakeCall, url])

  const resetCallback = useCallback(() => {
    setData(null)
  }, [])

  // force triple instead of array
  return [data, resetCallback, isFetching, error] as [T | null, () => void, boolean, Error]
}
