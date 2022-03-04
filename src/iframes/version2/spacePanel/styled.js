import styled from "styled-components";
import { Icon, Flex, webkitVisibleScrollbar } from "@netdata/netdata-ui";

export const StyledIcon = styled(Icon)`
  transform: ${({ right }) => (right ? "rotate(270deg)" : "none")};
`;

export const Container = styled(Flex)`
  ${webkitVisibleScrollbar}
`
