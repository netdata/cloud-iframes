import styled from "styled-components"

export const StyledButtonContainer = styled.div`
  height: 100%;
  & > * {
    width: 100%;
    height: auto;
    > button {
      user-select: none;
      text-transform: uppercase;
    }
    > button:hover {
      height: 40px;
    }
  }
`

export const StyledSignInButton = styled.a`
  padding: 8px;
  opacity: 1;
  cursor: pointer;
  background-color: #00ab44;
  border-color: #00ab44;
  border-style: solid;
  border-radius: 3px;
  border-width: 0;
  width: 128px;
  height: 40px;
  font-weight: bold;
  font-size: 12px;
  color: #fff;
  flex-flow: row nowrap;
  align-items: center;
  text-decoration: none;
  user-select: none;
  display: flex;
  &:hover {
    border-color: #00cb51;
    border-width: 3px;
    border-radius: 4px;
    width: 48px;
    height: 48px;
  }
`
