import React from "react"
import { ThemeProvider } from "styled-components"
import { DefaultTheme } from "@netdata/netdata-ui"

import { SignInButton } from "iframes/sign-in-button"
import { SpacesBar } from "iframes/space-bar"
import { SpacePanel } from "iframes/space-panel"

// const IS_DEVELOPMENT = process.env.NODE_ENV === "development"

const SIGN_IN = "sign-in"
const SPACE_PANEL = "space-panel"
const SPACE_BAR = "space-bar"

export const App = () => {
  let path = window.location.pathname.replace("/", "")
  path = path.replace("sso/", "")

  return (
    <ThemeProvider theme={DefaultTheme}>
      {path === SIGN_IN && (
        <SignInButton />
      )}
      {path === SPACE_BAR && (
        <SpacesBar />
      )}
      {path === SPACE_PANEL && (
        <SpacePanel />
      )}
    </ThemeProvider>
  )
}
