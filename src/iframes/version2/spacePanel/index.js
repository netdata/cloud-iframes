import React from "react";
import { useMount } from "react-use";
import { Flex, H4 } from "@netdata/netdata-ui";
import { useFocusDetector } from "hooks/use-focus-detector";
import SpaceRooms from "./rooms";
import ReplicatedNodes from "./nodes/replicatedNodes";
import VisitedNodes from "./nodes/visitedNodes";
import {
  sendToParent,
  sendToIframes,
  useListenToPostMessage,
} from "utils/post-message";

const SpacePanel = () => {
  useFocusDetector();

  useMount(() => {
    sendToIframes({
      type: "hello-from-space-panel",
      payload: true,
    });
    sendToParent({
      type: "hello-from-space-panel",
      payload: true,
    });
  });

  const rooms = useListenToPostMessage("rooms");
  const streamedHostsData = useListenToPostMessage("streamed-hosts-data");
  const visitedNodes = useListenToPostMessage("visited-nodes");
  const alarms = useListenToPostMessage("alarms") || [];

  const handleDeleteNode = (nodeId, url) => {
    sendToIframes({
      type: "delete-node-request",
      payload: { nodeId, url },
    });
  };

  return (
    <Flex flex overflow={{ vertical: "auto", horizontal: "hidden" }} column>
      {rooms && <H4>{rooms.spaceName}</H4>}
      {rooms && !!rooms.results.length && (
        <SpaceRooms rooms={rooms} alarms={alarms} />
      )}
      {streamedHostsData && !!streamedHostsData.replicatedNodes.length && (
        <ReplicatedNodes replicatedNodes={streamedHostsData} />
      )}
      {visitedNodes && visitedNodes.length > 0 && (
        <VisitedNodes
          onDeleteClick={handleDeleteNode}
          visitedNodes={visitedNodes}
        />
      )}
    </Flex>
  );
};

export default SpacePanel;
