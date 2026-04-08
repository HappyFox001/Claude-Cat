import type { ModelSize } from '@/composables/useModel'
import type { Cubism4InternalModel } from 'pixi-live2d-display'

import { convertFileSrc } from '@tauri-apps/api/core'
import { readDir, readTextFile } from '@tauri-apps/plugin-fs'
import JSON5 from 'json5'
import { Cubism4ModelSettings, Live2DModel } from 'pixi-live2d-display'
import { Application, Ticker } from 'pixi.js'

import { join } from './path'

import { i18n } from '@/locales'

Live2DModel.registerTicker(Ticker)

class Live2d {
  private app: Application | null = null
  public model: Live2DModel | null = null

  constructor() {}

  private initApp() {
    if (this.app) return

    const view = document.getElementById('live2dCanvas') as HTMLCanvasElement

    this.app = new Application({
      view,
      resizeTo: window,
      backgroundAlpha: 0,
      resolution: devicePixelRatio,
    })
  }

  public async load(path: string) {
    this.initApp()

    this.destroy()

    const files = await readDir(path)

    const modelFile = files.find(file => file.name.endsWith('.model3.json'))

    if (!modelFile) {
      throw new Error(i18n.global.t('utils.live2d.hints.notFound'))
    }

    const modelPath = join(path, modelFile.name)

    const modelJSON = JSON5.parse(await readTextFile(modelPath))

    const modelSettings = new Cubism4ModelSettings({
      ...modelJSON,
      url: convertFileSrc(modelPath),
    })

    modelSettings.replaceFiles((file) => {
      return convertFileSrc(join(path, file))
    })

    this.model = await Live2DModel.from(modelSettings)

    this.app?.stage.addChild(this.model)

    // 确保模型处于标准状态（未缩放）时获取bounds
    this.model.scale.set(1.0)
    this.model.anchor.set(0, 0)
    this.model.position.set(0, 0)

    const bounds = this.model.getBounds()
    const { width, height } = bounds
    const { motions, expressions } = modelSettings

    if (import.meta.env.DEV) {
      console.log('[Live2D Load]', {
        modelBounds: { width, height },
        modelScale: this.model.scale.x,
      })
    }

    return {
      width,
      height,
      motions,
      expressions,
    }
  }

  public destroy() {
    if (!this.model) return

    this.model?.destroy()

    this.model = null
  }

  public resizeModel(modelSize: ModelSize) {
    if (!this.model) return

    const { width, height } = modelSize

    // 获取当前模型的实际bounds用于对比
    const currentBounds = this.model.getBounds()

    // 简化缩放逻辑：直接将模型缩放到窗口尺寸的90%
    // 留出10%的安全边距以确保耳朵等部分不被裁剪
    const safeAreaRatio = 0.9

    const scaleX = (innerWidth * safeAreaRatio) / width
    const scaleY = (innerHeight * safeAreaRatio) / height
    const finalScale = Math.min(scaleX, scaleY)

    // 调试日志
    if (import.meta.env.DEV) {
      console.log('[Live2D Resize]', {
        windowSize: { width: innerWidth, height: innerHeight },
        inputModelSize: { width, height },
        currentBounds: { width: currentBounds.width, height: currentBounds.height },
        currentModelScale: { x: this.model.scale.x, y: this.model.scale.y },
        calculatedScale: finalScale,
        safeAreaRatio,
        scaleX,
        scaleY,
      })
    }

    this.model.scale.set(finalScale)

    // 使用中心锚点定位，模型在窗口正中央
    // anchor (0.5, 0.5) 表示中心点
    this.model.anchor.set(0.5, 0.5)
    this.model.x = innerWidth / 2
    this.model.y = innerHeight / 2
  }

  public playMotion(group: string, index: number) {
    return this.model?.motion(group, index)
  }

  public playExpressions(index: number) {
    if (!this.model) {
      console.warn('[Live2D] Model not loaded yet')
      return
    }

    return this.model.expression(index)
  }

  public getCoreModel() {
    const internalModel = this.model?.internalModel as Cubism4InternalModel

    return internalModel?.coreModel
  }

  public getParameterRange(id: string) {
    const coreModel = this.getCoreModel()

    const index = coreModel?.getParameterIndex(id)
    const min = coreModel?.getParameterMinimumValue(index)
    const max = coreModel?.getParameterMaximumValue(index)

    return {
      min,
      max,
    }
  }

  public setParameterValue(id: string, value: number | boolean) {
    const coreModel = this.getCoreModel()

    return coreModel?.setParameterValueById?.(id, Number(value))
  }

  public getParameterValue(id: string): number | undefined {
    const coreModel = this.getCoreModel()
    const index = coreModel?.getParameterIndex(id)
    if (index === undefined || index < 0) return undefined
    return coreModel?.getParameterValueById?.(id)
  }
}

const live2d = new Live2d()

// Expose to window for debugging in console
if (import.meta.env.DEV) {
  ;(window as any).live2d = live2d
}

export default live2d
