import axios from "axios"
import { renderHook } from "@testing-library/react-hooks"

import { sendToParent } from "../utils/post-message"
import { AgentMessagePayload, useUserNodeAccess } from "./use-user-node-access"

jest.mock("axios")
jest.mock("../utils/post-message", () => ({
  sendToParent: jest.fn(),
}))

const mockedAxios = axios as jest.Mocked<typeof axios>

const machineGUID = "12345"

const noCookieError = {
  response: {
    data: {
      errorCode: "YDaYDPkXNV-696384",
      errorMsgKey: "ErrUnauthenticated",
      errorMessage: "no cookie",
    },
    status: 401,
  },
}

const resolve = <T>(x: T) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve({ data: x })
    })
  })

const reject = <T>(x: T) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(x)
    })
  })

const userAccessUrl = `/api/v1/agents/${machineGUID}/user_access`
const infoUrl = `/api/v1/agents/${machineGUID}/info`
const wrapMessage = (payload: AgentMessagePayload) => ({ type: "user-node-access", payload })

describe("use-user-node-access", () => {
  it("doesn't call any api without machineGUID", () => {
    const { result } = renderHook(() => useUserNodeAccess({ machineGUID: null }))
    console.log("result", result) // eslint-disable-line no-console
    expect(axios.get).toBeCalledTimes(0)
  })
  it("makes userAccess and info calls given machineGUID", () => {
    mockedAxios.get.mockResolvedValue({})
    renderHook(() => useUserNodeAccess({ machineGUID }))
    expect(axios.get).toBeCalledTimes(2)
  })
  it.only("handles user with no cookie", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === userAccessUrl) return reject(noCookieError)
      return resolve({})
    })
    const { result, waitForNextUpdate } = renderHook(() => useUserNodeAccess({ machineGUID }))
    await waitForNextUpdate()
    expect(sendToParent).toHaveBeenCalledTimes(1)
    expect(sendToParent).toHaveBeenCalledWith(
      wrapMessage({
        userStatus: "UNKNOWN",
      })
    )
  })
})
