import React, { useCallback, useState } from "react"
import { useToggle } from "react-use"
import { Flex, Text } from "@netdata/netdata-ui"
import { MenuList } from "components/menus"
import { StyledIcon } from "../../styled"
import Node from "./node"

const VisitedNodesOld = ({ onDeleteClick, visitedNodes }) => {
  const [listOpen, setListOpen] = useState(true)
  const toggleListOpen = useCallback(() => setListOpen(o => !o), [])

  return (
    <MenuList
      isOpen={listOpen}
      toggleOpen={toggleListOpen}
      label={
        <Flex padding={[2, 0]} flex alignItems="center" gap={3}>
          <StyledIcon right={!listOpen} name="chevron_down" size="small" color="text" />
          <Text>Visited Nodes</Text>
        </Flex>
      }
    >
      <Flex column gap={3} padding={[2, 0, 0, 4]}>
        {visitedNodes.map(agent => (
          <Node key={agent.id} onDeleteClick={url => onDeleteClick(agent.id, url)} agent={agent} />
        ))}
      </Flex>
    </MenuList>
  )
}

const VisitedNodes = ({ onDeleteClick, visitedNodes }) => {
  const [listOpen, toggleListOpen] = useToggle(visitedNodes.length > 0)

  const [selectedId, setSelectedId] = useState()

  if (!visitedNodes.length) return null

  return (
    <MenuList
      isOpen={listOpen}
      toggleOpen={toggleListOpen}
      label={
        <Flex padding={[2, 0]} flex justifyContent="between" alignItems="center">
          <Flex alignItems="center" gap={3}>
            <StyledIcon right={!listOpen} name="chevron_down" size="small" color="text" />
            <Text>Visited Nodes</Text>
          </Flex>
        </Flex>
      }
      testid="visitedNodes"
    >
      <Flex padding={[0, 0, 2]} column>
        {visitedNodes.map(agent => (
          <Node
            key={agent.id}
            onDeleteClick={url => onDeleteClick(agent.id, url)}
            agent={agent}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />
        ))}
      </Flex>
    </MenuList>
  )
}

export default VisitedNodes
