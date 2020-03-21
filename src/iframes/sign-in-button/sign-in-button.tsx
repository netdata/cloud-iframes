import React, { useCallback, useEffect, useState } from "react"
import { useMount } from "react-use"

import { Button } from "@netdata/netdata-ui"
import { useHttp, axiosInstance } from "hooks/use-http"
import { sendToIframes, sendToParent, useListenToPostMessage } from "utils/post-message"
import { NodesPayload, RoomsPayload, SpacesPayload } from "utils/types"
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


  // fetch rooms of first space and send it to space-panel iframe
  const firstSpaceId = spaces?.results[0]?.id
  const [rooms, resetRooms] = useHttp<RoomsPayload>(
    `${cloudApiUrl}spaces/${firstSpaceId}/rooms`,
    Boolean(firstSpaceId),
  )
  useEffect(() => {
    if (rooms && helloFromSpacePanel) {
      sendToIframes({
        type: "rooms",
        payload: { ...rooms, spaceSlug: spaces?.results[0]?.slug },
      })
    }
  }, [helloFromSpacePanel, spaces, rooms])


  const redirectUri = encodeURIComponent(document.referrer)
  const query = new URLSearchParams(window.location.search.substr(1))
  const id = query.get("id")
  const name = query.get("name")
  const origin = query.get("origin")
  const cloudSignInUrl = "/sign-in"
    + `?id=${id}&name=${name}&origin=${origin}&redirect_uri=${redirectUri}`


  // upsert a node
  // a hack to trigger /nodes call again
  const [nodesCallID, setNodesCallID] = useState()
  const fetchNodesAgain = () => {
    setNodesCallID(Math.random())
  }
  useEffect(() => {
    if (account) {
      const upserUrl = `${cloudApiUrl}/accounts/${account.id}/nodes/${id}`
      axiosInstance.put(upserUrl, {
        name,
        urls: [origin],
      }).then(() => {
        fetchNodesAgain()
      })
    }
  }, [account, id, name, origin])


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


  useListenToPostMessage("delete-node-request", (nodeId) => {
    const accountID = (account as AccountsMePayload).id
    const deleteNodeUrl = `${cloudApiUrl}accounts/${accountID}/nodes?node_ids=${nodeId}`
    axiosInstance.delete(deleteNodeUrl)
      .then(() => {
        fetchNodesAgain()
      })
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
            label="LOGOUT"
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
