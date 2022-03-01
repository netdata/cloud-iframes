import React, { useCallback } from "react"
import { Flex, Text } from "@netdata/netdata-ui"
import { useToggle } from "hooks/use-toggle"
import { MenuItem } from "components/menus"

import { TrashIcon, UrlWrapper } from "./styled"
import useGoToUrl, { visitNode } from "./useGoToUrl"

const Node = ({ agent: { id, name, urls }, onDeleteClick, selectedId, setSelectedId, spaces }) => {
  const [listOpen, , open, close] = useToggle()
  const goToUrl = useGoToUrl(id, urls, { openList: open, setSelectedId, spaces })
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
                      onDeleteClick(id, url)
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
