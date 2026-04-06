import type { PhysicalPosition } from '@tauri-apps/api/dpi'

import { resolveResource } from '@tauri-apps/api/path'
import { message } from 'ant-design-vue'
import { isNil } from 'es-toolkit'
import { ref } from 'vue'

import live2d from '../utils/live2d'

import { useModelStore } from '@/stores/model'
import { getCursorMonitor } from '@/utils/monitor'

export interface ModelSize {
  width: number
  height: number
}

export function useModel() {
  const modelStore = useModelStore()
  const modelSize = ref<ModelSize>()

  async function handleLoad() {
    try {
      if (!modelStore.currentModel) return

      const { path } = modelStore.currentModel

      await resolveResource(path)

      const { width, height, ...rest } = await live2d.load(path)

      modelSize.value = { width, height }

      // 调整模型渲染缩放以适应当前窗口
      // 窗口大小会由 scale watch 自动设置
      handleResize()

      Object.assign(modelStore, rest)
    } catch (error) {
      message.error(String(error))
    }
  }

  function handleDestroy() {
    live2d.destroy()
  }

  async function handleResize() {
    if (!modelSize.value) return

    // 只负责调整 Live2D 模型的渲染缩放以适应当前窗口
    // 不计算或更新 scale 值，避免循环触发
    live2d.resizeModel(modelSize.value)
  }

  const handlePress = (key: string) => {
    const path = modelStore.supportKeys[key]

    if (!path) return

    modelStore.pressedKeys[key] = path
  }

  const handleRelease = (key: string) => {
    delete modelStore.pressedKeys[key]
  }

  function handleKeyChange(isLeft = true, pressed = true) {
    const id = isLeft ? 'CatParamLeftHandDown' : 'CatParamRightHandDown'

    live2d.setParameterValue(id, pressed)
  }

  function handleMouseChange(key: string, pressed = true) {
    const id = key === 'Left' ? 'ParamMouseLeftDown' : 'ParamMouseRightDown'

    live2d.setParameterValue(id, pressed)
  }

  async function handleMouseMove(cursorPoint: PhysicalPosition) {
    const monitor = await getCursorMonitor(cursorPoint)

    if (!monitor) return

    const { size, position } = monitor

    const xRatio = (cursorPoint.x - position.x) / size.width
    const yRatio = (cursorPoint.y - position.y) / size.height

    for (const id of ['ParamMouseX', 'ParamMouseY', 'ParamAngleX', 'ParamAngleY']) {
      const { min, max } = live2d.getParameterRange(id)

      if (isNil(min) || isNil(max)) continue

      const isXAxis = id.endsWith('X')

      const ratio = isXAxis ? xRatio : yRatio
      const value = max - (ratio * (max - min))

      live2d.setParameterValue(id, value)
    }
  }

  async function handleAxisChange(id: string, value: number) {
    const { min, max } = live2d.getParameterRange(id)

    live2d.setParameterValue(id, Math.max(min, value * max))
  }

  return {
    modelSize,
    handlePress,
    handleRelease,
    handleLoad,
    handleDestroy,
    handleResize,
    handleKeyChange,
    handleMouseChange,
    handleMouseMove,
    handleAxisChange,
  }
}
