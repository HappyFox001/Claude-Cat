<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { useStatsStore } from '@/stores/statistics'

const statsStore = useStatsStore()
const currentState = ref('idle')
const currentTime = ref(new Date())
const displayText = ref('')
const isTyping = ref(false)

// 状态显示配置 - 更可爱的文案
const stateConfig: Record<string, { text: string; bubble: string; color: string }> = {
  idle: { text: '休息中~', bubble: '喵～在休息呢...zzZ', color: '#94a3b8' },
  thinking: { text: '思考中', bubble: '嗯...让我想想喵~', color: '#fbbf24' },
  coding: { text: '编码中', bubble: '敲代码中喵！', color: '#a78bfa' },
  reading: { text: '阅读中', bubble: '认真看文件喵...', color: '#60a5fa' },
  running: { text: '运行中', bubble: '跑起来啦喵！', color: '#34d399' },
  error: { text: '出错了', bubble: '呜...出错了喵 T_T', color: '#f87171' },
  celebrate: { text: '完成!', bubble: '太棒啦喵～✨', color: '#f472b6' },
}

// 打字机效果
async function typeText(text: string) {
  isTyping.value = true
  displayText.value = ''

  for (let i = 0; i < text.length; i++) {
    displayText.value += text[i]
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 30))
  }

  isTyping.value = false
}

// 监听状态变化，触发打字机效果
watch(currentState, (newState) => {
  const config = stateConfig[newState] || stateConfig.idle
  typeText(config.bubble)
})

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
    return `${hours}h${minutes}m`
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

// 初始化时显示默认文案
onMounted(() => {
  typeText(stateConfig.idle.bubble)
})
</script>

<template>
  <div class="chat-bubble-container">
    <!-- 主气泡 -->
    <div class="chat-bubble" :style="{ '--accent-color': currentStateConfig.color }">
      <!-- 气泡尖角 -->
      <div class="bubble-tail" />

      <!-- 气泡内容 -->
      <div class="bubble-content">
        <!-- 状态标签 -->
        <div class="status-badge" :style="{ backgroundColor: currentStateConfig.color }">
          {{ currentStateConfig.text }}
        </div>

        <!-- 对话文字 -->
        <div class="bubble-text">
          {{ displayText }}<span v-if="isTyping" class="typing-cursor">|</span>
        </div>

        <!-- 分隔线 -->
        <div class="bubble-divider" />

        <!-- 迷你统计 -->
        <div class="mini-stats">
          <div class="mini-stat">
            <span class="mini-dot" style="background: #60a5fa" />
            <span class="mini-value">{{ statsStore.todayCount }}</span>
          </div>
          <div class="mini-stat">
            <span class="mini-dot" style="background: #a78bfa" />
            <span class="mini-value">{{ formattedDuration }}</span>
          </div>
          <div class="mini-stat">
            <span class="mini-dot" style="background: #34d399" />
            <span class="mini-value">{{ statsStore.successRate }}%</span>
          </div>
        </div>
      </div>

      <!-- 底部装饰 -->
      <div class="bubble-footer">
        <span class="footer-paw">🐾</span>
        <span class="footer-time">{{ formattedTime }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-bubble-container {
  position: fixed;
  left: 12px;
  top: 20px;
  z-index: 100;
  pointer-events: none;
}

.chat-bubble {
  position: relative;
  min-width: 150px;
  max-width: 180px;
  background: linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%);
  border-radius: 18px;
  padding: 12px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  color: #fff;
  pointer-events: auto;
  animation: bubbleAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bubbleAppear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
}

/* 气泡尖角 - 右下角指向猫咪 */
.bubble-tail {
  position: absolute;
  right: 16px;
  bottom: -10px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid #242424;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
}

.bubble-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 状态标签 */
.status-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* 对话文字 */
.bubble-text {
  font-size: 13px;
  line-height: 1.5;
  color: #e5e5e5;
  min-height: 20px;
  word-break: break-word;
}

.typing-cursor {
  display: inline-block;
  color: var(--accent-color);
  animation: cursorBlink 0.6s infinite;
  font-weight: 300;
  margin-left: 1px;
}

@keyframes cursorBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 分隔线 */
.bubble-divider {
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.15) 20%,
    rgba(255, 255, 255, 0.15) 80%,
    transparent
  );
  margin: 2px 0;
}

/* 迷你统计 */
.mini-stats {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mini-value {
  font-size: 11px;
  font-weight: 600;
  color: #d4d4d4;
  font-variant-numeric: tabular-nums;
}

/* 底部 */
.bubble-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-paw {
  font-size: 12px;
  animation: pawWiggle 2s ease-in-out infinite;
}

@keyframes pawWiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.footer-time {
  font-size: 10px;
  color: #888;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* 悬停效果 */
.chat-bubble:hover {
  transform: scale(1.02);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
