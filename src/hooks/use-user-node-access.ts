import { cloudApiUrl } from "utils/constants"
import { useHttp } from "./use-http"
import { useEffect, useMemo } from "react"
import { sendToParent } from "../utils/post-message"

type NodeClaimedStatus = "NOT_CLAIMED" | "CLAIMED"
type UserNodeAccess = "NO_ACCESS" | "ACCESS_OK"
type UserStatus = "LOGGED_IN" | "EXPIRED_LOGIN" | "UNKNOWN"
type NodeLiveness = "LIVE" | "NOT_LIVE"

// on 401
type ErrorUserUnknown = {
  errorCode: string
  errorMsgKey: "ErrUnauthenticated"
  errorMessage: "no cookie"
}

export type UserAccessPayload = {
  userStatus: "loggedIn" | "expiredLogin"
  userNodeStatus: "accessOK" | "noAccess"
  authorizedNodeIDs: string[]
}

export type AgentInfoPayload = {
  claimed: boolean
  reachable: boolean
}

export type AgentMessagePayload = {
  userStatus: UserStatus
  nodeClaimedStatus: NodeClaimedStatus
  nodeLiveness: NodeLiveness
  userNodeAccess: UserNodeAccess
}

export const useUserNodeAccess = ({ machineGUID }: { machineGUID: null | string }) => {
  const [userAccess, , , userAccessError] = useHttp<UserAccessPayload>(
    `${cloudApiUrl}agents/${machineGUID}/user_access`,
    Boolean(machineGUID)
  )
  const [agentInfo, , , agentInfoError] = useHttp<AgentInfoPayload>(
    `${cloudApiUrl}agents/${machineGUID}/info`,
    Boolean(machineGUID)
  )
  const message2Agent = useMemo((): AgentMessagePayload | void => {
    if ((!userAccess && !userAccessError) || !agentInfo) return

    let userStatus: UserStatus
    if (userAccess?.userStatus === "loggedIn") userStatus = "LOGGED_IN"
    else if (userAccess?.userStatus === "expiredLogin") userStatus = "EXPIRED_LOGIN"
    else userStatus = "UNKNOWN"

    const nodeClaimedStatus: NodeClaimedStatus = agentInfo.claimed ? "CLAIMED" : "NOT_CLAIMED"
    const userNodeAccess: UserNodeAccess =
      userAccess?.userNodeStatus === "accessOK" ? "ACCESS_OK" : "NO_ACCESS"

    const nodeLiveness: NodeLiveness = agentInfo.reachable ? "LIVE" : "NOT_LIVE"

    return {
      userStatus,
      nodeClaimedStatus,
      nodeLiveness,
      userNodeAccess,
    }
  }, [userAccess, userAccessError, agentInfo])
  useEffect(() => {
    if (message2Agent) {
      sendToParent({
        type: "user-node-access",
        payload: message2Agent,
      })
    }
  }, [message2Agent])
}
