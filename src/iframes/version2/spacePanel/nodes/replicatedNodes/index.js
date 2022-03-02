import React, { useState, useCallback, useMemo } from "react"
import { Text, Flex, Icon } from "@netdata/netdata-ui"
import { MenuList } from "components/menus"
import { alwaysEndWithSlash } from "utils/always-end-with-slash"
import Search from "components/search"
import Pill from "./pill"
import Anchor from "./anchor"
import { StyledIcon } from "../../styled"

const ReplicatedNodes = ({ replicatedNodes: { parentNode, replicatedNodes } }) => {
  const [listOpen, setListOpen] = useState(true)
  const [value, setValue] = useState("")

  const toggleListOpen = useCallback(() => setListOpen(o => !o), [])
  const onChange = useCallback(e => setValue(e.target.value), [])

  const nodes = useMemo(() => {
    if (!value) return replicatedNodes
    return replicatedNodes.filter(({ hostname }) =>
      hostname.toLowerCase().includes(value.toLowerCase())
    )
  }, [replicatedNodes, value])

  return (
    <MenuList
      isOpen={listOpen}
      toggleOpen={toggleListOpen}
      label={
        <Flex padding={[2, 0]} flex alignItems="center" gap={3}>
          <StyledIcon right={!listOpen} name="chevron_down" size="small" color="text" />
          <Text>Replicated Nodes</Text>
        </Flex>
      }
    >
      <Flex column gap={3} padding={[2, 0]}>
        <Anchor gap={2} href={parentNode.url} target="_PARENT" padding={[2, 0, 0, 4]}>
          <Icon name="nodes" size="small" color="bright" />
          <Text color="bright">{parentNode.hostname}</Text>
        </Anchor>
        {nodes.length >= 5 && (
          <Flex padding={[0, 0, 0, 6]}>
            <Search value={value} onChange={onChange} />
          </Flex>
        )}
        {nodes.map(({ hostname, url, status }) => (
          <Anchor
            href={alwaysEndWithSlash(url)}
            target="_PARENT"
            key={hostname}
            padding={[0, 0, 0, 6]}
            gap={2}
            alignItems="center"
            justifyContent="between"
          >
            <Flex alignItems="center" gap={2}>
              <Icon name="node" color="bright" />
              <Text color="bright" truncate>
                {hostname}
              </Text>
            </Flex>
            <Pill background={status ? "success" : "border"} color="bright">
              {status ? "Live" : "Off"}
            </Pill>
          </Anchor>
        ))}
      </Flex>
    </MenuList>
  )
}

export default ReplicatedNodes
