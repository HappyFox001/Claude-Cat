<script setup lang="ts">
import { storeToRefs } from 'pinia'

import ProList from '@/components/pro-list/index.vue'
import ProShortcut from '@/components/pro-shortcut/index.vue'
import { useTauriShortcut } from '@/composables/useTauriShortcut'
import { toggleWindowVisible } from '@/plugins/window'
import { useCatStore } from '@/stores/cat'
import { useShortcutStore } from '@/stores/shortcut.ts'

const shortcutStore = useShortcutStore()
const { visibleCat, visiblePreference } = storeToRefs(shortcutStore)
const catStore = useCatStore()

useTauriShortcut(visibleCat, () => {
  catStore.window.visible = !catStore.window.visible
})

useTauriShortcut(visiblePreference, () => {
  toggleWindowVisible('preference')
})
</script>

<template>
  <ProList :title="$t('pages.preference.shortcut.title')">
    <ProShortcut
      v-model="shortcutStore.visibleCat"
      :description="$t('pages.preference.shortcut.hints.toggleCat')"
      :title="$t('pages.preference.shortcut.labels.toggleCat')"
    />

    <ProShortcut
      v-model="shortcutStore.visiblePreference"
      :description="$t('pages.preference.shortcut.hints.togglePreferences')"
      :title="$t('pages.preference.shortcut.labels.togglePreferences')"
    />
  </ProList>
</template>
