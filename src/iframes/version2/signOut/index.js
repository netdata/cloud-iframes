import React, { useCallback } from "react";
import styled from "styled-components";
import { Text } from "@netdata/netdata-ui";
import { useFocusDetector } from "hooks/use-focus-detector";
import { sendToIframes } from "utils/post-message";

const Button = styled(Text)`
  cursor: pointer;
`;

const SignOut = () => {
  useFocusDetector();

  const signOut = useCallback(() => {
    sendToIframes({ type: "sign-out", payload: true });
  }, []);

  return <Button onClick={signOut}>Sign out</Button>;
};

export default SignOut;
