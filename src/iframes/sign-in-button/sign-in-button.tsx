/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React, { useCallback, useEffect, useState } from "react"
import { useMount } from "react-use"

import { Button } from "@netdata/netdata-ui"
import { useHttp, axiosInstance } from "hooks/use-http"
import { useHttpPoll } from "hooks/use-http-poll"
import { sendToIframes, sendToParent, useListenToPostMessage } from "utils/post-message"
import {
  NodesPayload,
  RegistryMachine,
  VisitedNode,
  AlarmsCallPayload,
  Space,
  Room,
} from "utils/types"
import { getCookie } from "utils/cookies"
import { useFocusDetector } from "hooks/use-focus-detector"
import { useUserNodeAccess } from "hooks/use-user-node-access"

import { StyledButtonContainer, StyledSignInButton } from "./styles"
import optimisticallyUpdatedVisitedNodes from "./optimistically-updated-visited-nodes"

const TOKEN_EXPIRES_AT = "token_expires_at"

const cloudApiUrl = "/api/v1/"
interface AccountsMePayload {
  id: string
  email: string
  name: string
  avatarURL: string
  createdAt: string
}

const onlyUnique = <T extends unknown>(array: T[]) =>
  array.filter((value, index, self) => self.indexOf(value) === index)

export const SignInButton = () => {
  useFocusDetector()

  const cookieTokenExpiresAt = getCookie(TOKEN_EXPIRES_AT) as string
  const expiresAtDecoded = decodeURIComponent(decodeURIComponent(cookieTokenExpiresAt))
  const now = new Date().valueOf()
  const expirationDate = new Date(expiresAtDecoded).valueOf()
  const hasStillCookie = expirationDate > now

  const query = new URLSearchParams(window.location.search.substr(1))
  const disableCloud = query.get("disableCloud") === "true"

  useMount(() => {
    sendToParent({
      type: "hello-from-sign-in",
      payload: !!hasStillCookie,
    })
  })

  // always fetch account, to check if user is logged in
  const [account, resetAccount] = useHttp<AccountsMePayload>(`${cloudApiUrl}accounts/me`)
  const accoundID = account?.id

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  useEffect(() => {
    if (account) {
      setIsLoggedIn(true)
      sendToParent({ type: "is-signed-in", payload: true })
    } else {
      setIsLoggedIn(false)
      sendToParent({ type: "is-signed-in", payload: false })
    }
  }, [account])

  // wait for other iframes to init and send signal, meaning that they're waiting for data
  // when user is sign out, they are not active
  const helloFromSpacesBar = useListenToPostMessage("hello-from-spaces-bar")
  const helloFromSpacePanel = useListenToPostMessage("hello-from-space-panel")

  // fetch spaces, and send it to spaces-bar iframe
  const [spaces, resetSpaces] = useHttp<Space[]>(
    "/api/v2/spaces",
    Boolean(account) && !disableCloud
  )

  useEffect(() => {
    if (spaces && helloFromSpacesBar) {
      sendToIframes({ type: "spaces", payload: spaces })
    }
  }, [helloFromSpacesBar, spaces, helloFromSpacePanel])

  const [spaceID, setSpaceID] = useState()

  // fetch rooms of first space and send it to space-panel iframe
  const firstSpaceID = spaces?.[0]?.id
  const [rooms, resetRooms] = useHttp<Room[]>(
    `/api/v2/spaces/${spaceID || firstSpaceID}/rooms`,
    Boolean(firstSpaceID),
    spaceID
  )
  useEffect(() => {
    if (rooms && helloFromSpacePanel) {
      const currentSpace = spaces?.find(space => space.id === (spaceID || firstSpaceID))
      sendToIframes({
        type: "rooms",
        payload: { list: rooms, spaceSlug: currentSpace?.slug, spaceName: currentSpace?.name },
      })
    }
  }, [firstSpaceID, helloFromSpacePanel, spaceID, spaces, rooms])

  useListenToPostMessage("space-change", (newSpaceID: string) => {
    setSpaceID(newSpaceID)
  })

  const redirectUri = encodeURIComponent(document.referrer)
  const id = query.get("id")!
  const name = query.get("name")!
  const origin = query.get("origin")!
  const cloudSignInUrl = `/sign-in?id=${id}&name=${name}&origin=${origin}&redirect_uri=${redirectUri}`

  useUserNodeAccess({ machineGUID: id })

  // a hack to trigger /nodes call again
  const [nodesCallID, setNodesCallID] = useState()
  const fetchNodesAgain = () => {
    setNodesCallID(Math.random())
  }

  // fetch visited nodes
  const [nodes, resetNodes] = useHttp<NodesPayload>(
    `${cloudApiUrl}accounts/${account?.id}/nodes`,
    Boolean(account),
    nodesCallID // update also when it changes
  )
  useEffect(() => {
    if (nodes && helloFromSpacePanel && account) {
      const updated = optimisticallyUpdatedVisitedNodes(nodes.results, id, origin, name)
      sendToIframes({
        type: "visited-nodes",
        payload: updated,
      })
    }
  }, [account, helloFromSpacePanel, id, name, origin, nodes])

  // upsert a node
  type UpsertState = "initial" | "pending" | "fulfilled"
  const [upsertState, setUpsertState] = useState<UpsertState>("initial")
  useEffect(() => {
    if (account && nodes && origin && upsertState === "initial") {
      const currentNode = nodes.results.find(node => node.id === id)
      const nodeCurrentUrls = currentNode?.urls || []
      const nodeCurrentName = currentNode?.name || ""

      const urls = onlyUnique(nodeCurrentUrls.concat(origin).map(decodeURIComponent))
      if (urls.length === nodeCurrentUrls.length && name === nodeCurrentName) {
        setUpsertState("fulfilled")
        return
      }
      const upsertUrl = `${cloudApiUrl}accounts/${account.id}/nodes/${id}`
      setUpsertState("pending")
      axiosInstance
        .put(upsertUrl, {
          name,
          urls,
        })
        .then(() => setUpsertState("fulfilled"))
        .catch(() => fetchNodesAgain())
    }
  }, [account, upsertState, id, name, nodes, origin])

  // touch a node
  useEffect(() => {
    if (accoundID && upsertState === "fulfilled") {
      const touchUrl = `${cloudApiUrl}accounts/${accoundID}/nodes/${id}/touch`
      // no error handling is needed
      axiosInstance.post(touchUrl, {}).catch(() => fetchNodesAgain())
    }
  }, [accoundID, id, upsertState])

  // sync private registry
  const privateRegistryNodes = useListenToPostMessage<RegistryMachine[]>("synced-private-registry")
  const [privateRegistrySynced, setPrivateRegistrySynced] = useState(false)
  useEffect(() => {
    if (!privateRegistrySynced && nodes && privateRegistryNodes) {
      setPrivateRegistrySynced(true)
      Promise.all(
        privateRegistryNodes.map(privateRegistryNode => {
          const nodeID = privateRegistryNode.guid
          const nodeCurrentUrls = nodes.results.find(node => node.id === nodeID)?.urls || []
          const upsertUrl = `${cloudApiUrl}accounts/${account?.id}/nodes/${nodeID}`
          const urls = onlyUnique(
            nodeCurrentUrls.concat(privateRegistryNode.alternateUrls).map(decodeURIComponent)
          )
          return axiosInstance
            .put(upsertUrl, {
              name: privateRegistryNode.name,
              urls,
            })
            .catch(error => {
              // eslint-disable-next-line no-console
              console.warn("Error syncing visited node", privateRegistryNode.name, error)
            })
        })
      ).then(fetchNodesAgain)
    }
  }, [account, nodes, privateRegistryNodes, privateRegistrySynced])

  interface DeleteNodeRequestPayload {
    nodeID: string
    url: string
  }
  useListenToPostMessage<DeleteNodeRequestPayload>("delete-node-request", ({ nodeID, url }) => {
    const accountID = (account as AccountsMePayload).id
    if (!nodes) {
      console.warn("Error during delete-node-request, no nodes present") // eslint-disable-line
      return
    }
    const node = nodes.results.find(n => n.id === nodeID) as VisitedNode
    const nodeUrls = node.urls || []
    const newNodeUrls = nodeUrls.filter(u => u !== url)
    if (newNodeUrls.length === 0) {
      // delete node
      const deleteNodeUrl = `${cloudApiUrl}accounts/${accountID}/nodes?node_ids=${nodeID}`
      axiosInstance.delete(deleteNodeUrl).then(fetchNodesAgain)
    } else {
      const upsertUrl = `${cloudApiUrl}accounts/${account?.id}/nodes/${nodeID}`
      axiosInstance
        .put(upsertUrl, {
          name: node.name,
          urls: newNodeUrls,
        })
        .then(fetchNodesAgain)
    }
  })

  // fetch alarms indicators
  const currentSpaceID = spaceID || firstSpaceID
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (currentSpaceID) {
      const makeCall = () => {
        const getAlarmsUrl = `/api/v2/spaces/${currentSpaceID}/alarms`
        axiosInstance.get<AlarmsCallPayload>(getAlarmsUrl).then(({ data: alarms }) => {
          sendToIframes({
            type: "alarms",
            payload: alarms.results,
          })
        })
      }
      const intervalId = setInterval(() => {
        makeCall()
      }, 10_000)
      makeCall()

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [currentSpaceID])

  // logout handling
  const [isMakingLogout, setIsMakingLogout] = useState(false)
  const handleLogoutClick = useCallback(() => {
    const logoutUrl = `${cloudApiUrl}auth/account/logout`
    setIsMakingLogout(true)
    axiosInstance
      .post(logoutUrl, {})
      .then(() => {
        setIsMakingLogout(true)
        resetAccount()
        resetSpaces()
        resetRooms()
        resetNodes()
        setIsLoggedIn(false)
      })
      .catch(e => {
        console.warn("error during logout", e) // eslint-disable-line no-console
        setIsMakingLogout(false)
      })
  }, [resetAccount, resetNodes, resetRooms, resetSpaces])

  useListenToPostMessage("sign-out", handleLogoutClick)

  return (
    <StyledButtonContainer>
      {isLoggedIn ? (
        <Button isLoading={isMakingLogout} label="Sign out" onClick={handleLogoutClick} />
      ) : (
        <StyledSignInButton href={cloudSignInUrl} target="_blank">
          SIGN-IN
        </StyledSignInButton>
      )}
    </StyledButtonContainer>
  )
}
