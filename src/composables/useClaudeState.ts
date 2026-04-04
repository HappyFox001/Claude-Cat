import { useTauriListen } from './useTauriListen'

import { actionConfigs } from '@/config/actions'
import { useStatsStore } from '@/stores/statistics'
import live2d from '@/utils/live2d'

interface ClaudeStatus {
  state: string
  timestamp: number
  detail?: string // 额外细节信息
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
  // 新增状态
  failed: 3, // sad - API/工具失败
  denied: 5, // surprised - 权限被拒
  busy: 7, // fluffy - 子代理运行中
  searching: 1, // question - 网络搜索
}

// 状态对应的动作动画（只控制身体、尾巴等，不控制表情）
const STATE_TO_ACTIONS: Record<string, () => void> = {
  idle: () => {
    // idle 没有特殊动作，直接重置
  },
  thinking: () => {
    // 歪头思考动画
    startAction()
    playActionFromConfig('thinking')
  },
  coding: () => {
    // 点头专注动画
    startAction()
    playActionFromConfig('coding')
  },
  reading: () => {
    // 眼睛扫视动画
    startAction()
    playActionFromConfig('reading')
  },
  running: () => {
    // 兴奋抖动动画
    startAction()
    playActionFromConfig('running')
  },
  error: () => {
    // 生气动画
    startAction()
    playActionFromConfig('error')
  },
  celebrate: () => {
    // 庆祝摇头动画
    startAction()
    playActionFromConfig('celebrate')
  },
  // 新增状态动作
  failed: () => {
    // 失败/难过动画
    startAction()
    playActionFromConfig('failed')
  },
  denied: () => {
    // 惊讶动画
    startAction()
    playActionFromConfig('denied')
  },
  busy: () => {
    // 忙碌/蓬松动画
    startAction()
    playActionFromConfig('busy')
  },
  searching: () => {
    // 搜索动画（复用 reading）
    startAction()
    playActionFromConfig('searching')
  },
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
let animationInterval: ReturnType<typeof setInterval> | null = null
let actionTimeout: ReturnType<typeof setTimeout> | null = null
const ACTION_DURATION = 2500 // 动作持续时间 2.5 秒

// 动画辅助函数 - 从当前值平滑过渡到目标值
function animateParameter(id: string, _from: number, to: number, duration: number) {
  const startTime = Date.now()
  // 获取当前参数值作为起始值
  const currentValue = live2d.getParameterValue(id) ?? _from
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
    const value = currentValue + (to - currentValue) * eased
    live2d.setParameterValue(id, value)
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  animate()
}

// 开始动作（禁用鼠标追随）
function startAction() {
  live2d.isActionPlaying = true
  // 清除之前的超时
  if (actionTimeout) {
    clearTimeout(actionTimeout)
  }
  // 设置动作结束时间
  actionTimeout = setTimeout(() => {
    finishAction()
  }, ACTION_DURATION)
}

// 动作结束（恢复鼠标追随，但保持表情）
function finishAction() {
  stopCurrentAnimation()
  // 先重置所有动作相关参数（包括头部角度），完成后再恢复鼠标跟随
  // 保持 isActionPlaying = true，避免重置动画和鼠标跟随冲突
  animateParameter('ParamAngleX', 0, 0, 300)
  animateParameter('ParamAngleY', 0, 0, 300)
  animateParameter('ParamAngleZ', 0, 0, 300)
  animateParameter('ParamBodyAngleX', 0, 0, 300)
  animateParameter('ParamBodyAngleY', 0, 0, 300)
  // 延迟恢复鼠标跟随，等待重置动画完成
  setTimeout(() => {
    live2d.isActionPlaying = false
  }, 350)
}

// 完全重置（切换到 idle 时调用）- 重置所有动作参数，表情由 playExpressions 控制
function resetToIdle() {
  stopCurrentAnimation()
  if (actionTimeout) {
    clearTimeout(actionTimeout)
    actionTimeout = null
  }
  // 保持 isActionPlaying = true，等待重置动画完成
  live2d.isActionPlaying = true
  // 重置所有参数（包括头部角度）
  animateParameter('ParamAngleX', 0, 0, 300)
  animateParameter('ParamAngleY', 0, 0, 300)
  animateParameter('ParamAngleZ', 0, 0, 300)
  animateParameter('ParamBodyAngleX', 0, 0, 300)
  animateParameter('ParamBodyAngleY', 0, 0, 300)
  animateParameter('ParamBodyAngleZ', 0, 0, 300)
  animateParameter('Param14', 0, 0, 300) // 尾巴
  animateParameter('Param15', 0, 0, 300)
  animateParameter('Param16', 0, 0, 300)
  animateParameter('Param17', 0, 0, 300)
  // 延迟恢复鼠标跟随，等待重置动画完成
  setTimeout(() => {
    live2d.isActionPlaying = false
  }, 350)
}

// 停止当前动画
function stopCurrentAnimation() {
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
}

// 从配置播放动作
function playActionFromConfig(actionName: string) {
  const config = actionConfigs[actionName]
  if (!config) return

  stopCurrentAnimation()
  let phase = 0

  animationInterval = setInterval(() => {
    phase += config.speed

    for (const param of config.params) {
      const value = param.base + Math.sin(phase * param.frequency) * param.amplitude
      live2d.setParameterValue(param.id, value)
    }
  }, config.interval)
}

export function useClaudeState() {
  const statsStore = useStatsStore()

  const changeExpression = (state: string, detail?: string) => {
    console.log(`%c[Claude State] Received state: ${state}`, 'color: #ff9800; font-weight: bold')

    // 相同状态不重复触发（保持当前表情和状态）
    if (state === lastState) {
      console.log(`[Claude State] Same state, skipping`)
      return
    }

    const expressionIndex = STATE_TO_EXPRESSION[state]
    if (expressionIndex === undefined) {
      console.warn(`[Claude State] Unknown state: ${state}`)
      return
    }

    const expressionName = EXPRESSION_NAMES[expressionIndex] || 'unknown'
    console.log(
      `%c[Claude State] ${lastState} → ${state} (Expression: ${expressionName})`,
      'color: #00bcd4; font-weight: bold; font-size: 14px',
    )

    // 切换表情（由 Live2D 表情系统控制）
    live2d.playExpressions(expressionIndex)

    // idle 状态：重置动作参数
    if (state === 'idle') {
      resetToIdle()
    } else {
      // 非 idle 状态：播放动作动画（只控制身体、尾巴等）
      const action = STATE_TO_ACTIONS[state]
      if (action) {
        action()
      }
    }

    // 更新显示屏状态
    if (typeof window !== 'undefined' && (window as any).__updateStatusScreen) {
      ;(window as any).__updateStatusScreen(state, detail)
    }

    // 记录统计数据
    const success = state !== 'error'
    statsStore.recordStateChange(state, state, success)
    console.log(`[Stats] Recorded state: ${state}, success: ${success}`)

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
