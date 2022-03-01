import axios from "axios"
import config from "@/src/config"

const parse = transform => data => {
  try {
    const parsed = JSON.parse(data)
    if (parsed.errorMsgKey) throw parsed

    return transform ? transform(parsed) : parsed
  } catch (error) {
    return error
  }
}

const identity = n => n

const makeRequest =
  (method, hasParams = false) =>
  (url, ...args) => {
    const [params, options = {}] = hasParams ? args : [null, args[0]]
    const source = axios.CancelToken.source()

    const { transform = identity } = options

    const requestOptions = {
      ...(config.apiBaseURL && { baseURL: config.apiBaseURL }),
      ...options,
      transformResponse: [parse(transform)],
      cancelToken: source.token,
    }

    const makeBasicRequest = (url, requestOptions) => {
      return hasParams
        ? axios[method](url, params, requestOptions)
        : axios[method](url, requestOptions)
    }

    const request = makeBasicRequest(url, requestOptions)

    const promise = request.catch(error => {
      error.isCancel = axios.isCancel(error)

      throw error
    })

    promise.cancel = () => source.cancel()
    return promise
  }

export default {
  get: makeRequest("get"),
  post: makeRequest("post", true),
  patch: makeRequest("patch", true),
  put: makeRequest("put", true),
  delete: makeRequest("delete"),
}
