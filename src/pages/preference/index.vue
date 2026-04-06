<script setup lang="ts">
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { Flex } from 'ant-design-vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import About from './components/about/index.vue'
import Cat from './components/cat/index.vue'
import General from './components/general/index.vue'
import Model from './components/model/index.vue'
import Shortcut from './components/shortcut/index.vue'

import SettingsDecor from '@/components/SettingsDecor.vue'
import UpdateApp from '@/components/update-app/index.vue'
import { useTray } from '@/composables/useTray'
import { useAppStore } from '@/stores/app'
import { useGeneralStore } from '@/stores/general'
import { isMac } from '@/utils/platform'

const { createTray } = useTray()
const appStore = useAppStore()
const current = ref(0)
const { t } = useI18n()
const generalStore = useGeneralStore()
const appWindow = getCurrentWebviewWindow()

onMounted(async () => {
  createTray()
})

watch(() => generalStore.appearance.language, () => {
  appWindow.setTitle(t('pages.preference.title'))
}, { immediate: true })

const menus = computed(() => [
  {
    label: t('pages.preference.general.title'),
    icon: 'i-solar:settings-minimalistic-bold',
    component: Cat,
    decor: 'general' as const,
  },
  {
    label: t('pages.preference.cat.title'),
    icon: 'i-solar:cat-bold',
    component: General,
    decor: 'cat' as const,
  },
  {
    label: t('pages.preference.model.title'),
    icon: 'i-solar:magic-stick-3-bold',
    component: Model,
    decor: 'model' as const,
  },
  {
    label: t('pages.preference.shortcut.title'),
    icon: 'i-solar:keyboard-bold',
    component: Shortcut,
    decor: 'shortcut' as const,
  },
  {
    label: t('pages.preference.about.title'),
    icon: 'i-solar:info-circle-bold',
    component: About,
    decor: 'about' as const,
  },
])
</script>

<template>
  <Flex class="h-screen relative">
    <!-- 顶部拖拽区域 (macOS 红绿灯区域 / Windows 标题栏) -->
    <div
      class="drag-region absolute top-0 left-0 right-0 z-50"
      :class="isMac ? 'h-8' : 'h-7'"
      data-tauri-drag-region
    />

    <!-- 左侧边栏 -->
    <div
      class="sidebar h-full w-30 flex flex-col items-center gap-4 dark:(bg-color-3 bg-none) bg-gradient-from-primary-1 bg-gradient-to-black/1 bg-gradient-linear"
      :class="[isMac ? 'pt-8' : 'pt-4']"
    >
      <!-- Logo 区域 - 可拖拽 -->
      <div
        class="flex flex-col items-center gap-2"
        data-tauri-drag-region
      >
        <img
          class="size-18 pointer-events-none"
          src="/logo.png"
        >
        <span class="font-bold pointer-events-none">{{ appStore.name }}</span>
      </div>

      <!-- 菜单区域 -->
      <div class="flex flex-col gap-2">
        <div
          v-for="(item, index) in menus"
          :key="item.label"
          class="size-20 flex flex-col cursor-pointer items-center justify-center gap-2 rounded-lg hover:bg-color-7 dark:text-color-2 text-color-3 transition"
          :class="{ 'bg-color-2! text-primary-5 dark:text-primary-7 font-bold dark:bg-color-8!': current === index }"
          @click="current = index"
        >
          <div
            class="size-8"
            :class="item.icon"
          />
          <span>{{ item.label }}</span>
        </div>
      </div>

      <!-- 底部空白区域 - 可拖拽 -->
      <div class="flex-1 w-full" data-tauri-drag-region />
    </div>

    <div
      v-for="(item, index) in menus"
      v-show="current === index"
      :key="item.label"
      class="flex flex-1 overflow-hidden bg-color-8 dark:bg-color-2"
    >
      <!-- 主内容区 -->
      <div class="flex-1 overflow-auto p-4">
        <component :is="item.component" />
      </div>

      <!-- 右侧装饰区 - 窗口宽度 > 900px 时显示 -->
      <SettingsDecor :variant="item.decor" class="hidden lg:flex" />
    </div>
  </Flex>

  <UpdateApp />
</template>

<style scoped>
/* 拖拽区域样式 */
.drag-region {
  -webkit-app-region: drag;
  app-region: drag;
}

/* 侧边栏内可拖拽元素 */
.sidebar [data-tauri-drag-region] {
  -webkit-app-region: drag;
  app-region: drag;
}

/* 确保图片和文字不阻止拖拽 */
.pointer-events-none {
  pointer-events: none;
}
</style>
