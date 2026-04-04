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

// 状态对应的表情参数（切换状态时设置，保持到下次状态变化）
const STATE_TO_EXPRESSION_PARAMS: Record<string, () => void> = {
  idle: () => {
    // 无特殊表情
  },
  thinking: () => {
    animateParameter('Param28', 0, 1, 300) // 问号表情
  },
  coding: () => {
    animateParameter('ParamEyeLSmile', 0, 0.4, 200)
    animateParameter('ParamEyeRSmile', 0, 0.4, 200)
  },
  reading: () => {
    // 专注表情
  },
  running: () => {
    animateParameter('ParamEyeLOpen', 1, 1.2, 150)
    animateParameter('ParamEyeROpen', 1, 1.2, 150)
  },
  error: () => {
    animateParameter('Param11', 0, -1, 400) // 右耳下垂
    animateParameter('Param29', 0, -1, 400) // 左耳下垂
    animateParameter('Param10', 0, 1, 400) // 眼泪
  },
  celebrate: () => {
    animateParameter('ParamEyeLSmile', 0, 1, 200)
    animateParameter('ParamEyeRSmile', 0, 1, 200)
    animateParameter('ParamCheek', 0, 1, 300) // 脸红
    animateParameter('ParamMouthForm', 0, 1, 200) // 张嘴笑
  },
}

// 状态对应的动作动画（一次性播放的小动画）
const STATE_TO_ACTIONS: Record<string, () => void> = {
  idle: () => {
    // idle 没有特殊动作，直接重置
  },
  thinking: () => {
    // 歪头思考动画
    startAction()
    startThinkingAnimation()
  },
  coding: () => {
    // 点头专注动画
    startAction()
    startCodingAnimation()
  },
  reading: () => {
    // 眼睛扫视动画
    startAction()
    startReadingAnimation()
  },
  running: () => {
    // 兴奋抖动动画
    startAction()
    startRunningAnimation()
  },
  error: () => {
    // 难过动画
    startAction()
    startErrorAnimation()
  },
  celebrate: () => {
    // 庆祝摇头动画
    startAction()
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
let animationInterval: ReturnType<typeof setInterval> | null = null
let actionTimeout: ReturnType<typeof setTimeout> | null = null
const ACTION_DURATION = 2500 // 动作持续时间 2.5 秒

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
  live2d.isActionPlaying = false
  // 只重置动作相关的参数（头部角度、身体等），不重置表情参数
  animateParameter('ParamAngleX', 0, 0, 400)
  animateParameter('ParamAngleY', 0, 0, 400)
  animateParameter('ParamAngleZ', 0, 0, 400)
  animateParameter('ParamBodyAngleX', 0, 0, 300)
  animateParameter('ParamBodyAngleY', 0, 0, 300)
  animateParameter('ParamEyeBallX', 0, 0, 300)
  animateParameter('ParamEyeBallY', 0, 0, 300)
  // 表情参数（问号、眼泪、脸红等）保持不变，由状态变化时控制
}

// 完全重置（切换到 idle 时调用）
function resetToIdle() {
  stopCurrentAnimation()
  if (actionTimeout) {
    clearTimeout(actionTimeout)
    actionTimeout = null
  }
  live2d.isActionPlaying = false
  // 重置所有参数
  animateParameter('ParamAngleX', 0, 0, 300)
  animateParameter('ParamAngleY', 0, 0, 300)
  animateParameter('ParamAngleZ', 0, 0, 300)
  animateParameter('ParamBodyAngleX', 0, 0, 300)
  animateParameter('ParamBodyAngleY', 0, 0, 300)
  animateParameter('ParamEyeBallX', 0, 0, 200)
  animateParameter('ParamEyeBallY', 0, 0, 200)
  animateParameter('Param28', 0, 0, 300) // 问号消失
  animateParameter('Param10', 0, 0, 300) // 眼泪消失
  animateParameter('Param11', 0, 0, 300) // 耳朵恢复
  animateParameter('Param29', 0, 0, 300)
  animateParameter('ParamCheek', 0, 0, 300) // 脸红消失
  animateParameter('ParamEyeLSmile', 0, 0, 200)
  animateParameter('ParamEyeRSmile', 0, 0, 200)
  animateParameter('ParamMouthForm', 0, 0, 200)
}

// 停止当前动画
function stopCurrentAnimation() {
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
}

// 思考动画：头部大幅度左右摇摆 + 尾巴晃动
function startThinkingAnimation() {
  stopCurrentAnimation()
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.06
    const angleZ = 25 + Math.sin(phase) * 15 // 大幅度摇摆
    const angleY = 15 + Math.sin(phase * 0.7) * 8
    const tailAngle = Math.sin(phase * 0.5) * 25
    live2d.setParameterValue('ParamAngleZ', angleZ)
    live2d.setParameterValue('ParamAngleY', angleY)
    live2d.setParameterValue('Param14', tailAngle)
    live2d.setParameterValue('Param15', tailAngle * 0.8)
  }, 50)
}

