import { useMount } from "react-use"

import { sendToParent } from "utils/post-message"

const DELAY_TO_MAKE_SURE_FOCUS_ON_IS_RECEIVED_LATER = 200

export const useFocusDetector = () => {
  useMount(() => {
    window.addEventListener("focus", () => {
      setTimeout(() => {
        sendToParent({
          type: "iframe-focus-change",
          payload: { hasWindowFocus: true },
        })
      }, DELAY_TO_MAKE_SURE_FOCUS_ON_IS_RECEIVED_LATER)
    })
    window.addEventListener("blur", () => {
      sendToParent({
        type: "iframe-focus-change",
        payload: { hasWindowFocus: false },
      })
    })
  })
}
