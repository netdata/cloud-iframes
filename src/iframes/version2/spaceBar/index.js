import React, { useState, useEffect } from "react";
import { useMount } from "react-use";
import { Button, Flex } from "@netdata/netdata-ui";
import { sendToIframes, useListenToPostMessage } from "utils/post-message";
import { useFocusDetector } from "hooks/use-focus-detector";
import SpaceLabel from "./spaceLabel";

const SpacesBar = () => {
  useFocusDetector();
  useMount(() => {
    sendToIframes({
      type: "hello-from-spaces-bar",
      payload: true,
    });
  });
  const spacesResult = useListenToPostMessage("spaces");
  const spaces = spacesResult?.results;

  // duplicated state! if additional logic will be added it's better to use sign-in-button
  // activeSpaceID state
  const [activeSpaceID, setActiveSpaceID] = useState("");

  useEffect(() => {
    if (!activeSpaceID && spacesResult && !!spacesResult.results.length) {
      setActiveSpaceID(spacesResult.results[0].id);
    }
  }, [activeSpaceID, spacesResult]);

  const handleSpaceIconClick = (spaceId) => {
    setActiveSpaceID(spaceId);
    sendToIframes({
      type: "space-change",
      payload: spaceId,
    });
  };

  return (
    <Flex
      column
      justifyContent="between"
      padding={[3, 0]}
      width="64px"
      alignItems="center"
      gap={4}
      overflow="hidden"
    >
      <Flex column gap={2}  data-testid="workspaceBar-spaces-list">
        {spaces && spaces.length ? (
          spaces.map((space) => {
            const isActive = space.id === activeSpaceID;
            return (
              <SpaceLabel
                onSpaceIconClick={handleSpaceIconClick}
                key={space.id}
                space={space}
                active={isActive}
              />
            );
          })
        ) : (
          <Flex
            width="40px"
            height="40px"
            round={2}
            border={{
              side: "all",
              color: "border",
              size: "2px",
              type: "dotted",
            }}
          />
        )}
      </Flex>
      <Flex height="1px" background="separator" width="20px" />
      <Button 
        data-testid="workspaceBar-addSpace-button"
        icon="plus"
        onClick={() => {
          window.top.window.location.href = `/spaces/${
            spaces?.[0]?.slug || "any"
          }/rooms/general?modal=createSpace`;
        }}
      />
    </Flex>
  );
};

export default SpacesBar;
