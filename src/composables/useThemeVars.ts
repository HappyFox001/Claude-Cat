import { theme } from 'ant-design-vue'
import { kebabCase } from 'es-toolkit'

// 黑猫主题色 - 紫色系
export const catThemeToken = {
  // 主色 - 神秘紫
  colorPrimary: '#7c3aed',
  colorPrimaryBg: '#1e1b4b',
  colorPrimaryBgHover: '#2e1065',
  colorPrimaryBorder: '#5b21b6',
  colorPrimaryBorderHover: '#7c3aed',
  colorPrimaryHover: '#8b5cf6',
  colorPrimaryActive: '#6d28d9',
  colorPrimaryTextHover: '#a78bfa',
  colorPrimaryText: '#7c3aed',
  colorPrimaryTextActive: '#6d28d9',

  // 成功色 - 绿色 (庆祝)
  colorSuccess: '#10b981',
  colorSuccessBg: '#022c22',
  colorSuccessBorder: '#059669',

  // 警告色 - 琥珀色 (思考)
  colorWarning: '#f59e0b',
  colorWarningBg: '#422006',
  colorWarningBorder: '#d97706',

  // 错误色 - 红色
  colorError: '#ef4444',
  colorErrorBg: '#450a0a',
  colorErrorBorder: '#dc2626',

  // 信息色 - 蓝色 (运行)
  colorInfo: '#3b82f6',
  colorInfoBg: '#172554',
  colorInfoBorder: '#2563eb',

  // 圆角 - 更柔和
  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusSM: 6,
}

export function useThemeVars() {
  const { defaultAlgorithm, darkAlgorithm, defaultConfig } = theme

  const generateColorVars = () => {
    const { token } = defaultConfig

    // 合并自定义主题
    const customToken = { ...token, ...catThemeToken }

    const colors = [
      defaultAlgorithm(customToken),
      darkAlgorithm(customToken),
    ]

    for (const [index, item] of colors.entries()) {
      const isDark = index !== 0
      const vars: Record<string, any> = {}

      for (const [key, value] of Object.entries(item)) {
        vars[`--ant-${kebabCase(key)}`] = value
      }

      const style = document.createElement('style')
      style.dataset.theme = isDark ? 'dark' : 'light'
      const selector = isDark ? 'html.dark' : ':root'
      const values = Object.entries(vars).map(([key, value]) => `${key}: ${value};`)

      style.innerHTML = `${selector}{\n${values.join('\n')}\n}`
      document.head.appendChild(style)
    }
  }

  return {
    generateColorVars,
  }
}