// 编码动画：有节奏地点头
function startCodingAnimation() {
  stopCurrentAnimation()
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.08
    const angleX = -10 + Math.sin(phase) * 8 // 点头幅度加大
    const angleY = Math.sin(phase * 0.6) * 5
    const tailAngle = Math.sin(phase * 0.3) * 15
    live2d.setParameterValue('ParamAngleX', angleX)
    live2d.setParameterValue('ParamAngleY', angleY)
    live2d.setParameterValue('Param14', tailAngle)
  }, 50)
}

// 阅读动画：眼睛大幅度左右移动
function startReadingAnimation() {
  stopCurrentAnimation()
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.12
    const eyeX = Math.sin(phase) * 1 // 眼睛移动幅度加大
    const eyeY = -0.3 + Math.sin(phase * 0.4) * 0.3
    const angleY = -10 + Math.sin(phase * 0.3) * 5
    live2d.setParameterValue('ParamEyeBallX', eyeX)
    live2d.setParameterValue('ParamEyeBallY', eyeY)
    live2d.setParameterValue('ParamAngleY', angleY)
  }, 50)
}

// 运行动画：兴奋大幅度抖动 + 尾巴疯狂摇摆
function startRunningAnimation() {
  stopCurrentAnimation()
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.3
    const bodyY = Math.sin(phase) * 8 // 身体抖动加大
    const bodyX = Math.sin(phase * 1.5) * 5
    const tailAngle = Math.sin(phase * 2.5) * 30 // 尾巴快速大摇
    const angleZ = Math.sin(phase * 0.8) * 10
    live2d.setParameterValue('ParamBodyAngleY', bodyY)
    live2d.setParameterValue('ParamBodyAngleX', bodyX)
    live2d.setParameterValue('ParamAngleZ', angleZ)
    live2d.setParameterValue('Param14', tailAngle)
    live2d.setParameterValue('Param15', tailAngle * 0.9)
    live2d.setParameterValue('Param16', tailAngle * 0.8)
  }, 40)
}

// 庆祝动画：超级开心大摇头 + 尾巴疯狂摆动
function startCelebrateAnimation() {
  stopCurrentAnimation()
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.12
    const angleZ = Math.sin(phase) * 25 // 大幅度摇头
    const angleY = Math.sin(phase * 0.7) * 15
    const bodyY = Math.sin(phase * 1.2) * 5
    const tailAngle = Math.sin(phase * 2) * 35 // 尾巴大摆
    live2d.setParameterValue('ParamAngleZ', angleZ)
    live2d.setParameterValue('ParamAngleY', angleY)
    live2d.setParameterValue('ParamBodyAngleY', bodyY)
    live2d.setParameterValue('Param14', tailAngle)
    live2d.setParameterValue('Param15', tailAngle * 0.9)
    live2d.setParameterValue('Param16', tailAngle * 0.85)
    live2d.setParameterValue('Param17', tailAngle * 0.8)
  }, 40)
}

// 错误动画：难过地低头晃动
function startErrorAnimation() {
  stopCurrentAnimation()
  let phase = 0
  animationInterval = setInterval(() => {
    phase += 0.05
    const angleZ = -15 + Math.sin(phase) * 8 // 歪头难过
    const angleX = 10 + Math.sin(phase * 0.5) * 5 // 低头
    const eyeY = -0.5 + Math.sin(phase * 0.3) * 0.2
    live2d.setParameterValue('ParamAngleZ', angleZ)
    live2d.setParameterValue('ParamAngleX', angleX)
    live2d.setParameterValue('ParamEyeBallY', eyeY)
  }, 50)
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

    // idle 状态：完全重置
    if (state === 'idle') {
      resetToIdle()
      live2d.playExpressions(expressionIndex)
    } else {
      // 非 idle 状态：设置表情 + 播放动作
      live2d.playExpressions(expressionIndex)

      // 设置表情参数（会保持到下次状态变化）
      const setExpression = STATE_TO_EXPRESSION_PARAMS[state]
      if (setExpression) {
        setExpression()
      }

      // 播放动作动画（一次性，结束后恢复鼠标追随但保持表情）
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
