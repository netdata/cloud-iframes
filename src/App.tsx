import React from "react";
import { ThemeProvider } from "styled-components";
import { DarkTheme, DefaultTheme } from "@netdata/netdata-ui";

import { SignInButton } from "iframes/sign-in-button";
import { SpacesBar } from "iframes/space-bar";
import { SpacePanel } from "iframes/space-panel";

import SpacesBarV2 from "iframes/version2/spaceBar";
import SpacePanelV2 from "iframes/version2/spacePanel";
import SignOutV2 from 'iframes/version2/signOut'

// const IS_DEVELOPMENT = process.env.NODE_ENV === "development"

const SIGN_IN = "sign-in";
const SIGN_OUT = "sign-out"
const SPACE_PANEL = "space-panel";
const SPACE_BAR = "space-bar";

export const App = () => {
  let path = window.location.pathname.replace("/", "");
  const isVersion2 = window.location.pathname.includes("v2");

  path = path.replace("sso/", "").replace("v2/", "");

  return (
    <ThemeProvider theme={isVersion2 ? DarkTheme : DefaultTheme}>
      {path === SIGN_IN && <SignInButton />}
      {!isVersion2 && path === SPACE_BAR && <SpacesBar />}
      {!isVersion2 && path === SPACE_PANEL && <SpacePanel />}
      {isVersion2 && path === SPACE_BAR && <SpacesBarV2 />}
      {isVersion2 && path === SPACE_PANEL && <SpacePanelV2 />}
      {isVersion2 && path === SIGN_OUT && <SignOutV2 />}
    </ThemeProvider>
  );
};
