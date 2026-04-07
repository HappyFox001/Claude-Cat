<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { Button, message } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ProList from '@/components/pro-list/index.vue'
import ProListItem from '@/components/pro-list-item/index.vue'

const { t } = useI18n()

interface HookStatus {
  claude_settings_exists: boolean
  hooks_configured: boolean
  hook_script_exists: boolean
  required_hooks: string[]
  configured_hooks: string[]
}

const hookStatus = ref<HookStatus | null>(null)
const loading = ref(false)
const installing = ref(false)

const statusText = computed(() => {
  if (!hookStatus.value)
    return t('pages.preference.cat.claudeHooks.checking')

  if (!hookStatus.value.claude_settings_exists)
    return t('pages.preference.cat.claudeHooks.settingsNotFound')

  if (!hookStatus.value.hook_script_exists)
    return t('pages.preference.cat.claudeHooks.scriptNotFound')

  if (hookStatus.value.hooks_configured)
    return t('pages.preference.cat.claudeHooks.configured')

  return t('pages.preference.cat.claudeHooks.notConfigured')
})

const statusType = computed(() => {
  if (!hookStatus.value)
    return 'default'

  if (hookStatus.value.hooks_configured)
    return 'success'

  if (!hookStatus.value.claude_settings_exists || !hookStatus.value.hook_script_exists)
    return 'danger'

  return 'warning'
})

const canInstall = computed(() => {
  return hookStatus.value
    && hookStatus.value.hook_script_exists
    && !hookStatus.value.hooks_configured
})

async function checkStatus() {
  loading.value = true
  try {
    hookStatus.value = await invoke<HookStatus>('check_claude_hooks_status')
  }
  catch (error) {
    message.error(t('pages.preference.cat.claudeHooks.checkError', { error: String(error) }))
  }
  finally {
    loading.value = false
  }
}

async function installHooks() {
  installing.value = true
  try {
    const result = await invoke<string>('install_claude_hooks')
    message.success(t('pages.preference.cat.claudeHooks.installSuccess'))
    // Re-check status after installation
    await checkStatus()
  }
  catch (error) {
    message.error(t('pages.preference.cat.claudeHooks.installError', { error: String(error) }))
  }
  finally {
    installing.value = false
  }
}

async function openSettings() {
  try {
    await invoke('open_claude_settings')
    message.success(t('pages.preference.cat.claudeHooks.settingsOpened'))
  }
  catch (error) {
    message.error(t('pages.preference.cat.claudeHooks.openError', { error: String(error) }))
  }
}

async function debugPaths() {
  try {
    const info = await invoke<string>('debug_hook_paths')
    console.log('=== Debug Hook Paths ===')
    console.log(info)
    message.info('路径信息已输出到控制台，请按 F12 查看')
  }
  catch (error) {
    message.error(`调试失败: ${error}`)
  }
}

onMounted(() => {
  checkStatus()
})
</script>

<template>
  <ProList :title="$t('pages.preference.cat.claudeHooks.title')">
    <ProListItem
      :description="$t('pages.preference.cat.claudeHooks.description')"
      :title="$t('pages.preference.cat.claudeHooks.status')"
      vertical
    >
      <div class="flex flex-col gap-3">
        <!-- Status Badge -->
        <div class="flex items-center gap-2">
          <div
            class="size-2 rounded-full"
            :class="{
              'bg-green-500': statusType === 'success',
              'bg-yellow-500': statusType === 'warning',
              'bg-red-500': statusType === 'danger',
              'bg-gray-400': statusType === 'default',
            }"
          />
          <span class="text-sm">{{ statusText }}</span>
        </div>

        <!-- Hook Details -->
        <div v-if="hookStatus" class="text-xs text-color-6 dark:text-color-4 space-y-1">
          <div>
            <span>{{ $t('pages.preference.cat.claudeHooks.settingsFile') }}: </span>
            <span :class="hookStatus.claude_settings_exists ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ hookStatus.claude_settings_exists ? '✓' : '✗' }}
            </span>
          </div>
          <div>
            <span>{{ $t('pages.preference.cat.claudeHooks.hookScript') }}: </span>
            <span :class="hookStatus.hook_script_exists ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ hookStatus.hook_script_exists ? '✓' : '✗' }}
            </span>
          </div>
          <div>
            <span>{{ $t('pages.preference.cat.claudeHooks.configuredHooks') }}: </span>
            <span>{{ hookStatus.configured_hooks.length }} / {{ hookStatus.required_hooks.length }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <Button
            :loading="loading"
            size="small"
            @click="checkStatus"
          >
            {{ $t('pages.preference.cat.claudeHooks.refresh') }}
          </Button>

          <Button
            v-if="canInstall"
            type="primary"
            size="small"
            :loading="installing"
            @click="installHooks"
          >
            {{ $t('pages.preference.cat.claudeHooks.installButton') }}
          </Button>

          <Button
            v-if="hookStatus?.claude_settings_exists"
            size="small"
            @click="openSettings"
          >
            {{ $t('pages.preference.cat.claudeHooks.openSettings') }}
          </Button>

          <Button
            size="small"
            type="dashed"
            @click="debugPaths"
          >
            🐛 调试路径
          </Button>
        </div>

        <!-- Help Text -->
        <div v-if="!hookStatus?.hooks_configured" class="text-xs text-color-6 dark:text-color-4 mt-2">
          <p>{{ $t('pages.preference.cat.claudeHooks.helpText') }}</p>
        </div>
      </div>
    </ProListItem>
  </ProList>
</template>
