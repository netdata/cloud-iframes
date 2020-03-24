import { useEffect, useCallback, useState } from "react"

type ParentMessageType = "is-signed-in" | "hello-from-space-panel" | "hello-from-sign-in"
  | "iframe-focus-change"

interface ParentMessage {
  type: ParentMessageType
  payload: unknown
}
export const sendToParent = (message: ParentMessage) => {
  window.parent.postMessage(message, "*")
}


type IframesMessageType = "spaces" | "workspaces" | "rooms"
  | "hello-from-spaces-bar" | "hello-from-space-panel" | "streamed-hosts-data"
  | "visited-nodes" | "delete-node-request" | "space-change"

interface IframesMessage<T = unknown> {
  type: IframesMessageType
  payload: T
}

export const sendToIframes = (message: IframesMessage) => {
  const framesLength = window.parent.frames.length
  const targetOrigin = window.location.origin

  Array(framesLength)
    .fill(null)
    .forEach((_, frameIndex) => {
      if (frameIndex === 0) {
        // dont sent message to parent, it will fail anyway and pollute the console with error
        return
      }
      try { // prevent showing errors in console
        window.parent.frames[frameIndex].postMessage(message, targetOrigin)
      } catch (e) {
        console.warn("error sending message to sibling iframe", e) // eslint-disable-line no-console
      }
    })
}

export const useListenToPostMessage = <T>(
  messageType: IframesMessageType,
  callback?: (newMessage: T) => void,
) => {
  const [lastMessage, setLastMessage] = useState<T>()
  const handleMessage = useCallback((message) => {
    const data = message.data as IframesMessage<T>
    if (data.type === messageType) {
      setLastMessage(data.payload)
      if (callback) {
        callback(data.payload)
      }
    }
  }, [callback, messageType])
  useEffect(() => {
    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [handleMessage, messageType])
  return lastMessage
}
