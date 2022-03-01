import React, { useCallback, forwardRef } from "react"
import styled from "styled-components"
import { getColor, Flex, Icon, Text, IconComponents } from "@netdata/netdata-ui"

export const PanelRowContainer = styled(Flex)`
  cursor: pointer;

  &:hover {
    background: ${getColor("selected")};
  }

  ${props => props.selected && `background: ${getColor("selected")(props)};`}
`

const StyledIcon = styled(Icon)`
  flex: 0 0 auto;
  height: 16px;
  width: 16px;
`

const StyledLoaderIcon = styled(IconComponents.LoaderIcon)`
  flex: 0 0 auto;
  height: 16px;
  width: 16px;
`

const MenuItem = forwardRef(
  (
    {
      disabled,
      children,
      Wrapper = Text,
      onClick,
      testid,
      icon,
      padding = [2, 4],
      margin = [0],
      round = 0,
      actions,
      selected,
      loading,
      width = "100%",
    },
    ref
  ) => {
    const click = useCallback(() => {
      if (disabled) return
      if (onClick) onClick()
    }, [onClick, disabled])

    return (
      <PanelRowContainer
        ref={ref}
        flexWrap={false}
        justifyContent="between"
        alignItems="center"
        padding={padding}
        margin={margin}
        round={round}
        onClick={click}
        data-testid={testid}
        width={width}
        selected={selected}
        disabled={disabled}
      >
        <Flex alignItems="center" gap={3} flex basis="">
          {loading ? (
            <StyledLoaderIcon />
          ) : typeof icon === "string" ? (
            <StyledIcon name={icon} disabled={disabled} color="text" height="16px" width="16px" />
          ) : (
            icon
          )}
          <Wrapper opacity={disabled ? "medium" : undefined} width="150px">
            {children}
          </Wrapper>
        </Flex>
        {actions}
      </PanelRowContainer>
    )
  }
)

export default MenuItem
