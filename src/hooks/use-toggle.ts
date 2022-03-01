import { useState, useCallback } from "react"

/**
 * @example
 * const [value, toggle, toggleOn, toggleOff]  = useToggle(false);
 *
 * @param {Boolean} initialValue
 */

type UseToggleTuppleT = [boolean, () => void, () => void, () => void]

export const useToggle = (initialValue: boolean = false): UseToggleTuppleT => {
  const [value, setToggle] = useState<boolean>(!!initialValue)
  const toggle = useCallback(() => setToggle((oldValue: boolean) => !oldValue), [])
  const toggleOn = useCallback(() => setToggle(true), [])
  const toggleOff = useCallback(() => setToggle(false), [])

  return [value, toggle, toggleOn, toggleOff]
}
