import { useTauriListen } from './useTauriListen'

import { type ClaudeState, EXPRESSIONS, useCatStore } from '@/stores/cat'
import { useStatsStore } from '@/stores/statistics'
import live2d from '@/utils/live2d'

interface ClaudeStatus {
  state: string
  timestamp: number
  detail?: string
}

let lastState = ''

export function useClaudeState() {
  const statsStore = useStatsStore()
  const catStore = useCatStore()

  const changeExpression = (state: string, detail?: string) => {
    // 相同状态不重复触发
    if (state === lastState) {
      return
    }

    // 从 store 获取随机表情
    const expressionIndex = catStore.getRandomExpression(state as ClaudeState)
    const expressionName = EXPRESSIONS[expressionIndex]?.name || 'unknown'

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
