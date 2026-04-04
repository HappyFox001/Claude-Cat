import { useTauriListen } from './useTauriListen'

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
}

// 状态对应的动作参数（基于 void_cat 模型的实际参数）
const STATE_TO_ACTIONS: Record<string, () => void> = {
  idle: () => {
    // 停止所有动画，恢复默认姿态
    stopCurrentAnimation()
    animateParameter('ParamAngleZ', 0, 0, 300)
    animateParameter('ParamAngleX', 0, 0, 300)
    animateParameter('ParamEyeBallX', 0, 0, 200)
    animateParameter('ParamEyeBallY', 0, 0, 200)
    // 慢慢眨眼
    setTimeout(() => {
      animateParameter('ParamEyeLOpen', 1, 0, 150)
      animateParameter('ParamEyeROpen', 1, 0, 150)
      setTimeout(() => {
        animateParameter('ParamEyeLOpen', 0, 1, 150)
        animateParameter('ParamEyeROpen', 0, 1, 150)
      }, 200)
    }, 500)
  },
  thinking: () => {
    // 歪头思考，眼睛看向上方，显示问号
    stopCurrentAnimation()
    animateParameter('ParamAngleZ', 0, 10, 300)
    animateParameter('ParamEyeBallY', 0, 0.5, 200)
    animateParameter('Param28', 0, 1, 200) // 问号表情
    startThinkingAnimation()
  },
  coding: () => {
    // 专注姿态，眼睛微微眯起，偶尔点头
    stopCurrentAnimation()
    animateParameter('ParamAngleZ', 0, 0, 200)
    animateParameter('ParamEyeLSmile', 0, 0.3, 200)
    animateParameter('ParamEyeRSmile', 0, 0.3, 200)
    startCodingAnimation()
  },
  reading: () => {
    // 眼睛左右移动，像在阅读文字
    stopCurrentAnimation()
    animateParameter('ParamAngleX', 0, -5, 200) // 稍微低头
    startReadingAnimation()
  },
  running: () => {
    // 兴奋状态，身体轻微抖动，尾巴摇摆
    stopCurrentAnimation()
    animateParameter('ParamEyeLOpen', 1, 1.2, 100)
    animateParameter('ParamEyeROpen', 1, 1.2, 100)
    startRunningAnimation()
  },
  error: () => {
    // 难过姿态，耳朵下垂，眼睛下看
    stopCurrentAnimation()
    animateParameter('ParamAngleZ', 0, -8, 300)
    animateParameter('ParamEyeBallY', 0, -0.5, 200)
    animateParameter('Param11', 0, -1, 300) // 右耳下垂
    animateParameter('Param29', 0, -1, 300) // 左耳下垂
    animateParameter('Param10', 0, 0.5, 300) // 眼泪
  },
  celebrate: () => {
    // 开心地摇头晃脑，眼睛笑眯眯
    stopCurrentAnimation()
    animateParameter('ParamEyeLSmile', 0, 1, 200)
    animateParameter('ParamEyeRSmile', 0, 1, 200)
    animateParameter('ParamCheek', 0, 1, 300) // 脸红
    startCelebrateAnimation()
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
let lastExpressionTime = 0
let animationInterval: ReturnType<typeof setInterval> | null = null
const EXPRESSION_COOLDOWN = 800 // 0.8 秒防抖

// 动画辅助函数
function animateParameter(id: string, from: number, to: number, duration: number) {
  const startTime = Date.now()
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
    const value = from + (to - from) * eased
    live2d.setParameterValue(id, value)
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  animate()
}

// 停止当前动画
function stopCurrentAnimation() {
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
}

// 思考动画：头部轻微左右摇摆 + 尾巴晃动
function startThinkingAnimation() {
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.08
    const angleZ = 10 + Math.sin(phase) * 5
    const tailAngle = Math.sin(phase * 0.5) * 15
    live2d.setParameterValue('ParamAngleZ', angleZ)
    live2d.setParameterValue('Param14', tailAngle) // 尾巴摆动
  }, 50)
}

// 编码动画：微微点头 + 专注
function startCodingAnimation() {
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.06
    const angleX = Math.sin(phase) * 3
    const angleY = Math.sin(phase * 0.5) * 2
    live2d.setParameterValue('ParamAngleX', angleX)
    live2d.setParameterValue('ParamAngleY', angleY)
  }, 50)
}

// 阅读动画：眼睛左右移动，像在看代码
function startReadingAnimation() {
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.1
    const eyeX = Math.sin(phase) * 0.8
    const eyeY = Math.sin(phase * 0.3) * 0.2
    live2d.setParameterValue('ParamEyeBallX', eyeX)
    live2d.setParameterValue('ParamEyeBallY', eyeY)
  }, 50)
}

// 运行动画：兴奋地抖动 + 尾巴快速摇摆
function startRunningAnimation() {
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.25
    const bodyY = Math.sin(phase) * 3
    const tailAngle = Math.sin(phase * 2) * 20
    live2d.setParameterValue('ParamBodyAngleY', bodyY)
    live2d.setParameterValue('Param14', tailAngle)
    live2d.setParameterValue('Param15', tailAngle * 0.8)
  }, 50)
}

// 庆祝动画：开心摇头 + 尾巴大幅度摇摆
function startCelebrateAnimation() {
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.15
    const angleZ = Math.sin(phase) * 12
    const tailAngle = Math.sin(phase * 1.5) * 25
    live2d.setParameterValue('ParamAngleZ', angleZ)
    live2d.setParameterValue('Param14', tailAngle)
    live2d.setParameterValue('Param15', tailAngle * 0.9)
    live2d.setParameterValue('Param16', tailAngle * 0.8)
  }, 50)
}

export function useClaudeState() {
  const statsStore = useStatsStore()

  const changeExpression = (state: string, detail?: string) => {
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
    console.log(
      `%c[Claude State] ${state} → Expression #${expressionIndex} (${expressionName})`,
      'color: #00bcd4; font-weight: bold; font-size: 14px',
    )
    live2d.playExpressions(expressionIndex)

    // 执行状态对应的动作
    const action = STATE_TO_ACTIONS[state]
    if (action) {
      action()
    }

    // 更新显示屏状态（传递更多信息）
    if (typeof window !== 'undefined' && (window as any).__updateStatusScreen) {
      ;(window as any).__updateStatusScreen(state, detail)
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
