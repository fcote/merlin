import { useEffect, useRef, RefObject } from 'react'

const modifiersMap = {
  alt: 'altKey',
  ctrl: 'ctrlKey',
}

function useKeyEventListener<T extends HTMLElement = HTMLDivElement>(
  eventName: string,
  shortcut: string,
  handler: (event: Event) => void,
  element?: RefObject<T>
) {
  const savedHandler = useRef<(event: Event) => void>()

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      const shortcutSplit = shortcut.split('+')
      const shortcutKey =
        shortcutSplit.length > 1 ? shortcutSplit[1] : shortcutSplit[0]
      const shortcutModifier =
        shortcutSplit.length > 1 ? modifiersMap[shortcutSplit[0]] : null

      if (
        event.code !== shortcutKey ||
        (shortcutModifier && !event[shortcutModifier])
      ) {
        return
      }

      return handler(event)
    }

    const targetElement: T | Window = element?.current || window
    if (!(targetElement && targetElement.addEventListener)) {
      return
    }
    if (savedHandler.current !== keyHandler) {
      savedHandler.current = keyHandler
    }
    const eventListener = (event: Event) => {
      if (!!savedHandler?.current) {
        savedHandler.current(event)
      }
    }
    targetElement.addEventListener(eventName, eventListener)
    return () => {
      targetElement.removeEventListener(eventName, eventListener)
    }
  }, [eventName, shortcut, element, handler])
}

export default useKeyEventListener
