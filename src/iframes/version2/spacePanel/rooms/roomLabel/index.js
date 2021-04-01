import React from "react";
import styled from "styled-components";
import { Flex, Text, Icon, getColor } from "@netdata/netdata-ui";

const Indicator = styled(Flex).attrs({
  width: "8px",
  height: "8px",
  round: 8,
  justifyContent: "center",
  alignItems: "center",
})``;

const Container = styled(Flex).attrs({
  alignItems: "center",
  padding: [0, 2],
  round: true,
})`
  cursor: pointer;
  &:hover {
    background: ${getColor("selected")};
  }
`;

const RoomLabel = ({ alarmCounter, room, spaceSlug, unreachableCount }) => {
  const href = `/spaces/${spaceSlug}/rooms/${room.slug}`;
  return (
    <Container
      alignItems="center"
      justifyContent="between"
      flex
      padding={[0,0,0,2]}
      height="32px"
      round
      as="a"
      href={href}
      target="_PARENT"
    >
      <Flex alignItems="center" gap={2}>
        <Icon name="space_new" size="small" color="text" />
        <Text truncate>{room.name}</Text>
      </Flex>
      <Flex gap={1}>
        {alarmCounter && !!alarmCounter.critical && (
          <Indicator background="error" />
        )}
        {alarmCounter && !!alarmCounter.warning && (
          <Indicator background="warning" />
        )}
        {unreachableCount > 0 && <Indicator background="bombay" />}
      </Flex>
    </Container>
  );
};

export default RoomLabel;
