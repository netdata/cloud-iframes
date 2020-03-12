import React, { useCallback, useEffect, useState } from "react"

import { Button } from "@netdata/netdata-ui"
import { useHttp, axiosInstance } from "hooks/use-http"
import { sendToIframes, sendToParent, useListenToPostMessage } from "utils/post-message"
import { SpacesPayload } from "utils/api"

import { StyledButtonContainer, StyledSignInButton } from "./styles"

const cloudApiUrl = "/api/v1/"
interface AccountsMePayload {
  id: string
  email: string
  name: string
  avatarURL: string
  createdAt: string
}

const redirectUri = encodeURIComponent(document.referrer)
const cloudSignInUrl = `/sign-in?redirect_uri=${redirectUri}`


export const SignInButton = () => {
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
  const [rooms, resetRooms] = useHttp(
    `${cloudApiUrl}spaces/${firstSpaceId}/rooms`,
    Boolean(firstSpaceId),
  )
  useEffect(() => {
    if (rooms && helloFromSpacePanel) {
      sendToIframes({ type: "rooms", payload: rooms })
    }
  }, [helloFromSpacePanel, rooms])


  // logout handling
  const [isMakingLogout, setIsMakingLogout] = useState(false)
  const handleLogoutClick = useCallback(() => {
    console.log("logout") // eslint-disable-line
    const logoutUrl = `${cloudApiUrl}auth/account/logout`
    setIsMakingLogout(true)
    axiosInstance.post(logoutUrl, {})
      .then(() => {
        console.log("logout done") // eslint-disable-line
        setIsMakingLogout(true)
        resetAccount()
        resetSpaces()
        resetRooms()
        setIsLoggedIn(false)
      }).catch((e) => {
        console.warn("error during logout", e) // eslint-disable-line no-console
        setIsMakingLogout(false)
      })
  }, [resetAccount, resetRooms, resetSpaces])


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
            {isLoggedIn ? "LOGOUT" : "SIGN-IN"}
          </StyledSignInButton>
        )}
    </StyledButtonContainer>
  )
}
