import React, { useState, useEffect, useRef } from "react"
import { useMount } from "react-use"
import { Button } from "@netdata/netdata-ui"

import { sendToIframes, useListenToPostMessage } from "utils/post-message"
import { SpacesPayload } from "utils/types"
import { useFocusDetector } from "hooks/use-focus-detector"
import { SpaceIcon } from "./components/space-icon"
import {
  ListContainer, SpacesList, SeparatedSection, SpacePlaceholder,
} from "./styled"

export const SpacesBar = () => {
  useFocusDetector()
  useMount(() => {
    sendToIframes({
      type: "hello-from-spaces-bar",
      payload: true,
    })
  })
  const spacesResult = useListenToPostMessage<SpacesPayload>("spaces")
  const spaces = spacesResult?.results

  const plusButtonRef = useRef<any>()
  useEffect(() => {
    if (spacesResult && !spacesResult.results.length) plusButtonRef.current.click()
  }, [spacesResult])

  // duplicated state! if additional logic will be added it's better to use sign-in-button
  // activeSpaceID state
  const [activeSpaceID, setActiveSpaceID] = useState<string>("")

  useEffect(() => {
    if (!activeSpaceID && spacesResult && spacesResult.results.length > 0) {
      setActiveSpaceID(spacesResult.results[0].id)
    }
  }, [activeSpaceID, spacesResult])

  const handleSpaceIconClick = (spaceID: string) => {
    setActiveSpaceID(spaceID)
    sendToIframes({
      type: "space-change",
      payload: spaceID,
    })
  }

  return (
    <ListContainer>
      <SpacesList>
        {spaces && spaces.length ? (
          spaces.map((space) => {
            const isActive = space.id === activeSpaceID
            return (
              <SpaceIcon
                onSpaceIconClick={handleSpaceIconClick}
                key={space.id}
                space={space}
                active={isActive}
              />
            )
          })
        ) : (
          <SpacePlaceholder />
        )}
      </SpacesList>

      <SeparatedSection>
        <Button
          ref={plusButtonRef}
          icon="plus"
          onClick={() => {
            window.top.window.location.href = `/spaces/${
              spaces?.[0]?.slug || "any"
            }/rooms/general?modal=createSpace`
          }}
        />
      </SeparatedSection>
    </ListContainer>
  )
}
