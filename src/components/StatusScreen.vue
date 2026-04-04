<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { useStatsStore } from '@/stores/statistics'

const statsStore = useStatsStore()
const currentState = ref('idle')
const isVisible = ref(false)
const displayText = ref('')
const isTyping = ref(false)
const bubbleScale = ref(0)
let hideTimeout: ReturnType<typeof setTimeout> | null = null
let typingTimeout: ReturnType<typeof setTimeout> | null = null

// 状态显示配置 - 更可爱有趣的文案
const stateConfig: Record<string, { bubbles: string[]; color: string }> = {
  idle: { bubbles: ['zzZ...', '打个盹~', '喵~'], color: '#94a3b8' },
  thinking: {
    bubbles: ['嗯...', '让我想想...', '这个嘛...', '有意思喵~'],
    color: '#fbbf24',
  },
  coding: {
    bubbles: ['写代码中!', '哒哒哒~', '这里改一下...', '完美喵!'],
    color: '#a78bfa',
  },
  reading: {
    bubbles: ['在看呢...', '原来如此~', '这个文件...', '找到了!'],
    color: '#60a5fa',
  },
  running: {
    bubbles: ['跑起来!', '执行中~', '冲冲冲!', '加油喵!'],
    color: '#34d399',
  },
  error: {
    bubbles: ['呜...', '出错了 T_T', '这里有问题...', '再试试...'],
    color: '#f87171',
  },
  celebrate: {
    bubbles: ['太棒了!', '成功喵~', '✨ 完美 ✨', 'Yay!'],
    color: '#f472b6',
  },
}

// 随机选择一条文案
function getRandomBubble(state: string): string {
  const config = stateConfig[state] || stateConfig.idle
  const bubbles = config.bubbles
  return bubbles[Math.floor(Math.random() * bubbles.length)]
}

// 打字机效果
async function typeText(text: string) {
  if (typingTimeout) clearTimeout(typingTimeout)
  isTyping.value = true
  displayText.value = ''

  for (let i = 0; i < text.length; i++) {
    displayText.value += text[i]
    await new Promise((resolve) => {
      typingTimeout = setTimeout(resolve, 40 + Math.random() * 40)
    })
  }

  isTyping.value = false
}

// 显示气泡
function showBubble(state: string) {
  if (hideTimeout) clearTimeout(hideTimeout)

  currentState.value = state
  isVisible.value = true

  // 弹出动画
  bubbleScale.value = 0
  requestAnimationFrame(() => {
    bubbleScale.value = 1
  })

  // 打字效果
  const text = getRandomBubble(state)
  typeText(text)

  // 非 idle 状态，5秒后自动消散
  if (state !== 'idle') {
    hideTimeout = setTimeout(() => {
      hideBubble()
    }, 5000)
  }
}

// 隐藏气泡
function hideBubble() {
  bubbleScale.value = 0
  setTimeout(() => {
    isVisible.value = false
  }, 300)
}

// 监听 Claude 状态变化
if (typeof window !== 'undefined') {
  ;(window as any).__updateStatusScreen = (state: string) => {
    if (state === 'idle') {
      // idle 状态：延迟后消散
      hideTimeout = setTimeout(() => {
        hideBubble()
      }, 2000)
    } else {
      // 工作状态：显示气泡
      showBubble(state)
    }
  }
}

const currentColor = computed(
  () => stateConfig[currentState.value]?.color || stateConfig.idle.color,
)

onMounted(() => {
  // 初始不显示
  isVisible.value = false
})

onUnmounted(() => {
  if (hideTimeout) clearTimeout(hideTimeout)
  if (typingTimeout) clearTimeout(typingTimeout)
})
</script>

<template>
  <Transition name="bubble">
    <div
      v-if="isVisible"
      class="thought-bubble-container"
      :style="{ '--bubble-scale': bubbleScale, '--accent-color': currentColor }"
    >
      <!-- 思考小圆点 -->
      <div class="thought-dots">
        <div class="dot dot-1" />
        <div class="dot dot-2" />
        <div class="dot dot-3" />
      </div>

      <!-- 主气泡 -->
      <div class="thought-bubble">
        <div class="bubble-inner">
          <!-- 文字内容 -->
          <div class="bubble-text">
            <span class="text-content">{{ displayText }}</span>
            <span
              v-if="isTyping"
              class="typing-cursor"
            />
          </div>

          <!-- 迷你统计（只在有数据时显示） -->
          <div
            v-if="statsStore.todayCount > 0"
            class="mini-stats"
          >
            <span class="stat">{{ statsStore.todayCount }} 次</span>
            <span class="stat-divider">·</span>
            <span class="stat">{{ statsStore.successRate }}%</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.thought-bubble-container {
  position: fixed;
  left: 16px;
  top: 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  transform: scale(var(--bubble-scale));
  transform-origin: bottom right;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

/* 思考小圆点 - 从小到大排列 */
.thought-dots {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  padding-right: 8px;
}

.dot {
  background: linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%);
  border-radius: 50%;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: dotFloat 2s ease-in-out infinite;
}

.dot-1 {
  width: 8px;
  height: 8px;
  animation-delay: 0s;
}

.dot-2 {
  width: 12px;
  height: 12px;
  animation-delay: 0.15s;
}

.dot-3 {
  width: 16px;
  height: 16px;
  animation-delay: 0.3s;
}

@keyframes dotFloat {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-3px) scale(1.1);
    opacity: 1;
  }
}

/* 主气泡 */
.thought-bubble {
  position: relative;
  background: linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%);
  border-radius: 20px;
  padding: 12px 16px;
  min-width: 80px;
  max-width: 160px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: bubbleBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: auto;
}

@keyframes bubbleBounce {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 气泡左侧的小突起，连接到圆点 */
.thought-bubble::before {
  content: '';
  position: absolute;
  right: 20px;
  bottom: -8px;
  width: 16px;
  height: 16px;
  background: linear-gradient(145deg, #242424 0%, #1e1e1e 100%);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.bubble-inner {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 文字样式 */
.bubble-text {
  font-family:
    'PingFang SC',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.text-content {
  color: var(--accent-color);
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: var(--accent-color);
  margin-left: 2px;
  animation: cursorBlink 0.5s infinite;
  vertical-align: middle;
}

@keyframes cursorBlink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* 迷你统计 */
.mini-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 2px;
}

.stat {
  font-size: 10px;
  color: #888;
  font-weight: 500;
}

.stat-divider {
  color: #555;
  font-size: 10px;
}

/* 过渡动画 */
.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(10px);
}

/* 悬停效果 */
.thought-bubble:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}
</style>
