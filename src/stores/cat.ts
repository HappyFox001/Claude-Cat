import { defineStore } from 'pinia'
import { reactive } from 'vue'

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
    scale: 100,
    opacity: 100,
    radius: 0,
    hideOnHover: false,
    position: 'bottomRight',
  })

  const expressions = reactive<ExpressionMapping>({ ...DEFAULT_EXPRESSION_MAPPING })

  // 获取随机表情索引
  function getRandomExpression(state: ClaudeState): number {
    const candidates = expressions[state] || DEFAULT_EXPRESSION_MAPPING[state] || [0]
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  // 重置为默认映射
  function resetExpressions() {
    Object.assign(expressions, DEFAULT_EXPRESSION_MAPPING)
  }

  return {
    window,
    expressions,
    getRandomExpression,
    resetExpressions,
  }
})
