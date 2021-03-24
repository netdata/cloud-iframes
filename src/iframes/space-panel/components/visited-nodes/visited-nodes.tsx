import React from "react"
import { CollapsibleList, SimpleListItem } from "@rmwc/list"
import "@material/list/dist/mdc.list.css"
import "@rmwc/list/collapsible-list.css"
import "@rmwc/icon/icon.css"

import { VisitedNodes as VisitedNodesT } from "utils/types"
import {
  NodesContainer,
  ListItem,
  StyledIcon,
  ListHeaderContainer,
  NodeUrl,
  NodeName,
  TrashIcon,
} from "./styled"

interface NodeProps {
  agent: {
    name: string
    urls: string[]
  }
  onDeleteClick: (url: string) => void
}
const Node = ({ agent: { name, urls }, onDeleteClick }: NodeProps) => (
  <CollapsibleList
    handle={(
      <SimpleListItem
        text={(
          <>
            <StyledIcon name="node" />
            <NodeName>{name}</NodeName>
          </>
        )}
        metaIcon={urls.length && "chevron_right"}
      />
    )}
  >
    {urls.map((url: string, i: number) => (
      <ListItem
        // eslint-disable-next-line react/no-array-index-key
        key={i}
      >
        <NodeUrl as="a" href={url} target="_PARENT">
          {url}
        </NodeUrl>
        <TrashIcon
          name="trashcan"
          size="small"
          onClick={() => {
            onDeleteClick(url)
          }}
        />
      </ListItem>
    ))}
  </CollapsibleList>
)

interface Props {
  onDeleteClick: (nodeId: string, url: string) => void
  visitedNodes: VisitedNodesT
}

export const VisitedNodes = ({ onDeleteClick, visitedNodes }: Props) => (
  <NodesContainer>
    <CollapsibleList
      startOpen
      handle={(
        <ListHeaderContainer>
          <SimpleListItem metaIcon="chevron_right" text="Visited Nodes" />
        </ListHeaderContainer>
      )}
    >
      {visitedNodes.map((agent) => (
        <Node
          key={agent.id}
          onDeleteClick={(url) => onDeleteClick(agent.id, url)}
          agent={agent}
        />
      ))}
    </CollapsibleList>
  </NodesContainer>
)
