import type { ShortcutHandler } from '@tauri-apps/plugin-global-shortcut'
import type { Ref } from 'vue'

import { isRegistered, register, unregister } from '@tauri-apps/plugin-global-shortcut'
import { ref, watch } from 'vue'

export function useTauriShortcut(shortcut: Ref<string, string>, callback: ShortcutHandler) {
  const oldShortcut = ref(shortcut.value)

  watch(shortcut, async (value) => {
    if (oldShortcut.value) {
      try {
        const registered = await isRegistered(oldShortcut.value)

        if (registered) {
          await unregister(oldShortcut.value)
        }
      } catch (error) {
        console.warn('[Shortcut] Failed to unregister shortcut', oldShortcut.value, error)
      }
    }

    oldShortcut.value = ''

    if (!value) return

    try {
      await register(value, (event) => {
        if (event.state === 'Released') return

        callback(event)
      })

      oldShortcut.value = value
    } catch (error) {
      console.warn('[Shortcut] Failed to register shortcut', value, error)
      // reset绑定失败的快捷键，避免 UI 显示错误信息
      if (shortcut.value === value) {
        shortcut.value = ''
      }
    }
  }, { immediate: true })
}
