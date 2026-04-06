import { invoke } from '@tauri-apps/api/core'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { cursorPosition } from '@tauri-apps/api/window'

import { INVOKE_KEY, LISTEN_KEY } from '../constants'

import { useModel } from './useModel'
import { useTauriListen } from './useTauriListen'

import { useCatStore } from '@/stores/cat'
import { inBetween } from '@/utils/is'

export interface CursorPoint {
  x: number
  y: number
}

interface MouseMoveEvent {
  kind: 'MouseMove'
  value: CursorPoint
}

export function useDevice() {
  const catStore = useCatStore()
  const { handleMouseMove } = useModel()

  const startListening = () => {
    invoke(INVOKE_KEY.START_DEVICE_LISTENING)
  }

  const handleCursorMove = async () => {
    const cursorPoint = await cursorPosition()

    handleMouseMove(cursorPoint)

    if (catStore.window.hideOnHover) {
      const appWindow = getCurrentWebviewWindow()
      const position = await appWindow.outerPosition()
      const { width, height } = await appWindow.innerSize()

      const isInWindow = inBetween(cursorPoint.x, position.x, position.x + width)
        && inBetween(cursorPoint.y, position.y, position.y + height)

      document.body.style.setProperty('opacity', isInWindow ? '0' : 'unset')

      if (!catStore.window.passThrough) {
        appWindow.setIgnoreCursorEvents(isInWindow)
      }
    }
  }

  useTauriListen<MouseMoveEvent>(LISTEN_KEY.DEVICE_CHANGED, ({ payload }) => {
    if (payload.kind === 'MouseMove') {
      handleCursorMove()
    }
  })

  return {
    startListening,
  }
}
