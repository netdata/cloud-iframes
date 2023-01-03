import styled from "styled-components";
import { Flex, getColor } from "@netdata/netdata-ui";

const Anchor = styled(Flex).attrs({ as: "a" })`
  text-decoration: none;
  & :hover {
    background: ${getColor("selected")};
    text-decoration: none;
  }
`;

export default Anchor;
