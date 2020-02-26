import React from "react"
import { ThemeProvider } from "styled-components"
import { DefaultTheme } from "@netdata/netdata-ui"

import { SpaceBar } from "iframes/space-bar"
import { SpacePanel } from "iframes/space-panel"

const SPACE_PANEL = "space-panel"
const SPACE_BAR = "space-bar"

export const App = () => {
  const path = window.location.pathname.replace("/", "")
  return (
    <ThemeProvider theme={DefaultTheme}>
      {path === SPACE_BAR && (
        <SpaceBar />
      )}
      {path === SPACE_PANEL && (
        <SpacePanel />
      )}
    </ThemeProvider>
  )
}
