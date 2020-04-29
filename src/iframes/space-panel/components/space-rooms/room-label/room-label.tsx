import React from "react"
import {
  StyledIcon,
  Container,
  RoomName,
  IndicatorsContainer,
  ErrorIndicator,
  WarningIndicator,
  UnreachableIndicator,
} from "./styled"

interface Props {
  alarmCounter: {
    critical: number
    warning: number
  } | undefined
  unreachableCount: number
  room: any
  spaceSlug: string
}

export const RoomLabel = ({
  alarmCounter, room, spaceSlug, unreachableCount,
}: Props) => {
  const handleSelectRoom = () => {
    // navigate to cloud room
  }
  const href = `/spaces/${spaceSlug}/rooms/${room.slug}`

  return (
    <Container onClick={handleSelectRoom}>
      <StyledIcon name="room" />
      <RoomName href={href} target="_PARENT">
        {room.name}
      </RoomName>
      <IndicatorsContainer>
        {alarmCounter && alarmCounter.critical > 0 && (
          <ErrorIndicator />
        )}
        {alarmCounter && alarmCounter.warning > 0 && (
          <WarningIndicator />
        )}
        {unreachableCount > 0 && (
          <UnreachableIndicator />
        )}
      </IndicatorsContainer>
    </Container>
  )
}
