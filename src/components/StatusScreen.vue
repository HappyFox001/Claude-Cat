<script setup lang="ts">
import { computed, ref } from 'vue'

import { useStatsStore } from '@/stores/statistics'

const statsStore = useStatsStore()
const currentState = ref('idle')
const currentTime = ref(new Date())

// 状态显示配置
const stateConfig: Record<string, { text: string; emoji: string; color: string }> = {
  idle: { text: '休息中', emoji: '😺', color: '#64748b' },
  thinking: { text: '思考中', emoji: '🤔', color: '#f59e0b' },
  coding: { text: '编码中', emoji: '⌨️', color: '#8b5cf6' },
  reading: { text: '阅读中', emoji: '📖', color: '#3b82f6' },
  running: { text: '运行中', emoji: '⚡', color: '#10b981' },
  error: { text: '出错了', emoji: '😿', color: '#ef4444' },
  celebrate: { text: '庆祝！', emoji: '🎉', color: '#ec4899' },
}

// 监听 Claude 状态变化
if (typeof window !== 'undefined') {
  ;(window as any).__updateStatusScreen = (state: string) => {
    currentState.value = state
  }
}

// 更新时间
setInterval(() => {
  currentTime.value = new Date()
}, 1000)

// 格式化工作时长
const formattedDuration = computed(() => {
  const totalSeconds = statsStore.workDuration
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
})

// 格式化时间
const formattedTime = computed(() => {
  const hours = currentTime.value.getHours().toString().padStart(2, '0')
  const minutes = currentTime.value.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

const currentStateConfig = computed(() => stateConfig[currentState.value] || stateConfig.idle)
</script>

<template>
  <div class="status-screen">
    <!-- 顶部装饰 -->
    <div class="screen-header">
      <div class="cat-ears">
        <div class="ear ear-left" />
        <div class="ear ear-right" />
      </div>
      <div class="screen-title">Claude Meow</div>
    </div>

    <!-- 主显示区域 -->
    <div class="screen-body">
      <!-- 状态区域 -->
      <div class="status-section">
        <div class="status-icon" :style="{ color: currentStateConfig.color }">
          {{ currentStateConfig.emoji }}
        </div>
        <div class="status-text" :style="{ color: currentStateConfig.color }">
          {{ currentStateConfig.text }}
        </div>
        <div class="status-pulse" :style="{ backgroundColor: currentStateConfig.color }" />
      </div>

      <!-- 分隔线 -->
      <div class="divider">
        <div class="paw">🐾</div>
      </div>

      <!-- 统计区域 -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-label">今日次数</div>
            <div class="stat-value">{{ statsStore.todayCount }}</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-label">工作时长</div>
            <div class="stat-value">{{ formattedDuration }}</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">✨</div>
          <div class="stat-content">
            <div class="stat-label">成功率</div>
            <div class="stat-value">{{ statsStore.successRate }}%</div>
          </div>
        </div>
      </div>

      <!-- 底部时间 -->
      <div class="screen-footer">
        <div class="footer-time">{{ formattedTime }}</div>
        <div class="footer-cat">ฅ^•ﻌ•^ฅ</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-screen {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 180px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 20px;
  padding: 16px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #fff;
  user-select: none;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.screen-header {
  position: relative;
  text-align: center;
  margin-bottom: 16px;
}

.cat-ears {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 60px;
}

.ear {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 20px solid #1a1a1a;
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.3));
}

.screen-title {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.screen-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 状态区域 */
.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  position: relative;
}

.status-icon {
  font-size: 36px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.status-pulse {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

/* 分隔线 */
.divider {
  position: relative;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  display: flex;
  justify-content: center;
}

.paw {
  position: absolute;
  top: -10px;
  font-size: 16px;
  background: #1a1a1a;
  padding: 0 8px;
}

/* 统计区域 */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(0, 0, 0, 0.4);
  transform: translateX(2px);
}

.stat-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.stat-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 11px;
  color: #9ca3af;
}

.stat-value {
  font-size: 13px;
  font-weight: 600;
  color: #fbbf24;
}

/* 底部 */
.screen-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-time {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}

.footer-cat {
  font-size: 12px;
  color: #f59e0b;
}
</style>
