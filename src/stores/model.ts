import { resolveResource } from '@tauri-apps/api/path'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { join } from '@/utils/path'

export type ModelMode = 'void_cat_marinki'

export interface Model {
  id: string
  path: string
  mode: ModelMode
  isPreset: boolean
}

interface Motion {
  Name: string
  File: string
  Sound?: string
  FadeInTime: number
  FadeOutTime: number
  Description?: string
}

type MotionGroup = Record<string, Motion[]>

interface Expression {
  Name: string
  File: string
  Description?: string
}

export const useModelStore = defineStore('model', () => {
  const models = ref<Model[]>([])
  const currentModel = ref<Model>()
  const motions = ref<MotionGroup>({})
  const expressions = ref<Expression[]>([])

  const init = async () => {
    const modelsPath = await resolveResource('assets/models')

    // 只使用预设模型，始终更新路径确保正确
    const presetModel: Model = {
      id: currentModel.value?.id ?? nanoid(),
      mode: 'void_cat_marinki',
      isPreset: true,
      path: join(modelsPath, 'void_cat_marinki'),
    }

    // 始终更新 currentModel 确保路径正确
    currentModel.value = presetModel
    models.value = [presetModel]
  }

  return {
    models,
    currentModel,
    motions,
    expressions,
    init,
  }
}, {
  tauri: {
    // 不持久化模型数据，因为路径在每次启动时需要重新解析
    filterKeys: [],
    filterKeysStrategy: 'pick',
  },
})
