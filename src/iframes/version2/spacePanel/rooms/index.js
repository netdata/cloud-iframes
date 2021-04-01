import React, { useCallback, useState } from "react";
import { Text, Button, Flex } from "@netdata/netdata-ui";
import { MenuList } from "components/menus";
import RoomLabel from "./roomLabel";
import { StyledIcon } from "../styled";

const mockedWorkspace = {};

const SpaceRooms = ({ alarms, rooms }) => {
  const [listOpen, setListOpen] = useState(true);
  const workspace = mockedWorkspace;
  const isAllowedToCreateRooms = !workspace.createRoomAdminsOnly || true;

  const handleAddRoom = (e) => {
    e.preventDefault();
    // eslint-disable-next-line max-len
    window.top.window.location.href = `/spaces/${rooms.spaceSlug}/rooms/general?modal=createRoom`;
  };

  const toggleListOpen = useCallback(() => setListOpen((o) => !o), []);

  return (
    <MenuList
      isOpen={listOpen}
      toggleOpen={toggleListOpen}
      label={
        <Flex
          padding={[2, 0]}
          flex
          justifyContent="between"
          alignItems="center"
        >
          <Flex alignItems="center" gap={3}>
            <StyledIcon
              right={!listOpen}
              name="chevron_down"
              size="small"
              color="text"
            />
            <Text>War Rooms</Text>
          </Flex>
          <Button
            small
            icon="plus"
            onClick={handleAddRoom}
            data-testid="workspaceRooms-addWarRoom-button"
            disabled={!isAllowedToCreateRooms}
          />
        </Flex>
      }
    >
      <Flex column gap={2}>
        {rooms.results.map((room) => {
          const roomAlarms = alarms.find((alarm) => alarm.roomID === room.id);
          return (
            <RoomLabel
              key={room.id}
              room={room}
              spaceSlug={rooms.spaceSlug}
              alarmCounter={roomAlarms?.alarmCounter}
              unreachableCount={roomAlarms?.unreachableCount || 0}
            />
          );
        })}
      </Flex>
    </MenuList>
  );
};

export default SpaceRooms;
