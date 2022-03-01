import React, { useState, useCallback } from "react"
import { Flex, Text, TextSmall, Icon } from "@netdata/netdata-ui"
import { useToggle } from "hooks/use-toggle"
import { MenuList, MenuItem } from "components/menus"

import { StyledIcon, TrashIcon, UrlWrapper } from "./styled"
import useGoToUrl from "./useGoToUrl"

const NodeOld = ({ agent: { name, urls } }, onDeleteClick) => {
  const [listOpen, setListOpen] = useState(false)
  const toggleListOpen = useCallback(() => setListOpen(o => !o), [])
  return (
    <MenuList
      isOpen={listOpen}
      toggleOpen={toggleListOpen}
      label={
        <Flex flex alignItems="center" gap={3}>
          <Text>{name}</Text>
          <StyledIcon right={!listOpen} name="chevron_down" size="small" color="text" />
        </Flex>
      }
    >
      {urls.map(url => (
        <Flex key={url} flex alignItems="center" justifyContent="between" padding={[2, 0, 0, 2]}>
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
              onDeleteClick(url)
            }}
          />
        </Flex>
      ))}
    </MenuList>
  )
}

const Node = ({ agent: { id, name, urls }, onDeleteClick, selectedId, setSelectedId }) => {
  const [listOpen, , open, close] = useToggle()
  // const removeUrl = useVisitedNodeRemoveUrl()
  const removeUrl = () => {} // todo
  const goToUrl = useGoToUrl(id, urls, { openList: open, setSelectedId })
  const onNodeClick = useCallback(() => {
    if (listOpen) {
      close()
    } else {
      goToUrl()
    }
  }, [listOpen, goToUrl])

  const selected = selectedId === id

  return (
    <>
      <MenuItem
        onClick={onNodeClick}
        icon="node_hollow"
        isSidebar
        padding={[1.5, 4, 1.5, 2]}
        round={1}
        testid={`visitedNodes-${name}`}
        disabled={!!selectedId && !selected}
        selected={selected}
        loading={selected}
      >
        {name}
      </MenuItem>

      {listOpen && (
        <Flex column margin={[1, 0]}>
          <Text textAlign="center">
            We couldn't connect to any of your instances, here is the list:
          </Text>
          {urls.map(url => (
            <MenuItem
              key={url}
              onClick={() => visitNode(url)}
              isSidebar
              testid={`visitedNodes-node-${url}`}
              actions={
                <Flex flex={false} margin={[0, 0, 0, 1]}>
                  <TrashIcon
                    name="trashcan"
                    size="small"
                    color="text"
                    onClick={e => {
                      e.stopPropagation()
                      removeUrl(id, url)
                    }}
                    width="16px"
                    height="16px"
                  />
                </Flex>
              }
              padding={[2, 4, 2, 2]}
              round={1}
              Wrapper={UrlWrapper}
            >
              {url}
            </MenuItem>
          ))}
        </Flex>
      )}
    </>
  )
}

export default Node
