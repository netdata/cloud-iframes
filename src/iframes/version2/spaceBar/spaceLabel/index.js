import React, { useCallback } from "react";
import { Text } from "@netdata/netdata-ui";
import { Tooltip } from "@rmwc/tooltip";
import "@rmwc/tooltip/tooltip.css";
import SpaceBox from "./spaceBox";

const getSpaceInitials = (name) => {
  const splittedName = name.split(" ");
  const [firstSubstring, secondSubstring] = splittedName;
  const firstLetter = firstSubstring[0];
  const secondLetter = secondSubstring ? secondSubstring[0] : "";
  return [firstLetter, secondLetter];
};

const SpaceLabel = ({ space, active, onSpaceIconClick }) => {
  const [firstLetter, secondLetter] = getSpaceInitials(space.name);

  const onClick = useCallback(() => onSpaceIconClick(space.id), [
    space.id,
    onSpaceIconClick,
  ]);

  return (
    <Tooltip content={space.name || ""} align="right">
      <SpaceBox active={active} onClick={onClick}>
        <Text strong color={active ? "main" : "border"}>
          {firstLetter}
        </Text>
        <Text strong color={active ? "border" : "separator"}>
          {secondLetter}
        </Text>
      </SpaceBox>
    </Tooltip>
  );
};

export default SpaceLabel;
