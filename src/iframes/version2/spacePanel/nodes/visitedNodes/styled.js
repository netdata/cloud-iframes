import styled from "styled-components"
import { getColor, Icon, TextSmall } from "@netdata/netdata-ui"

export const TrashIcon = styled(Icon)`
  &:hover {
    fill: ${getColor("textFocus")};
    opacity: 0.6;
  }
`

export const UrlWrapper = styled(TextSmall)`
  overflow-wrap: anywhere;
`

export const StyledIcon = styled(Icon)`
  transform: ${({ right }) => (right ? "rotate(270deg)" : "none")};
`
