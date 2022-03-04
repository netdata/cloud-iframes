import { cloudApiUrl } from "utils/constants"
import { useHttp } from "./use-http"
import { useCallback, useEffect, useMemo } from "react"
import { sendToParent } from "../utils/post-message"

type NodeClaimedStatus = "NOT_CLAIMED" | "UNKNOWN" | "CLAIMED" | "NO_ACCESS"
type UserNodeAccess = "NO_ACCESS" | "ACCESS_OK"
type UserPreference = "AGENT" | "CLOUD" | "UNDEFINED"
type CTATYPE = "NAVIGATE" | "REFRESH"

type UserStatus = "LOGGED_IN" | "LOGGED_OUT" | "UNKNOWN"
type NodeLiveness = "LIVE" | "NOT_LIVE"

// on 401
type errorPayload = {
  errorCode: "YDaYDPkXNV-696384"
  errorMsgKey: "ErrUnauthenticated"
  errorMessage: "no cookie"
}

type userAccessPayload = {
  userNodeStatus: "accessOK" | "noAccess"
  authorizedNodeIDs: string[]
}

export type AgentMessagePayload = {
  userStatus: UserStatus
}

export const useUserNodeAccess = ({ machineGUID }: { machineGUID: null | string }) => {
  const [userAccess, , , userAccessError] = useHttp(
    `${cloudApiUrl}agents/${machineGUID}/user_access`,
    Boolean(machineGUID)
  )
  const [agentInfo, , , agentInfoError] = useHttp(
    `${cloudApiUrl}agents/${machineGUID}/info`,
    Boolean(machineGUID)
  )
  const message2Agent = useMemo(() => {
    if ((!userAccess && !userAccessError) || !agentInfo) return
    return {
      userStatus: "UNKNOWN",
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
