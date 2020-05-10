import styled from "styled-components"
import {
  H5, getSizeBy, getColor, Icon, TextNano, Text,
} from "@netdata/netdata-ui"

export const NodesContainer = styled.div`
  .mdc-list-item {
    padding: 0 0;
    padding-left: 0;
  }
  .rmwc-collapsible-list__children {
    .mdc-list-item {
      padding: 0 0;
      padding-left: 0;
      height: ${getSizeBy(4)};
    }
  }

  .rmwc-collapsible-list__handle {
    .mdc-list-item {
      padding: 0 ${getSizeBy(2)};
    }
  }
`

export const ListHeaderContainer = styled(H5.withComponent("div"))`
  text-shadow: unset;
  color: ${getColor(["borderColor"])};
`

export const ListItem = styled.div`
  width: 100%;
  height: ${getSizeBy(3)};
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  cursor: pointer;
  justify-content: space-between;
`

export const TrashIcon = styled(Icon)`
  fill: #35414a;
  margin-right: ${getSizeBy(2)};
  transition: opacity 0.4s ease-in;
  flex: 0 0 auto;
  &:hover {
    opacity: 0.6;
  }
`

export const StyledIcon = styled(Icon)`
  flex-shrink: 0;
  flex-grow: 0;
  margin-right: ${getSizeBy(2)};
  fill: ${getColor(["text"])};
`

export const NodeUrl = styled(TextNano.withComponent("a"))`
  margin-left: ${getSizeBy(5)};
  font-size: 11px;
  color: #aeb3b7;
  // we can alternatively consider overflow-wrap: anywhere; which looks nicer but leaves bigger gaps
  word-break: break-all;
  text-decoration: none;
  &:hover {
    color: inherit; // easiest hover solution for now
  }
`

export const NodeName = styled(Text)`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  white-space: nowrap;
`
