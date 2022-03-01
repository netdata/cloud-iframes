import React, { useCallback, useMemo, useState } from "react"
import { useToggle } from "react-use"

import { Flex, Text } from "@netdata/netdata-ui"
import { MenuList } from "components/menus"
import Search from "components/search"
import { StyledIcon } from "../../styled"
import Node from "./node"

const useFilteredVisitedNodes = (visitedNodes, term) =>
  useMemo(
    () =>
      term
        ? visitedNodes.filter(node => node.name.toUpperCase().includes(term.toUpperCase()))
        : visitedNodes,
    [visitedNodes, term]
  )

const VisitedNodes = ({ onDeleteClick, visitedNodes, spaces }) => {
  const [listOpen, toggleListOpen] = useToggle(visitedNodes.length > 0)

  const [selectedId, setSelectedId] = useState()
  const [searchValue, setSearchValue] = useState("")

  const filteredNodes = useFilteredVisitedNodes(visitedNodes, searchValue)
  const handleSearchChange = useCallback(event => setSearchValue(event.target.value), [])

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
      {visitedNodes.length > 3 && (
        <Flex padding={[0, 5, 2, 0]}>
          <Search data-testid="search-visited-nodes-input" onChange={handleSearchChange} />
        </Flex>
      )}
      <Flex padding={[0, 0, 2]} column>
        {filteredNodes.map(agent => (
          <Node
            key={agent.id}
            onDeleteClick={onDeleteClick}
            agent={agent}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            spaces={spaces}
          />
        ))}
      </Flex>
    </MenuList>
  )
}

export default VisitedNodes
