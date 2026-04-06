<script setup lang="ts">
import type { Key } from '@/utils/keyboard'

import { find, map, some, split } from 'es-toolkit/compat'
import { ref, useTemplateRef, watch } from 'vue'

import ProListItem from '@/components/pro-list-item/index.vue'
import { keys, modifierKeys, standardKeys } from '@/utils/keyboard'

const props = defineProps<{
  title: string
  description?: string
}>()

const modelValue = defineModel<string>()
const shortcutInputRef = useTemplateRef('shortcutInput')
const isFocusing = ref(false)
const isHovering = ref(false)
const pressedKeys = ref<Key[]>([])
const isRecordingComplete = ref(false)

watch(modelValue, () => {
  parseModelValue()
}, { immediate: true })

function parseModelValue() {
  if (!modelValue.value) {
    return pressedKeys.value = []
  }

  pressedKeys.value = split(modelValue.value, '+').map((tauriKey) => {
    return find(keys, { tauriKey })!
  }).filter(Boolean)
}

function getEventKey(event: KeyboardEvent) {
  const { key, code } = event

  const eventKey = key.replace('Meta', 'Command')

  const isModifierKey = some(modifierKeys, { eventKey })

  return isModifierKey ? eventKey : code
}

function isValidShortcut(keysToCheck: Key[]) {
  // F1-F12 单独可用
  if (keysToCheck?.[0]?.eventKey?.startsWith('F')) {
    return true
  }

  const hasModifierKey = some(keysToCheck, ({ eventKey }) => {
    return some(modifierKeys, { eventKey })
  })
  const hasStandardKey = some(keysToCheck, ({ eventKey }) => {
    return some(standardKeys, { eventKey })
  })

  return hasModifierKey && hasStandardKey
}

function handleFocus() {
  isFocusing.value = true
  isRecordingComplete.value = false
  pressedKeys.value = []
}

function handleBlur() {
  isFocusing.value = false

  if (!isValidShortcut(pressedKeys.value)) {
    return parseModelValue()
  }

  modelValue.value = map(pressedKeys.value, 'tauriKey').join('+')
}

function handleKeyDown(event: KeyboardEvent) {
  event.preventDefault()

  // 如果已经录制完成，忽略后续按键
  if (isRecordingComplete.value) return

  const eventKey = getEventKey(event)
  const matched = find(keys, { eventKey })

  if (!matched) return

  // 检查是否是修饰键
  const isModifier = some(modifierKeys, { eventKey })

  if (isModifier) {
    // 修饰键：添加到列表（如果不存在）
    const isDuplicate = some(pressedKeys.value, { eventKey })
    if (!isDuplicate) {
      pressedKeys.value.push(matched)
    }
  }
  else {
    // 非修饰键（标准键）：完成录制
    // 确保修饰键在前，标准键在后
    const modifiers = pressedKeys.value.filter(k =>
      some(modifierKeys, { eventKey: k.eventKey }),
    )
    pressedKeys.value = [...modifiers, matched]

    // 检查是否有效，有效则完成录制
    if (isValidShortcut(pressedKeys.value)) {
      isRecordingComplete.value = true
      // 延迟 blur 让用户看到结果
      setTimeout(() => {
        shortcutInputRef.value?.blur()
      }, 100)
    }
  }
}

function handleKeyUp(_event: KeyboardEvent) {
  // 不再移除按键，保持录制的组合
}
</script>

<template>
  <ProListItem v-bind="props">
    <div
      ref="shortcutInput"
      align="center"
      class="relative h-8 min-w-32 flex cursor-text items-center justify-center b b-color-1 hover:b-primary-5 rounded-md b-solid px-2.5 text-color-3 outline-none transition focus:(b-primary shadow-[0_0_0_2px_rgba(5,145,255,0.1)])"
      justify="center"
      :tabindex="0"
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
      @mouseout="isHovering = false"
      @mouseover="isHovering = true"
    >
      <span v-if="pressedKeys.length === 0">
        {{ isFocusing ? $t('components.proShortcut.hints.pressRecordShortcut') : $t('components.proShortcut.hints.clickRecordShortcut') }}
      </span>

      <span class="text-primary font-bold">
        {{ map(pressedKeys, 'symbol').join(' + ') }}
      </span>

      <div
        class="i-iconamoon:close-circle-1 absolute right-2 cursor-pointer text-4 transition hover:text-primary"
        :hidden="isFocusing || !isHovering || pressedKeys.length === 0"
        @mousedown.prevent="modelValue = ''"
      />
    </div>
  </ProListItem>
</template>
