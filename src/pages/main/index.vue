<script setup lang="ts">
import { convertFileSrc } from '@tauri-apps/api/core'
import { PhysicalSize } from '@tauri-apps/api/dpi'
import { Menu } from '@tauri-apps/api/menu'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { exists } from '@tauri-apps/plugin-fs'
import { useDebounceFn, useEventListener } from '@vueuse/core'
import { round } from 'es-toolkit'
import { onMounted, onUnmounted, ref, watch } from 'vue'

import StatsPanel from '@/components/StatsPanel.vue'
import StatusScreen from '@/components/StatusScreen.vue'
import { useClaudeState } from '@/composables/useClaudeState'
import { useDevice } from '@/composables/useDevice'
import { useModel } from '@/composables/useModel'
import { useSharedMenu } from '@/composables/useSharedMenu'
import { useTauriListen } from '@/composables/useTauriListen'
import { useWindowPosition } from '@/composables/useWindowPosition'
import { hideWindow, setAlwaysOnTop, setTaskbarVisibility, showWindow } from '@/plugins/window'
import { useCatStore } from '@/stores/cat'
import { useGeneralStore } from '@/stores/general.ts'
import { useModelStore } from '@/stores/model'
import live2d from '@/utils/live2d'
import { join } from '@/utils/path'

useClaudeState() // Initialize Claude state listener

// 监听表情预览事件（来自偏好设置窗口）
useTauriListen<{ index: number }>('preview-expression', ({ payload }) => {
  live2d.playExpressions(payload.index)
})

const { startListening } = useDevice()
const appWindow = getCurrentWebviewWindow()
const { modelSize, handleLoad, handleDestroy, handleResize } = useModel()
const catStore = useCatStore()
const { getSharedMenu } = useSharedMenu()
const modelStore = useModelStore()
const generalStore = useGeneralStore()
const resizing = ref(false)
const backgroundImagePath = ref<string>()
const { isMounted, setWindowPosition } = useWindowPosition()
let isUpdatingSize = false

onMounted(startListening)

onUnmounted(handleDestroy)

const debouncedResize = useDebounceFn(async () => {
  if (isUpdatingSize) {
    resizing.value = false
    return
  }

  await handleResize()
  await setWindowPosition()
  resizing.value = false
}, 100)

useEventListener('resize', () => {
  if (isUpdatingSize) return

  resizing.value = true
  debouncedResize()
})

watch(() => modelStore.currentModel, async (model) => {
  if (!model) return

  await handleLoad()

  const path = join(model.path, 'resources', 'background.png')

  const existed = await exists(path)

  backgroundImagePath.value = existed ? convertFileSrc(path) : void 0

  setWindowPosition()
}, { deep: true, immediate: true })

watch([() => catStore.window.scale, modelSize], async ([scale, modelSize]) => {
  if (!modelSize) return

  const { width, height } = modelSize

  // 防止触发 resize 事件处理
  isUpdatingSize = true

  try {
    await appWindow.setSize(
      new PhysicalSize({
        width: Math.round(width * (scale / 100)),
        height: Math.round(height * (scale / 100)),
      }),
    )

    // 等待 resize 事件触发完成
    await new Promise(resolve => setTimeout(resolve, 150))
  } finally {
    isUpdatingSize = false
  }
}, { immediate: true })

watch(() => catStore.window.visible, async (value) => {
  value ? showWindow() : hideWindow()
})

watch(() => catStore.window.passThrough, (value) => {
  appWindow.setIgnoreCursorEvents(value)
}, { immediate: true })

watch(() => catStore.window.alwaysOnTop, setAlwaysOnTop, { immediate: true })

watch(() => generalStore.app.taskbarVisible, setTaskbarVisibility, { immediate: true })

function handleMouseDown() {
  appWindow.startDragging()
}

async function handleContextmenu(event: MouseEvent) {
  event.preventDefault()

  if (event.shiftKey) return

  const menu = await Menu.new({
    items: await getSharedMenu(),
  })

  menu.popup()
}

function handleMouseMove(event: MouseEvent) {
  const { buttons, shiftKey, movementX, movementY } = event

  if (buttons !== 2 || !shiftKey) return

  const delta = (movementX + movementY) * 0.5
  const nextScale = Math.max(10, Math.min(catStore.window.scale + delta, 500))

  catStore.window.scale = round(nextScale)
}
</script>

<template>
  <div
    v-show="isMounted"
    class="relative size-screen overflow-hidden children:(absolute size-full)"
    :style="{
      opacity: catStore.window.opacity / 100,
      borderRadius: `${catStore.window.radius}%`,
    }"
    @contextmenu="handleContextmenu"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
  >
    <img
      v-if="backgroundImagePath"
      class="object-cover"
      :src="backgroundImagePath"
    >

    <canvas id="live2dCanvas" />

    <div
      v-show="resizing"
      class="flex items-center justify-center bg-black"
    >
      <span class="text-center text-[10vw] text-white">
        {{ $t('pages.main.hints.redrawing') }}
      </span>
    </div>

    <Teleport to="body">
      <StatusScreen />
    </Teleport>
    <StatsPanel />
  </div>
</template>
