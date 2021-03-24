import styled from "styled-components";
import { Flex } from "@netdata/netdata-ui";

const SpaceBox = styled(Flex).attrs(({ active }) => ({
  width: 10,
  height: 10,
  background: active ? "separator" : "elementBackground",
  justifyContent: "center",
  alignItems: "center",
  round: 2,
}))`
  cursor: pointer;
`;

export default SpaceBox;
