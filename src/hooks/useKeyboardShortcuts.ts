import { useEffect } from 'react'

interface KeyboardShortcut {
  keys: string[]
  handler: () => void
  description?: string
  enabled?: boolean
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue

        const keys = shortcut.keys.map(key => key.toLowerCase())
        const pressedKeys = []

        if (event.ctrlKey || event.metaKey) pressedKeys.push('ctrl')
        if (event.shiftKey) pressedKeys.push('shift')
        if (event.altKey) pressedKeys.push('alt')
        pressedKeys.push(event.key.toLowerCase())

        if (
          keys.length === pressedKeys.length &&
          keys.every(key => pressedKeys.includes(key))
        ) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}