import styled from "styled-components";
import { Icon } from "@netdata/netdata-ui";

export const StyledIcon = styled(Icon)`
  transform: ${({ right }) => (right ? "rotate(270deg)" : "none")};
`;
