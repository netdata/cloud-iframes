import React from "react"
import { CollapsibleList, SimpleListItem } from "@rmwc/list"
import "@material/list/dist/mdc.list.css"
import "@rmwc/list/collapsible-list.css"
import "@rmwc/icon/icon.css"

import {
  NodesContainer,
  ListItem,
  StyledIcon,
  ListHeaderContainer,
  MasterNodeContainer,
  NodeLink,
} from "./styled"


interface Props {
}
export const ReplicatedNodes = ({
}: Props) => {
  const masterNodeUrl = "master node url"
  const masterNodeName = "master node name"
  const streamedHosts = [
    { hostname: "hostname1" },
    { hostname: "hostname2" },
  ]

  const base = "http://base"
  const getUrl = (hostname: string) => `${base}/host/${hostname}`

  return (
    <NodesContainer>
      <CollapsibleList
        startOpen
        handle={(
          <ListHeaderContainer>
            <SimpleListItem metaIcon="chevron_right" text="Replicated Nodes" />
          </ListHeaderContainer>
        )}
      >
        <MasterNodeContainer>
          <StyledIcon size="small" name="nodes" />
          <NodeLink href={masterNodeUrl}>{masterNodeName}</NodeLink>
        </MasterNodeContainer>
        {streamedHosts.map(({ hostname }) => (
          // eslint-disable-next-line react/no-array-index-key
          <ListItem key={hostname}>
            <StyledIcon name="node" />
            <NodeLink href={getUrl(hostname)}>{hostname}</NodeLink>
          </ListItem>
        ))}
      </CollapsibleList>
    </NodesContainer>
  )
}
