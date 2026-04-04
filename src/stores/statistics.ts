import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface ToolUsage {
  name: string
  count: number
  successCount: number
  failCount: number
}

interface DailyStats {
  date: string
  tools: Record<string, ToolUsage>
  totalCount: number
  successCount: number
  workDuration: number // 秒
}

export const useStatsStore = defineStore('statistics', () => {
  // 当前日期
  const today = ref(new Date().toISOString().split('T')[0])

  // 每日统计数据
  const dailyStats = ref<Record<string, DailyStats>>({})

  // 当前状态开始时间
  const currentStateStartTime = ref<number | null>(null)

  // 初始化今日数据
  const initToday = () => {
    if (!dailyStats.value[today.value]) {
      dailyStats.value[today.value] = {
        date: today.value,
        tools: {},
        totalCount: 0,
        successCount: 0,
        workDuration: 0,
      }
    }
  }

  // 记录状态变化
  const recordStateChange = (state: string, toolName?: string, success: boolean = true) => {
    initToday()

    const todayData = dailyStats.value[today.value]

    // 更新工作时长（如果有开始时间）
    if (currentStateStartTime.value) {
      const duration = Math.floor((Date.now() - currentStateStartTime.value) / 1000)
      todayData.workDuration += duration
    }
    currentStateStartTime.value = Date.now()

    // 记录工具使用
    if (toolName && toolName !== 'idle' && toolName !== 'thinking') {
      if (!todayData.tools[toolName]) {
        todayData.tools[toolName] = {
          name: toolName,
          count: 0,
          successCount: 0,
          failCount: 0,
        }
      }

      todayData.tools[toolName].count++
      todayData.totalCount++

      if (success) {
        todayData.tools[toolName].successCount++
        todayData.successCount++
      } else {
        todayData.tools[toolName].failCount++
      }
    }
  }

  // 今日使用次数
  const todayCount = computed(() => {
    return dailyStats.value[today.value]?.totalCount || 0
  })

  // 今日成功次数
  const todaySuccess = computed(() => {
    return dailyStats.value[today.value]?.successCount || 0
  })

  // 成功率
  const successRate = computed(() => {
    const total = todayCount.value
    if (total === 0) return 100
    return Math.round((todaySuccess.value / total) * 100)
  })

  // 工作时长（秒）
  const workDuration = computed(() => {
    return dailyStats.value[today.value]?.workDuration || 0
  })

  // 最常用工具
  const mostUsedTool = computed(() => {
    const todayData = dailyStats.value[today.value]
    if (!todayData || !todayData.tools) return null

    const tools = Object.values(todayData.tools)
    if (tools.length === 0) return null

    const sorted = tools.sort((a, b) => b.count - a.count)
    return sorted[0].name
  })

  // 工具列表（按使用次数排序）
  const toolsList = computed(() => {
    const todayData = dailyStats.value[today.value]
    if (!todayData || !todayData.tools) return []

    return Object.values(todayData.tools).sort((a, b) => b.count - a.count)
  })

  // 清理旧数据（保留最近 7 天）
  const cleanOldData = () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoffDate = sevenDaysAgo.toISOString().split('T')[0]

    Object.keys(dailyStats.value).forEach((date) => {
      if (date < cutoffDate) {
        delete dailyStats.value[date]
      }
    })
  }

  // 重置今日统计
  const resetToday = () => {
    if (dailyStats.value[today.value]) {
      dailyStats.value[today.value] = {
        date: today.value,
        tools: {},
        totalCount: 0,
        successCount: 0,
        workDuration: 0,
      }
    }
    currentStateStartTime.value = null
  }

  // 初始化
  initToday()

  // 每天自动清理旧数据
  setInterval(() => {
    const newToday = new Date().toISOString().split('T')[0]
    if (newToday !== today.value) {
      today.value = newToday
      initToday()
      cleanOldData()
    }
  }, 60000) // 每分钟检查一次

  return {
    dailyStats,
    today,
    todayCount,
    todaySuccess,
    successRate,
    workDuration,
    mostUsedTool,
    toolsList,
    recordStateChange,
    resetToday,
    cleanOldData,
  }
}, {
  tauri: {
    filterKeys: ['dailyStats', 'today'],
    filterKeysStrategy: 'pick',
  },
})
