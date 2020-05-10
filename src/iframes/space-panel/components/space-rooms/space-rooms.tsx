import React from "react"
import { AlarmsMessagePayload, RoomsMessagePayload } from "utils/types"

import { RoomLabel } from "./room-label"
import {
  RoomListContainer, RoomAddSection, StyledAnnotation, PlusButton,
} from "./styled"

const mockedWorkspace = {}

interface Props {
  alarms: AlarmsMessagePayload
  roomsResult: RoomsMessagePayload
}
export const SpaceRooms = ({ alarms, roomsResult }: Props) => {
  const workspace = mockedWorkspace as any
  const userIsAdmin = true
  const isAllowedToCreateRooms = !workspace.createRoomAdminsOnly || userIsAdmin

  const handleAddRoom = (e: React.SyntheticEvent<HTMLButtonElement, Event>) => {
    e.preventDefault()
    // eslint-disable-next-line max-len
    window.top.window.location.href = `/spaces/${roomsResult.spaceSlug}/rooms/general?modal=createRoom`
  }

  return (
    <>
      {isAllowedToCreateRooms && (
        <RoomAddSection>
          <StyledAnnotation>Rooms</StyledAnnotation>
          <PlusButton icon="plus" onClick={handleAddRoom} />
        </RoomAddSection>
      )}
      <RoomListContainer>
        {roomsResult.results.map((room: any) => {
          const roomAlarms = alarms.find((alarm) => alarm.roomID === room.id)
          return (
            <RoomLabel
              key={room.id}
              room={room}
              spaceSlug={roomsResult.spaceSlug}
              alarmCounter={roomAlarms?.alarmCounter}
              unreachableCount={roomAlarms?.unreachableCount || 0}
            />
          )
        })}
      </RoomListContainer>
    </>
  )
}
