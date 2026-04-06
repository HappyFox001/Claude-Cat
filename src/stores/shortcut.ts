import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useShortcutStore = defineStore('shortcut', () => {
  const visibleCat = ref('')
  const visiblePreference = ref('')

  return {
    visibleCat,
    visiblePreference,
  }
})
