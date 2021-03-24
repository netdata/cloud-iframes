import React, { useCallback, useState } from "react";
import { Flex, Text } from "@netdata/netdata-ui";
import { MenuList } from "components/menus";
import { StyledIcon } from "../../styled";
import Node from './node'

const VisitedNodes = ({ onDeleteClick, visitedNodes }) => {
  const [listOpen, setListOpen] = useState(true);
  const toggleListOpen = useCallback(() => setListOpen((o) => !o), []);

  return (
    <MenuList
      isOpen={listOpen}
      toggleOpen={toggleListOpen}
      label={
        <Flex padding={[2, 0]} flex alignItems="center" gap={3}>
          <StyledIcon
            right={!listOpen}
            name="chevron_down"
            size="small"
            color="text"
          />
          <Text>Visited Nodes</Text>
        </Flex>
      }
    >
      <Flex column gap={3} padding={[2, 0, 0, 4]}>
        {visitedNodes.map((agent) => (
          <Node
            key={agent.id}
            onDeleteClick={(url) => onDeleteClick(agent.id, url)}
            agent={agent}
          />
        ))}
      </Flex>
    </MenuList>
  );
};

export default VisitedNodes;
