import React, { useCallback, useEffect, useState } from "react"
import { useMount } from "react-use"

import { Button } from "@netdata/netdata-ui"
import { useHttp, axiosInstance } from "hooks/use-http"
import { sendToIframes, sendToParent, useListenToPostMessage } from "utils/post-message"
import {
  NodesPayload, RoomsPayload, SpacesPayload, RegistryMachine, VisitedNode,
} from "utils/types"
import { getCookie } from "utils/cookies"
import { useFocusDetector } from "hooks/use-focus-detector"

import { StyledButtonContainer, StyledSignInButton } from "./styles"

const TOKEN_EXPIRES_AT = "token_expires_at"

const cloudApiUrl = "/api/v1/"
interface AccountsMePayload {
  id: string
  email: string
  name: string
  avatarURL: string
  createdAt: string
}

const onlyUnique = <T extends unknown>(array: T[]) => array
  .filter((value, index, self) => self.indexOf(value) === index)

export const SignInButton = () => {
  useFocusDetector()

  const cookieTokenExpiresAt = getCookie(TOKEN_EXPIRES_AT) as string
  const expiresAtDecoded = decodeURIComponent(
    decodeURIComponent(cookieTokenExpiresAt),
  )
  const now = new Date().valueOf()
  const expirationDate = new Date(expiresAtDecoded).valueOf()
  const hasStillCookie = expirationDate > now

  useMount(() => {
    sendToParent({
      type: "hello-from-sign-in",
      payload: !!hasStillCookie,
    })
  })


  // always fetch account, to check if user is logged in
  const [account, resetAccount] = useHttp<AccountsMePayload>(
    `${cloudApiUrl}accounts/me`,
  )
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
  const [spaces, resetSpaces] = useHttp<SpacesPayload>(
    `${cloudApiUrl}spaces`,
    Boolean(account),
  )
  useEffect(() => {
    if (spaces && helloFromSpacesBar) {
      sendToIframes({ type: "spaces", payload: spaces })
    }
  }, [helloFromSpacesBar, spaces])


  const [spaceID, setSpaceID] = useState()

  // fetch rooms of first space and send it to space-panel iframe
  const firstSpaceId = spaces?.results[0]?.id
  const [rooms, resetRooms] = useHttp<RoomsPayload>(
    `${cloudApiUrl}spaces/${spaceID || firstSpaceId}/rooms`,
    Boolean(firstSpaceId),
  )
  useEffect(() => {
    if (rooms && helloFromSpacePanel) {
      const currentSpace = spaces?.results.find((space) => space.id === (spaceID || firstSpaceId))
      sendToIframes({
        type: "rooms",
        payload: { ...rooms, spaceSlug: currentSpace?.slug, spaceName: currentSpace?.name },
      })
    }
  }, [firstSpaceId, helloFromSpacePanel, spaceID, spaces, rooms])


  useListenToPostMessage("space-change", (newSpaceID: string) => {
    setSpaceID(newSpaceID)
  })


  const redirectUri = encodeURIComponent(document.referrer)
  const query = new URLSearchParams(window.location.search.substr(1))
  const id = query.get("id")
  const name = query.get("name")
  const origin = query.get("origin")
  const cloudSignInUrl = "/sign-in"
    + `?id=${id}&name=${name}&origin=${origin}&redirect_uri=${redirectUri}`


  // touch a node
  useEffect(() => {
    if (accoundID) {
      const touchUrl = `${cloudApiUrl}accounts/${accoundID}/nodes/${id}/touch`
      // no error handling is needed
      axiosInstance.post(touchUrl, {})
    }
  }, [accoundID, id])


  // a hack to trigger /nodes call again
  const [nodesCallID, setNodesCallID] = useState()
  const fetchNodesAgain = () => {
    setNodesCallID(Math.random())
  }


  // fetch visited nodes
  const [nodes, resetNodes] = useHttp<NodesPayload>(
    `${cloudApiUrl}accounts/${account?.id}/nodes`,
    Boolean(account),
    nodesCallID, // update also when it changes
  )
  useEffect(() => {
    if (nodes && helloFromSpacePanel && account) {
      sendToIframes({
        type: "visited-nodes",
        payload: nodes.results,
      })
    }
  }, [account, helloFromSpacePanel, nodes])


  // upsert a node
  const [doneUpsert, setDoneUpsert] = useState(false)
  useEffect(() => {
    if (account && nodes && origin && !doneUpsert) {
      setDoneUpsert(true)
      const nodeCurrentUrls = nodes.results.find((node) => node.id === id)?.urls || []
      const urls = onlyUnique(
        nodeCurrentUrls.concat(origin).map(decodeURIComponent),
      )
      if (urls.length === nodeCurrentUrls.length) {
        return
      }
      const upsertUrl = `${cloudApiUrl}accounts/${account.id}/nodes/${id}`
      axiosInstance.put(upsertUrl, {
        name,
        urls,
      }).then(() => {
        fetchNodesAgain()
      })
    }
  }, [account, doneUpsert, id, name, nodes, origin])


  // sync private registry
  const privateRegistryNodes = useListenToPostMessage<RegistryMachine[]>("synced-private-registry")
  const [privateRegistrySynced, setPrivateRegistrySynced] = useState(false)
  useEffect(() => {
    if (!privateRegistrySynced && nodes && privateRegistryNodes) {
      setPrivateRegistrySynced(true)
      Promise.all(privateRegistryNodes.map((privateRegistryNode) => {
        const nodeID = privateRegistryNode.guid
        const nodeCurrentUrls = nodes.results
          .find((node) => node.id === nodeID)?.urls || []
        const upsertUrl = `${cloudApiUrl}accounts/${account?.id}/nodes/${nodeID}`
        const urls = onlyUnique(
          nodeCurrentUrls.concat(privateRegistryNode.alternateUrls).map(decodeURIComponent),
        )
        return axiosInstance.put(upsertUrl, {
          name: privateRegistryNode.name,
          urls,
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.warn("Error syncing visited node", privateRegistryNode.name, error)
        })
      })).then(() => {
        fetchNodesAgain()
      })
    }
  }, [account, nodes, privateRegistryNodes, privateRegistrySynced])


  interface DeleteNodeRequestPayload { nodeID: string, url: string }
  useListenToPostMessage<DeleteNodeRequestPayload>("delete-node-request", ({ nodeID, url }) => {
    const accountID = (account as AccountsMePayload).id
    if (!nodes) {
      console.warn("Error during delete-node-request, no nodes present") // eslint-disable-line
      return
    }
    const node = nodes.results.find((n) => n.id === nodeID) as VisitedNode
    const nodeUrls = node.urls || []
    const newNodeUrls = nodeUrls.filter((u) => u !== url)
    if (newNodeUrls.length === 0) {
      // delete node
      const deleteNodeUrl = `${cloudApiUrl}accounts/${accountID}/nodes?node_ids=${nodeID}`
      axiosInstance.delete(deleteNodeUrl)
        .then(() => { fetchNodesAgain() })
    } else {
      const upsertUrl = `${cloudApiUrl}accounts/${account?.id}/nodes/${nodeID}`
      axiosInstance.put(upsertUrl, {
        name: node.name,
        urls: newNodeUrls,
      }).then(() => { fetchNodesAgain() })
    }
  })

  // logout handling
  const [isMakingLogout, setIsMakingLogout] = useState(false)
  const handleLogoutClick = useCallback(() => {
    const logoutUrl = `${cloudApiUrl}auth/account/logout`
    setIsMakingLogout(true)
    axiosInstance.post(logoutUrl, {})
      .then(() => {
        setIsMakingLogout(true)
        resetAccount()
        resetSpaces()
        resetRooms()
        resetNodes()
        setIsLoggedIn(false)
      }).catch((e) => {
        console.warn("error during logout", e) // eslint-disable-line no-console
        setIsMakingLogout(false)
      })
  }, [resetAccount, resetNodes, resetRooms, resetSpaces])


  return (
    <StyledButtonContainer>
      {isLoggedIn
        ? (
          <Button
            isLoading={isMakingLogout}
            label="Sign out"
            onClick={handleLogoutClick}
          />
        ) : (
          <StyledSignInButton
            href={cloudSignInUrl}
            target="_PARENT"
          >
            SIGN-IN
          </StyledSignInButton>
        )}
    </StyledButtonContainer>
  )
}
