import styled from "styled-components"
import { getSizeBy, getColor, H4 } from "@netdata/netdata-ui"

export const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  color: ${getColor(["text"])};
`

export const PanelHeader = styled(H4)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-bottom: ${getSizeBy(3)};
  padding: 0 ${getSizeBy(2)};
  text-shadow: unset;
`

export const PanelSection = styled.section<{ leading?: boolean }>`
  position: relative;
  margin-top: ${({ leading }) => !leading && getSizeBy(2)};

  &::before {
    ${({ leading }) => (leading ? "display: none" : "")};
    position: absolute;
    content: "";
    width: ${getSizeBy(10)};
    height: 1px;
    top: 0;
    left: calc(50% - ${getSizeBy(10)} / 2);
    background: ${getColor(["borderColor"])};
  }
`
