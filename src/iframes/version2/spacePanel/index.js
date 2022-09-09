import React from "react"
import { useMount } from "react-use"
import { H4 } from "@netdata/netdata-ui"
import { useFocusDetector } from "hooks/use-focus-detector"
import { sendToParent, sendToIframes, useListenToPostMessage } from "utils/post-message"
import SpaceRooms from "./rooms"
import ReplicatedNodes from "./nodes/replicatedNodes"
import VisitedNodes from "./nodes/visitedNodes"
import { Container } from "./styled"

const SpacePanel = () => {
  useFocusDetector()

  useMount(() => {
    sendToIframes({
      type: "hello-from-space-panel",
      payload: true,
    })
    sendToParent({
      type: "hello-from-space-panel",
      payload: true,
    })
  })

  const rooms = useListenToPostMessage("rooms")
  const streamedHostsData = useListenToPostMessage("streamed-hosts-data")
  const visitedNodes = useListenToPostMessage("visited-nodes")
  const alarms = useListenToPostMessage("alarms") || []
  const spaces = useListenToPostMessage("spaces")

  const handleDeleteNode = (nodeID, url) => {
    sendToIframes({
      type: "delete-node-request",
      payload: { nodeID, url },
    })
  }

  return (
    <Container flex overflow={{ vertical: "auto", horizontal: "hidden" }} column>
      {rooms && <H4>{rooms.spaceName}</H4>}
      {rooms && !!rooms.list.length && <SpaceRooms rooms={rooms} alarms={alarms} />}
      {streamedHostsData && !!streamedHostsData.replicatedNodes.length && (
        <ReplicatedNodes replicatedNodes={streamedHostsData} />
      )}
      {visitedNodes && visitedNodes.length > 0 && (
        <VisitedNodes
          onDeleteClick={handleDeleteNode}
          visitedNodes={visitedNodes}
          spaces={spaces}
        />
      )}
    </Container>
  )
}

export default SpacePanel
