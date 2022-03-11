import axios from "axios"
import { renderHook } from "@testing-library/react-hooks"

import { sendToParent } from "../utils/post-message"
import {
  AgentInfoPayload,
  AgentMessagePayload,
  UserAccessPayload,
  useUserNodeAccess,
} from "./use-user-node-access"

jest.mock("axios")
jest.mock("../utils/post-message", () => ({
  sendToParent: jest.fn(),
  useListenToPostMessage: jest.fn(),
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

const expiredHasAccessResponse: UserAccessPayload = {
  userStatus: "expiredLogin",
  userNodeStatus: "accessOK",
  authorizedNodeIDs: [],
}
const expiredNoAccessResponse: UserAccessPayload = {
  userStatus: "expiredLogin",
  userNodeStatus: "noAccess",
  authorizedNodeIDs: [],
}
const hasAccessResponse: UserAccessPayload = {
  userStatus: "loggedIn",
  userNodeStatus: "accessOK",
  authorizedNodeIDs: [],
}
const noAccessResponse: UserAccessPayload = {
  userStatus: "loggedIn",
  userNodeStatus: "noAccess",
  authorizedNodeIDs: [],
}

const agentInfoClaimed: AgentInfoPayload = {
  claimed: true,
  reachable: true,
}

const agentInfoNotClaimed: AgentInfoPayload = {
  claimed: false,
  reachable: true,
}

const agentInfoClaimedNotReachable: AgentInfoPayload = {
  claimed: true,
  reachable: false,
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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("doesn't call any api without machineGUID", () => {
    renderHook(() => useUserNodeAccess({ machineGUID: null }))
    expect(axios.get).toBeCalledTimes(0)
  })

  it("makes userAccess and info calls given machineGUID", () => {
    mockedAxios.get.mockResolvedValue({})
    renderHook(() => useUserNodeAccess({ machineGUID }))
    expect(axios.get).toBeCalledTimes(2)
  })

  it("handles user with no cookie", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === userAccessUrl) return reject(noCookieError)
      return resolve(agentInfoClaimed)
    })
    const { result, waitForNextUpdate } = renderHook(() => useUserNodeAccess({ machineGUID }))
    await waitForNextUpdate()
    expect(sendToParent).toHaveBeenCalledTimes(1)
    expect(sendToParent).toHaveBeenCalledWith(
      wrapMessage({
        userStatus: "UNKNOWN",
        nodeClaimedStatus: "CLAIMED",
        nodeLiveness: "LIVE",
        userNodeAccess: "NO_ACCESS",
      })
    )
  })

  it("handles user with expired cookie but with access to node", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === userAccessUrl) return resolve(expiredHasAccessResponse)
      return resolve(agentInfoClaimed)
    })
    const { waitForNextUpdate } = renderHook(() => useUserNodeAccess({ machineGUID }))
    await waitForNextUpdate()
    expect(sendToParent).toHaveBeenCalledTimes(1)
    expect(sendToParent).toHaveBeenCalledWith(
      wrapMessage({
        userStatus: "EXPIRED_LOGIN",
        nodeClaimedStatus: "CLAIMED",
        nodeLiveness: "LIVE",
        userNodeAccess: "ACCESS_OK",
      })
    )
  })

  it("handles user with expired cookie, no access to node", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === userAccessUrl) return resolve(expiredNoAccessResponse)
      return resolve(agentInfoNotClaimed)
    })
    const { waitForNextUpdate } = renderHook(() => useUserNodeAccess({ machineGUID }))
    await waitForNextUpdate()
    expect(sendToParent).toHaveBeenCalledTimes(1)
    expect(sendToParent).toHaveBeenCalledWith(
      wrapMessage({
        userStatus: "EXPIRED_LOGIN",
        nodeClaimedStatus: "NOT_CLAIMED",
        nodeLiveness: "LIVE",
        userNodeAccess: "NO_ACCESS",
      })
    )
  })

  it("handles user with no access to claimed node", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === userAccessUrl) return resolve(noAccessResponse)
      return resolve(agentInfoClaimed)
    })
    const { waitForNextUpdate } = renderHook(() => useUserNodeAccess({ machineGUID }))
    await waitForNextUpdate()
    expect(sendToParent).toHaveBeenCalledTimes(1)
    expect(sendToParent).toHaveBeenCalledWith(
      wrapMessage({
        userStatus: "LOGGED_IN",
        nodeClaimedStatus: "CLAIMED",
        nodeLiveness: "LIVE",
        userNodeAccess: "NO_ACCESS",
      })
    )
  })

  it("handles user with no access to not claimed node", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === userAccessUrl) return resolve(noAccessResponse)
      return resolve(agentInfoNotClaimed)
    })
    const { waitForNextUpdate } = renderHook(() => useUserNodeAccess({ machineGUID }))
    await waitForNextUpdate()
    expect(sendToParent).toHaveBeenCalledTimes(1)
    expect(sendToParent).toHaveBeenCalledWith(
      wrapMessage({
        userStatus: "LOGGED_IN",
        nodeClaimedStatus: "NOT_CLAIMED",
        nodeLiveness: "LIVE",
        userNodeAccess: "NO_ACCESS",
      })
    )
  })

  it("handles user with access to claimed node", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === userAccessUrl) return resolve(hasAccessResponse)
      return resolve(agentInfoClaimed)
    })
    const { waitForNextUpdate } = renderHook(() => useUserNodeAccess({ machineGUID }))
    await waitForNextUpdate()
    expect(sendToParent).toHaveBeenCalledTimes(1)
    expect(sendToParent).toHaveBeenCalledWith(
      wrapMessage({
        userStatus: "LOGGED_IN",
        nodeClaimedStatus: "CLAIMED",
        nodeLiveness: "LIVE",
        userNodeAccess: "ACCESS_OK",
      })
    )
  })

  it("handles user with access to unreachable node", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === userAccessUrl) return resolve(hasAccessResponse)
      return resolve(agentInfoClaimedNotReachable)
    })
    const { waitForNextUpdate } = renderHook(() => useUserNodeAccess({ machineGUID }))
    await waitForNextUpdate()
    expect(sendToParent).toHaveBeenCalledTimes(1)
    expect(sendToParent).toHaveBeenCalledWith(
      wrapMessage({
        userStatus: "LOGGED_IN",
        nodeClaimedStatus: "CLAIMED",
        nodeLiveness: "NOT_LIVE",
        userNodeAccess: "ACCESS_OK",
      })
    )
  })
})
