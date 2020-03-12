import styled from "styled-components"

export const StyledButtonContainer = styled.div`
  height: 100%;
  & > * {
    width: 100%;
    height: auto;
    > button:hover {
      height: 40px;
    }
  }
`

export const StyledSignInButton = styled.a`
  padding: 8px;
  opacity: 1;
  cursor: pointer;
  background-color: #00AB44;
  border-color: #00AB44;
  border-style:solid;
  border-radius: 3px;
  border-width: 0;
  width: 128px;
  height: 40px;
  font-weight: bold;
  font-size: 12px;
  color: #FFF;
  flex-flow: row nowrap;
  align-items: center;
  text-decoration: none;
  user-select: none;
  display: flex;
`
