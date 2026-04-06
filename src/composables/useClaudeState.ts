import { useTauriListen } from './useTauriListen'

import { useStatsStore } from '@/stores/statistics'
import live2d from '@/utils/live2d'

interface ClaudeStatus {
  state: string
  timestamp: number
  detail?: string
}

// Map Claude Code states to Live2D expression indices
const STATE_TO_EXPRESSION: Record<string, number> = {
  idle: 0, // normal - 普通猫瞳
  thinking: 1, // question - 疑问
  coding: 0, // normal - 专注
  reading: 1, // question - 好奇
  running: 6, // excited - 兴奋
  error: 2, // angry - 生气
  celebrate: 6, // excited - 庆祝
  failed: 3, // sad - API/工具失败
  denied: 5, // surprised - 权限被拒
  busy: 7, // fluffy - 子代理运行中
  searching: 1, // question - 网络搜索
}

const EXPRESSION_NAMES = [
  'normal',
  'question',
  'angry',
  'sad',
  'cry',
  'surprised',
  'excited',
  'fluffy',
  'knife',
  'long',
  'no_pupil',
]

let lastState = ''

export function useClaudeState() {
  const statsStore = useStatsStore()

  const changeExpression = (state: string, detail?: string) => {
    // 相同状态不重复触发
    if (state === lastState) {
      return
    }

    const expressionIndex = STATE_TO_EXPRESSION[state]
    if (expressionIndex === undefined) {
      console.warn(`[Claude State] Unknown state: ${state}`)
      return
    }

    const expressionName = EXPRESSION_NAMES[expressionIndex] || 'unknown'
    console.warn(
      `[Claude State] ${lastState} → ${state} (Expression: ${expressionName})`,
    )

    // 切换表情
    live2d.playExpressions(expressionIndex)

    // 更新显示屏状态
    if (typeof window !== 'undefined' && (window as any).__updateStatusScreen) {
      ;(window as any).__updateStatusScreen(state, detail)
    }

    // 记录统计数据
    const success = state !== 'error'
    statsStore.recordStateChange(state, state, success)

    lastState = state
  }

  // 暴露到全局用于调试
  if (import.meta.env.DEV) {
    ;(window as any).testClaudeState = (state: string) => {
      changeExpression(state)
    }
  }

  // 监听 Tauri 事件
  useTauriListen<ClaudeStatus>('claude-state-change', ({ payload }) => {
    const { state } = payload
    changeExpression(state)
  })

  return {
    changeExpression,
  }
}
