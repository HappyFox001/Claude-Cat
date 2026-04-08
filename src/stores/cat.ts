import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'

// 可用的表情列表
export const EXPRESSIONS = [
  { index: 0, name: 'normal', label: '普通' },
  { index: 1, name: 'question', label: '疑问' },
  { index: 2, name: 'angry', label: '生气' },
  { index: 3, name: 'sad', label: '悲伤' },
  { index: 4, name: 'cry', label: '哭泣' },
  { index: 5, name: 'surprised', label: '惊讶' },
  { index: 6, name: 'excited', label: '兴奋' },
  { index: 7, name: 'fluffy', label: '蓬松' },
  { index: 8, name: 'knife', label: '小刀' },
  { index: 9, name: 'long', label: '拉长' },
  { index: 10, name: 'no_pupil', label: '无瞳' },
] as const

// Claude 状态列表
export const CLAUDE_STATES = [
  { key: 'idle', label: '空闲', description: '等待输入' },
  { key: 'thinking', label: '思考', description: '处理问题中' },
  { key: 'coding', label: '编码', description: '编辑文件' },
  { key: 'reading', label: '阅读', description: '读取文件' },
  { key: 'running', label: '运行', description: '执行命令' },
  { key: 'error', label: '错误', description: '出现异常' },
  { key: 'celebrate', label: '庆祝', description: '任务完成' },
  { key: 'failed', label: '失败', description: 'API/工具失败' },
  { key: 'denied', label: '拒绝', description: '权限被拒' },
  { key: 'busy', label: '忙碌', description: '子代理运行' },
  { key: 'searching', label: '搜索', description: '网络搜索' },
] as const

export type ClaudeState = typeof CLAUDE_STATES[number]['key']
export type ExpressionMapping = Record<ClaudeState, number[]>

// 默认表情映射（一对多）
export const DEFAULT_EXPRESSION_MAPPING: ExpressionMapping = {
  idle: [0],
  thinking: [1],
  coding: [0, 1],
  reading: [1],
  running: [6],
  error: [2, 3],
  celebrate: [6, 5],
  failed: [3, 4],
  denied: [5, 2],
  busy: [7],
  searching: [1, 5],
}

// 缩放比例限制常量
export const MIN_SCALE = 20 // 最小20%
export const MAX_SCALE = 500 // 最大500%
export const DEFAULT_SCALE = 100 // 默认100%

function normalizeScale(value: unknown) {
  // 明确处理 null 和 undefined，返回默认值而不是最小值
  if (value == null) return DEFAULT_SCALE

  const numericValue = typeof value === 'number' ? value : Number(value)

  // NaN 也返回默认值
  if (Number.isNaN(numericValue)) return DEFAULT_SCALE

  // 限制在有效范围内
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, numericValue))
}

export interface CatStore {
  window: {
    visible: boolean
    passThrough: boolean
    alwaysOnTop: boolean
    scale: number
    opacity: number
    radius: number
    hideOnHover: boolean
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  }
  expressions: ExpressionMapping
}

export const useCatStore = defineStore('cat', () => {
  const window = reactive<CatStore['window']>({
    visible: true,
    passThrough: false,
    alwaysOnTop: false,
    scale: DEFAULT_SCALE,
    opacity: 100,
    radius: 0,
    hideOnHover: false,
    position: 'bottomRight',
  })

  const expressions = reactive<ExpressionMapping>({ ...DEFAULT_EXPRESSION_MAPPING })

  // 迁移旧版本配置（清理不兼容的字段）
  // 旧版本有 baseHeight, baseWidth, model, migrated 等字段
  // 这些字段会导致 tauri-store 恢复数据时出现问题
  if (import.meta.env.DEV) {
    const windowAny = window as any
    if (windowAny.baseHeight !== undefined || windowAny.baseWidth !== undefined) {
      console.warn('[CatStore] Detected old config format, cleaning up...')
      delete windowAny.baseHeight
      delete windowAny.baseWidth
    }
  }

  // 获取随机表情索引
  function getRandomExpression(state: ClaudeState): number {
    const candidates = expressions[state] || DEFAULT_EXPRESSION_MAPPING[state] || [0]
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  // 重置为默认映射
  function resetExpressions() {
    Object.assign(expressions, DEFAULT_EXPRESSION_MAPPING)
  }

  // 设置缩放比例（带验证）
  function setScale(value: number) {
    window.scale = normalizeScale(value)
  }

  // 初始化时验证并修正 scale 值（处理持久化数据异常）
  // 这里不使用 watch immediate，因为 tauri-store 恢复数据时可能会触发误报
  if (window.scale == null || window.scale < MIN_SCALE || window.scale > MAX_SCALE) {
    if (import.meta.env.DEV) {
      console.warn(`[CatStore] Invalid initial scale value ${window.scale}, setting to ${DEFAULT_SCALE}%`)
    }
    window.scale = DEFAULT_SCALE
  }

  // 监听并自动纠正缩放值（用户手动输入异常时）
  // 移除 immediate 选项，避免在数据恢复过程中误触发
  watch(() => window.scale, (value) => {
    const normalized = normalizeScale(value)
    if (normalized === value) return

    if (import.meta.env.DEV) {
      console.warn(`[CatStore] Scale value ${value}% is out of range, resetting to ${normalized}%`)
    }

    window.scale = normalized
  })

  return {
    window,
    expressions,
    getRandomExpression,
    resetExpressions,
    setScale,
  }
})
