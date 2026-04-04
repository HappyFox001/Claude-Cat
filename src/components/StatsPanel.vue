<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, ref } from 'vue'

import { useStatsStore } from '@/stores/statistics'

const statsStore = useStatsStore()
const visible = ref(false)

// 格式化工作时长（秒 -> 时:分:秒）
const formattedDuration = computed(() => {
  const totalSeconds = statsStore.workDuration
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
})

// 按下 Ctrl/Cmd + S 切换显示
useEventListener('keydown', (e: KeyboardEvent) => {
  // Ctrl+Shift+S (or Cmd+Shift+S on Mac) to toggle stats panel
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
    e.preventDefault()
    visible.value = !visible.value
  }
})
</script>

<template>
  <div
    v-if="visible"
    class="absolute inset-0 flex items-center justify-center bg-black/70 p-8 backdrop-blur-sm"
    @click="visible = false"
  >
    <div
      class="min-w-80 rounded-lg bg-white/95 p-6 shadow-2xl"
      @click.stop
    >
      <h2 class="mb-4 text-center text-xl font-bold text-gray-800">
        Claude Code 统计
      </h2>

      <div class="space-y-3">
        <!-- 今日使用次数 -->
        <div class="flex items-center justify-between rounded-lg bg-blue-50 p-3">
          <span class="font-medium text-gray-700">今日使用次数</span>
          <span class="text-2xl font-bold text-blue-600">{{ statsStore.todayCount }}</span>
        </div>

        <!-- 成功率 -->
        <div class="flex items-center justify-between rounded-lg bg-green-50 p-3">
          <span class="font-medium text-gray-700">成功率</span>
          <span class="text-2xl font-bold text-green-600">{{ statsStore.successRate }}%</span>
        </div>

        <!-- 工作时长 -->
        <div class="flex items-center justify-between rounded-lg bg-purple-50 p-3">
          <span class="font-medium text-gray-700">工作时长</span>
          <span class="text-2xl font-bold text-purple-600">{{ formattedDuration }}</span>
        </div>

        <!-- 最常用工具 -->
        <div
          v-if="statsStore.mostUsedTool"
          class="flex items-center justify-between rounded-lg bg-orange-50 p-3"
        >
          <span class="font-medium text-gray-700">最常用工具</span>
          <span class="text-lg font-bold text-orange-600">{{ statsStore.mostUsedTool }}</span>
        </div>

        <!-- 工具使用列表 -->
        <div
          v-if="statsStore.toolsList.length > 0"
          class="mt-4 max-h-60 overflow-y-auto rounded-lg bg-gray-50 p-3"
        >
          <h3 class="mb-2 text-sm font-semibold text-gray-600">
            工具使用详情
          </h3>
          <div class="space-y-2">
            <div
              v-for="tool in statsStore.toolsList"
              :key="tool.name"
              class="flex items-center justify-between text-sm"
            >
              <span class="font-medium text-gray-700">{{ tool.name }}</span>
              <div class="flex gap-2 text-xs">
                <span class="text-gray-500">总计: {{ tool.count }}</span>
                <span class="text-green-600">成功: {{ tool.successCount }}</span>
                <span class="text-red-600">失败: {{ tool.failCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 text-center text-xs text-gray-500">
        按 Ctrl+Shift+S (Mac: Cmd+Shift+S) 关闭
      </div>
    </div>
  </div>
</template>
