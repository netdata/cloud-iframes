import React from "react"

import { VisitedNodes } from "./components/visited-nodes"
import { ReplicatedNodes } from "./components/replicated-nodes"
import { SpaceRooms } from "./components/space-rooms"

import {
  ScrollContainer, PanelSection,
} from "./styled"

interface Props {

}
export const SpacePanel = ({

}: Props) => {
  const hasStreamedHosts = true

  return (
    <ScrollContainer>
      {hasStreamedHosts && (
        <PanelSection leading>
          <ReplicatedNodes />
        </PanelSection>
      )}
      <SpaceRooms />
      <PanelSection>
        <VisitedNodes />
      </PanelSection>
    </ScrollContainer>
  )
}
