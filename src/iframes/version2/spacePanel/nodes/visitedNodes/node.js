import React, { useState, useCallback } from "react";
import { Flex, Text, TextSmall, Icon } from "@netdata/netdata-ui";
import { MenuList } from "components/menus";
import { StyledIcon } from "../../styled";

const Node = ({ agent: { name, urls } }, onDeleteClick) => {
  const [listOpen, setListOpen] = useState(false);
  const toggleListOpen = useCallback(() => setListOpen((o) => !o), []);
  return (
    <MenuList
      isOpen={listOpen}
      toggleOpen={toggleListOpen}
      label={
        <Flex flex alignItems="center" gap={3}>
          <Text>{name}</Text>
          <StyledIcon
            right={!listOpen}
            name="chevron_down"
            size="small"
            color="text"
          />
        </Flex>
      }
    >
      {urls.map((url) => (
        <Flex
          key={url}
          flex
          alignItems="center"
          justifyContent="between"
          padding={[2, 0, 0, 2]}
        >
          <Flex alignItems="center" gap={2}>
            <Icon name="node" color="bright" />
            <TextSmall as="a" href={url} target="_Parent">
              {url}
            </TextSmall>
          </Flex>
          <Icon
            name="trashcan"
            size="small"
            color="text"
            onClick={() => {
              onDeleteClick(url);
            }}
          />
        </Flex>
      ))}
    </MenuList>
  );
};

export default Node;
