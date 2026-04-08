<script setup lang="ts">
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart'
import { InputNumber, Select, Slider, Switch } from 'ant-design-vue'
import { watch } from 'vue'

import MacosPermissions from '../general/components/macos-permissions/index.vue'
import ThemeMode from '../general/components/theme-mode/index.vue'

import ClaudeHooksStatus from './components/claude-hooks-status/index.vue'
import Position from './components/position/index.vue'

import ProList from '@/components/pro-list/index.vue'
import ProListItem from '@/components/pro-list-item/index.vue'
import { MAX_SCALE, MIN_SCALE, useCatStore } from '@/stores/cat'
import { useGeneralStore } from '@/stores/general'

const generalStore = useGeneralStore()
const catStore = useCatStore()

watch(() => generalStore.app.autostart, async (value) => {
  const enabled = await isEnabled()

  if (value && !enabled) {
    return enable()
  }

  if (!value && enabled) {
    disable()
  }
}, { immediate: true })
</script>

<template>
  <MacosPermissions />

  <!-- Claude Hooks 状态 -->
  <ClaudeHooksStatus />

  <!-- 窗口设置 -->
  <ProList :title="$t('pages.preference.cat.labels.windowSettings')">
    <Position />

    <ProListItem
      :description="$t('pages.preference.cat.hints.passThrough')"
      :title="$t('pages.preference.cat.labels.passThrough')"
    >
      <Switch v-model:checked="catStore.window.passThrough" />
    </ProListItem>

    <ProListItem
      :description="$t('pages.preference.cat.hints.alwaysOnTop')"
      :title="$t('pages.preference.cat.labels.alwaysOnTop')"
    >
      <Switch v-model:checked="catStore.window.alwaysOnTop" />
    </ProListItem>

    <ProListItem
      :description="$t('pages.preference.cat.hints.hideOnHover')"
      :title="$t('pages.preference.cat.labels.hideOnHover')"
    >
      <Switch v-model:checked="catStore.window.hideOnHover" />
    </ProListItem>

    <ProListItem
      :description="$t('pages.preference.cat.hints.windowSize')"
      :title="$t('pages.preference.cat.labels.windowSize')"
    >
      <InputNumber
        v-model:value="catStore.window.scale"
        addon-after="%"
        class="w-28"
        :max="MAX_SCALE"
        :min="MIN_SCALE"
      />
    </ProListItem>

    <ProListItem :title="$t('pages.preference.cat.labels.windowRadius')">
      <InputNumber
        v-model:value="catStore.window.radius"
        addon-after="%"
        class="w-28"
        :min="0"
      />
    </ProListItem>

    <ProListItem
      :title="$t('pages.preference.cat.labels.opacity')"
      vertical
    >
      <Slider
        v-model:value="catStore.window.opacity"
        class="m-[0]!"
        :max="100"
        :min="10"
        :tip-formatter="(value) => `${value}%`"
      />
    </ProListItem>
  </ProList>

  <!-- 应用设置 -->
  <ProList :title="$t('pages.preference.general.labels.appSettings')">
    <ProListItem :title="$t('pages.preference.general.labels.launchOnStartup')">
      <Switch v-model:checked="generalStore.app.autostart" />
    </ProListItem>

    <ProListItem
      :description="$t('pages.preference.general.hints.showTaskbarIcon')"
      :title="$t('pages.preference.general.labels.showTaskbarIcon')"
    >
      <Switch v-model:checked="generalStore.app.taskbarVisible" />
    </ProListItem>
  </ProList>

  <!-- 外观设置 -->
  <ProList :title="$t('pages.preference.general.labels.appearanceSettings')">
    <ThemeMode />

    <ProListItem :title="$t('pages.preference.general.labels.language')">
      <Select v-model:value="generalStore.appearance.language">
        <Select.Option value="zh-CN">
          简体中文
        </Select.Option>
        <Select.Option value="en-US">
          English
        </Select.Option>
        <Select.Option value="vi-VN">
          Tiếng Việt
        </Select.Option>
        <Select.Option value="pt-BR">
          Português
        </Select.Option>
      </Select>
    </ProListItem>
  </ProList>

  <!-- 更新设置 -->
  <ProList :title="$t('pages.preference.general.labels.updateSettings')">
    <ProListItem :title="$t('pages.preference.general.labels.autoCheckUpdate')">
      <Switch v-model:checked="generalStore.update.autoCheck" />
    </ProListItem>
  </ProList>
</template>
