<script setup lang="ts">
import { Flex } from 'ant-design-vue'
import { computed, useSlots } from 'vue'

const { title, description, vertical } = defineProps<{
  title: string
  description?: string
  vertical?: boolean
}>()

const slots = useSlots()

const hasDescription = computed(() => {
  return description || slots.description
})
</script>

<template>
  <Flex
    :align="vertical ? void 0 : 'center'"
    class="pro-list-item b b-color-2 rounded-lg b-solid bg-color-3 p-4"
    :gap="vertical ? 'middle' : 'large'"
    justify="space-between"
    :vertical="vertical"
  >
    <Flex
      align="center"
      class="flex-1"
    >
      <!-- 小指示器 -->
      <span class="item-indicator">›</span>
      <Flex vertical>
        <div class="text-sm font-medium">
          {{ title }}
        </div>

        <div
          class="break-all text-xs [&_a]:(active:text-color-primary-7 hover:text-color-primary-5 text-color-3) text-color-3"
          :class="{ 'mt-2': hasDescription }"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </div>
      </Flex>
    </Flex>

    <slot />
  </Flex>
</template>

<style scoped>
.pro-list-item {
  position: relative;
  transition: all 0.2s ease;
}

.pro-list-item:hover {
  border-color: var(--color-primary-3);
}

.item-indicator {
  font-family: var(--font-mono);
  color: var(--color-primary-5);
  margin-right: 8px;
  font-size: 14px;
  opacity: 0.6;
  transition: all 0.2s;
}

.pro-list-item:hover .item-indicator {
  opacity: 1;
  transform: translateX(2px);
}
</style>
