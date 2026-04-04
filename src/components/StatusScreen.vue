<script setup lang="ts">
import { computed, ref } from 'vue'

import { useStatsStore } from '@/stores/statistics'

const statsStore = useStatsStore()
const currentState = ref('idle')
const currentTime = ref(new Date())

// 状态显示配置
const stateConfig: Record<string, { text: string; icon: string; color: string }> = {
  idle: { text: '休息中', icon: 'sleep', color: '#64748b' },
  thinking: { text: '思考中', icon: 'thinking', color: '#f59e0b' },
  coding: { text: '编码中', icon: 'code', color: '#8b5cf6' },
  reading: { text: '阅读中', icon: 'read', color: '#3b82f6' },
  running: { text: '运行中', icon: 'run', color: '#10b981' },
  error: { text: '出错了', icon: 'error', color: '#ef4444' },
  celebrate: { text: '庆祝', icon: 'celebrate', color: '#ec4899' },
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
        <div class="status-icon-wrapper">
          <!-- 简笔画图标 -->
          <div class="icon-base" :class="`icon-${currentStateConfig.icon}`" :style="{ borderColor: currentStateConfig.color }">
            <div class="icon-inner" :style="{ backgroundColor: currentStateConfig.color }" />
          </div>
        </div>
        <div class="status-text" :style="{ color: currentStateConfig.color }">
          {{ currentStateConfig.text }}
        </div>
        <div class="status-pulse" :style="{ backgroundColor: currentStateConfig.color }" />
      </div>

      <!-- 统计区域 -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-dot" style="background: #3b82f6" />
          <div class="stat-content">
            <div class="stat-label">次数</div>
            <div class="stat-value">{{ statsStore.todayCount }}</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-dot" style="background: #8b5cf6" />
          <div class="stat-content">
            <div class="stat-label">时长</div>
            <div class="stat-value">{{ formattedDuration }}</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-dot" style="background: #10b981" />
          <div class="stat-content">
            <div class="stat-label">成功</div>
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
  position: fixed;
  left: 12px;
  top: 12px;
  width: 140px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 14px;
  padding: 8px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.6),
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
  margin-bottom: 6px;
}

.cat-ears {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 48px;
}

.ear {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 14px solid #1a1a1a;
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.3));
}

.screen-title {
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

.screen-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 状态区域 */
.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  position: relative;
}

.status-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
}

/* 简笔画图标基础样式 */
.icon-base {
  width: 28px;
  height: 28px;
  border: 2px solid;
  border-radius: 50%;
  position: relative;
  animation: iconFloat 3s ease-in-out infinite;
}

.icon-inner {
  position: absolute;
  border-radius: 50%;
}

/* 图标动画 */
@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

/* 不同状态的图标 */
.icon-sleep .icon-inner {
  width: 10px;
  height: 2px;
  border-radius: 1px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 -5px 0 currentColor, 0 5px 0 currentColor;
}

.icon-thinking .icon-inner {
  width: 5px;
  height: 5px;
  top: 6px;
  left: 10px;
  box-shadow: 5px 0 0 currentColor, 0 8px 0 1px currentColor;
}

.icon-code .icon-inner {
  width: 10px;
  height: 2px;
  top: 8px;
  left: 8px;
  box-shadow:
    0 3px 0 currentColor,
    0 6px 0 currentColor,
    0 9px 0 currentColor;
}

.icon-read .icon-inner {
  width: 12px;
  height: 8px;
  top: 9px;
  left: 7px;
  border-top: 2px solid currentColor;
  border-radius: 0;
  background: transparent;
}

.icon-run .icon-inner {
  width: 0;
  height: 0;
  border-left: 10px solid currentColor;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-radius: 0;
  top: 7px;
  left: 10px;
}

.icon-error .icon-inner {
  width: 2px;
  height: 12px;
  top: 5px;
  left: 13px;
  border-radius: 1px;
}

.icon-error .icon-inner::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: currentColor;
  bottom: -5px;
  left: 0;
}

.icon-celebrate .icon-inner {
  width: 3px;
  height: 3px;
  top: 12px;
  left: 12px;
  box-shadow:
    -7px -7px 0 currentColor,
    7px -7px 0 currentColor,
    -7px 7px 0 currentColor,
    7px 7px 0 currentColor;
}

.status-text {
  font-size: 11px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.status-pulse {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

/* 统计区域 */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(0, 0, 0, 0.35);
  transform: translateX(2px);
}

.stat-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 10px;
  color: #9ca3af;
}

.stat-value {
  font-size: 11px;
  font-weight: 600;
  color: #fbbf24;
}

/* 底部 */
.screen-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0;
}

.footer-time {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}

.footer-cat {
  font-size: 9px;
  color: #f59e0b;
}
</style>
