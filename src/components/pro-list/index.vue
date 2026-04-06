<script setup lang="ts">
import { Flex } from 'ant-design-vue'

const { title } = defineProps<{
  title: string
}>()
</script>

<template>
  <Flex
    class="pro-list not-last:mb-5"
    gap="small"
    vertical
  >
    <!-- ASCII 风格标题 -->
    <div
      class="pro-list-title"
      data-tauri-drag-region
    >
      <span class="title-bracket">「</span>
      <span class="title-text">{{ title }}</span>
      <span class="title-bracket">」</span>
      <span class="title-line" />
    </div>

    <Flex
      gap="middle"
      vertical
    >
      <slot />
    </Flex>
  </Flex>
</template>

<style scoped>
.pro-list-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.title-bracket {
  color: var(--color-primary-5);
  font-family: var(--font-mono);
  font-size: 12px;
}

.title-text {
  color: var(--color-text-1);
}

.title-line {
  flex: 1;
  height: 1px;
  margin-left: 8px;
  background: linear-gradient(
    90deg,
    var(--color-border-2) 0%,
    transparent 100%
  );
}
</style>
