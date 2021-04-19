import React, { useCallback } from "react";
import styled from "styled-components";
import { Text, Button } from "@netdata/netdata-ui";
import { useFocusDetector } from "hooks/use-focus-detector";
import { sendToIframes } from "utils/post-message";

const TextButton = styled(Text).attrs({ role: "button" })`
  cursor: pointer;
`;

const SignOut = () => {
  useFocusDetector();

  const query = new URLSearchParams(window.location.search.substr(1));
  const buttonType = query.get("type");

  const signOut = useCallback(() => {
    sendToIframes({ type: "sign-out", payload: true });
  }, []);

  return buttonType !== "borderless" ? (
    <Button
      onClick={signOut}
      flavour={buttonType || "default"}
      label="SIGN OUT"
    />
  ) : (
    <TextButton onClick={signOut}>Sign Out</TextButton>
  );
};

export default SignOut;
