import React from "react"
import { useMount } from "react-use"
import { Button } from "@netdata/netdata-ui"

import { sendToIframes, useListenToPostMessage } from "utils/post-message"
import { SpacesPayload } from "utils/types"
import { SpaceIcon } from "./components/space-icon"
import {
  ListContainer, SpacesList, SeparatedSection, SpacePlaceholder,
} from "./styled"

export const SpacesBar = () => {
  useMount(() => {
    sendToIframes({
      type: "hello-from-spaces-bar",
      payload: true,
    })
  })
  const spacesResult = useListenToPostMessage<SpacesPayload>("spaces")
  const spaces = spacesResult?.results

  return (
    <ListContainer>
      <SpacesList>
        {spaces && spaces.length ? (
          spaces.map((space, i) => {
            const isActive = i === 0
            return <SpaceIcon key={i} space={space} active={isActive} />
          })
        ) : (
          <SpacePlaceholder />
        )}
      </SpacesList>

      <SeparatedSection>
        <Button
          icon="plus"
          onClick={() => {
            window.top.window.location.href = "/spaces"
          }}
        />
      </SeparatedSection>
    </ListContainer>
  )
}
