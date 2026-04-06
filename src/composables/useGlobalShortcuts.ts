import { storeToRefs } from 'pinia'

import { useTauriShortcut } from './useTauriShortcut'

import { toggleWindowVisible } from '@/plugins/window'
import { useCatStore } from '@/stores/cat'
import { useShortcutStore } from '@/stores/shortcut'

/**
 * 初始化全局快捷键
 * 应在 App.vue setup 阶段调用
 * useTauriShortcut 内部会 watch shortcut 值的变化，自动处理注册/注销
 */
export function useGlobalShortcuts() {
  const shortcutStore = useShortcutStore()
  const catStore = useCatStore()
  const { visibleCat, visiblePreference } = storeToRefs(shortcutStore)

  // 注册切换猫咪显示的快捷键
  useTauriShortcut(visibleCat, () => {
    catStore.window.visible = !catStore.window.visible
  })

  // 注册切换偏好设置窗口的快捷键
  useTauriShortcut(visiblePreference, () => {
    toggleWindowVisible('preference')
  })
}
