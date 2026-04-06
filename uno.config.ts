import {
  defineConfig,
  presetIcons,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons(),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives({
      applyVariable: ['--uno'],
    }),
  ],
  shortcuts: [
    [/^bg-color-(\d+)$/, ([, d]) => `bg-bg-${d}`],
    [/^text-color-(\d+)$/, ([, d]) => `text-text-${d}`],
    [/^b-color-(\d+)$/, ([, d]) => `b-border-${d}`],
    // 使用紫色主题
    [/^(.*)-primary-(\d+)$/, ([, s, d]) => `${s}-[var(--ant-purple-${d})]`],
  ],
  theme: {
    colors: {
      // 背景色
      'bg-1': 'var(--ant-color-bg-layout)',
      'bg-2': 'var(--ant-color-bg-container)',
      'bg-3': 'var(--ant-color-bg-elevated)',
      'bg-4': 'var(--ant-color-bg-spotlight)',
      'bg-5': 'var(--ant-color-fill)',
      'bg-6': 'var(--ant-color-fill-secondary)',
      'bg-7': 'var(--ant-color-fill-tertiary)',
      'bg-8': 'var(--ant-color-fill-quaternary)',
      // 文字色
      'text-1': 'var(--ant-color-text)',
      'text-2': 'var(--ant-color-text-secondary)',
      'text-3': 'var(--ant-color-text-tertiary)',
      'text-4': 'var(--ant-color-text-quaternary)',
      // 边框色
      'border-1': 'var(--ant-color-border)',
      'border-2': 'var(--ant-color-border-secondary)',
      // 主题色 - 紫色
      'primary': 'var(--ant-color-primary)',
      'primary-hover': 'var(--ant-color-primary-hover)',
      'primary-active': 'var(--ant-color-primary-active)',
      // 状态色
      'success': 'var(--ant-color-success)',
      'warning': 'var(--ant-color-warning)',
      'error': 'var(--ant-color-error)',
      'info': 'var(--ant-color-info)',
      'danger': 'var(--ant-color-error)',
    },
  },
})
