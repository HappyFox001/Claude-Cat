<script setup lang="ts">
import ProList from '@/components/pro-list/index.vue'
import ProShortcut from '@/components/pro-shortcut/index.vue'
import { useShortcutStore } from '@/stores/shortcut'

// 快捷键注册已在 App.vue 中通过 useGlobalShortcuts 处理
// 此页面仅用于显示和编辑快捷键配置
const shortcutStore = useShortcutStore()
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
