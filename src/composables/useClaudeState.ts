import { useTauriListen } from './useTauriListen'

import { useStatsStore } from '@/stores/statistics'
import live2d from '@/utils/live2d'

interface ClaudeStatus {
  state: string
  timestamp: number
}

// Map Claude Code states to Live2D expression indices
const STATE_TO_EXPRESSION: Record<string, number> = {
  'idle': 0,        // normal - 普通猫瞳
  'thinking': 1,    // question - 疑问
  'coding': 0,      // normal - 专注（也可以用其他表情）
  'reading': 1,     // question - 好奇
  'running': 6,     // excited - 兴奋
  'error': 2,       // angry - 生气
  'celebrate': 6,   // excited - 庆祝
}

const EXPRESSION_NAMES = [
  'normal', 'question', 'angry', 'sad', 'cry',
  'surprised', 'excited', 'fluffy', 'knife', 'long', 'no_pupil'
]

let lastState = ''
let lastExpressionTime = 0
const EXPRESSION_COOLDOWN = 800 // 0.8 秒防抖

export function useClaudeState() {
  const statsStore = useStatsStore()

  const changeExpression = (state: string) => {
    console.log(`%c[Claude State] Received state: ${state}`, 'color: #ff9800; font-weight: bold')

    // 防抖：避免频繁切换
    const now = Date.now()
    if (now - lastExpressionTime < EXPRESSION_COOLDOWN && state === lastState) {
      console.log(`[Claude State] Debounced (same state within ${EXPRESSION_COOLDOWN}ms)`)
      return
    }

    const expressionIndex = STATE_TO_EXPRESSION[state]
    if (expressionIndex === undefined) {
      console.warn(`[Claude State] Unknown state: ${state}`)
      return
    }

    const expressionName = EXPRESSION_NAMES[expressionIndex] || 'unknown'

    // 切换表情
    console.log(`%c[Claude State] ${state} → Expression #${expressionIndex} (${expressionName})`, 'color: #00bcd4; font-weight: bold; font-size: 14px')
    live2d.playExpressions(expressionIndex)

    // 更新显示屏状态
    if (typeof window !== 'undefined' && (window as any).__updateStatusScreen) {
      (window as any).__updateStatusScreen(state)
    }

    // 记录统计数据
    const success = state !== 'error'
    statsStore.recordStateChange(state, state, success)
    console.log(`[Stats] Recorded state: ${state}, success: ${success}`)

    lastExpressionTime = now
    lastState = state
  }

  // 初始化日志
  console.log('%c[Claude State] Initialized - Listening for claude-state-change events', 'color: #4caf50; font-weight: bold')
  console.log('[Claude State] State mappings:', STATE_TO_EXPRESSION)

  // 暴露到全局用于调试
  if (import.meta.env.DEV) {
    ;(window as any).testClaudeState = (state: string) => {
      console.log(`%c[DEBUG] Manual trigger: ${state}`, 'color: #ff00ff; font-weight: bold')
      changeExpression(state)
    }
    console.log('[Claude State] Debug function available: window.testClaudeState(state)')
  }

  // 监听 Tauri 事件
  useTauriListen<ClaudeStatus>('claude-state-change', ({ payload }) => {
    console.log('[Claude State] Event received:', payload)
    const { state, timestamp } = payload
    const now = Math.floor(Date.now() / 1000)
    const age = now - timestamp

    console.log(`[Claude State] Event age: ${age}s (timestamp: ${timestamp}, now: ${now})`)

    changeExpression(state)
  })

  return {
    changeExpression,
  }
}
