import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface CatStore {
  model: {
    mirror: boolean
    mouseMirror: boolean
  }
  window: {
    visible: boolean
    passThrough: boolean
    alwaysOnTop: boolean
    scale: number
    opacity: number
    radius: number
    hideOnHover: boolean
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  }
}

export const useCatStore = defineStore('cat', () => {
  const model = reactive<CatStore['model']>({
    mirror: false,
    mouseMirror: false,
  })

  const window = reactive<CatStore['window']>({
    visible: true,
    passThrough: false,
    alwaysOnTop: false,
    scale: 5,
    opacity: 100,
    radius: 0,
    hideOnHover: false,
    position: 'bottomRight',
  })

  return {
    model,
    window,
  }
})
