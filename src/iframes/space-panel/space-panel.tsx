import React from "react"
import { useMount } from "react-use"

import { sendToParent, sendToIframes, useListenToPostMessage } from "utils/post-message"
import { NodesPayload, RoomsPayload } from "utils/api"

import { VisitedNodes } from "./components/visited-nodes"
import { ReplicatedNodes } from "./components/replicated-nodes"
import { SpaceRooms } from "./components/space-rooms"

import {
  ScrollContainer, PanelSection,
} from "./styled"


interface StreamedHostsData {
  masterNodeName: string,
  masterNodeUrl: string,
  streamedHosts: { hostname: string, url: string }[],
}

export const SpacePanel = () => {
  useMount(() => {
    sendToIframes({
      type: "hello-from-space-panel",
      payload: true,
    })
  })
  const roomsResult = useListenToPostMessage<RoomsPayload>("rooms")

  useMount(() => {
    sendToParent({
      type: "hello-from-space-panel",
      payload: true,
    })
  })

  const streamedHostsData = useListenToPostMessage<StreamedHostsData>("streamed-hosts-data")
  const visitedNodes = useListenToPostMessage<NodesPayload>("visited-nodes")

  return (
    <ScrollContainer>
      {streamedHostsData && streamedHostsData.streamedHosts.length > 0 && (
        <PanelSection leading>
          <ReplicatedNodes streamedHostsData={streamedHostsData} />
        </PanelSection>
      )}
      {roomsResult && roomsResult.results.length > 0 && (
        <PanelSection>
          <SpaceRooms roomsResult={roomsResult} />
        </PanelSection>
      )}
      {visitedNodes && visitedNodes.length && (
        <PanelSection>
          <VisitedNodes visitedNodes={visitedNodes} />
        </PanelSection>
      )}
    </ScrollContainer>
  )
}
