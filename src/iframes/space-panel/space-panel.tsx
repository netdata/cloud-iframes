import React from "react"
import { useMount } from "react-use"

import { sendToParent, sendToIframes, useListenToPostMessage } from "utils/post-message"
import { VisitedNodes as VisitedNodesT, RoomsMessagePayload } from "utils/types"
import { useFocusDetector } from "hooks/use-focus-detector"

import { VisitedNodes } from "./components/visited-nodes"
import { ReplicatedNodes } from "./components/replicated-nodes"
import { SpaceRooms } from "./components/space-rooms"

import {
  ScrollContainer, PanelSection, PanelHeader,
} from "./styled"


interface StreamedHostsData {
  masterNodeName: string,
  masterNodeUrl: string,
  streamedHosts: { hostname: string, url: string }[],
}

export const SpacePanel = () => {
  useFocusDetector()

  useMount(() => {
    sendToIframes({
      type: "hello-from-space-panel",
      payload: true,
    })
  })
  const roomsResult = useListenToPostMessage<RoomsMessagePayload>("rooms")

  useMount(() => {
    sendToParent({
      type: "hello-from-space-panel",
      payload: true,
    })
  })

  const streamedHostsData = useListenToPostMessage<StreamedHostsData>("streamed-hosts-data")
  const visitedNodes = useListenToPostMessage<VisitedNodesT>("visited-nodes")

  const handleDeleteNode = (nodeId: string) => {
    sendToIframes({
      type: "delete-node-request",
      payload: nodeId,
    })
  }

  return (
    <ScrollContainer>
      {roomsResult && (
        <PanelHeader>
          {roomsResult.spaceName}
        </PanelHeader>
      )}
      {roomsResult && roomsResult.results.length > 0 && (
        <PanelSection leading>
          <SpaceRooms roomsResult={roomsResult} />
        </PanelSection>
      )}
      {streamedHostsData && streamedHostsData.streamedHosts.length > 0 && (
        <PanelSection leading={!roomsResult?.results.length}>
          <ReplicatedNodes streamedHostsData={streamedHostsData} />
        </PanelSection>
      )}
      {visitedNodes && (visitedNodes.length > 0) && (
        <PanelSection>
          <VisitedNodes
            onDeleteClick={handleDeleteNode}
            visitedNodes={visitedNodes}
          />
        </PanelSection>
      )}
    </ScrollContainer>
  )
}
