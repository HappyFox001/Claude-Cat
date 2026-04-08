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

    const bounds = this.model.getBounds()
    const { width, height } = bounds
    const { motions, expressions } = modelSettings

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

    // 添加10%的边距以确保模型完全可见
    const padding = 0.1
    const availableWidth = innerWidth * (1 - padding)
    const availableHeight = innerHeight * (1 - padding)

    const scaleX = availableWidth / width
    const scaleY = availableHeight / height
    const scale = Math.min(scaleX, scaleY)

    this.model.scale.set(scale)

    // 使用底部中心锚点，确保头部不会被切掉
    // anchor (0.5, 1) 表示底部中心点
    this.model.anchor.set(0.5, 1)
    this.model.x = innerWidth / 2
    // 将模型底部对齐到窗口底部（留一点边距）
    this.model.y = innerHeight * 0.98
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
