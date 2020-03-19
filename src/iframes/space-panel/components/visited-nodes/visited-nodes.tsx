import React from "react"
import { CollapsibleList, SimpleListItem } from "@rmwc/list"
import "@material/list/dist/mdc.list.css"
import "@rmwc/list/collapsible-list.css"
import "@rmwc/icon/icon.css"

import { NodesPayload } from "utils/api"
import {
  NodesContainer,
  ListItem,
  StyledIcon,
  ListHeaderContainer,
  NodeUrl,
  NodeName,
} from "./styled"

interface NodeProps {
  agent: {
    hostname: string
    urls: string[]
  }
  visitNode: (url: string) => void
}
const Node = ({ agent: { hostname, urls }, visitNode }: NodeProps) => (
  <CollapsibleList
    handle={(
      <SimpleListItem
        text={(
          <>
            <StyledIcon name="node" />
            <NodeName>{hostname}</NodeName>
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
        onClick={() => {
          visitNode(url)
        }}
      >
        <NodeUrl>{url}</NodeUrl>
      </ListItem>
    ))}
  </CollapsibleList>
)

interface Props {
  visitedNodes: NodesPayload
}

export const VisitedNodes = ({
  visitedNodes,
}: Props) => {
  const visitNode = (url: string) => {
    if (url.includes("http://") || url.includes("https://")) {
      window.top.window.location.href = url
    } else {
      window.top.window.location.href = `http://${url}`
    }
  }

  return (
    <NodesContainer>
      <CollapsibleList
        startOpen
        handle={(
          <ListHeaderContainer>
            <SimpleListItem metaIcon="chevron_right" text="Visited Nodes" />
          </ListHeaderContainer>
        )}
      >
        {visitedNodes.map((agent, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Node key={i} visitNode={visitNode} agent={agent} />
        ))}
      </CollapsibleList>
    </NodesContainer>
  )
}
