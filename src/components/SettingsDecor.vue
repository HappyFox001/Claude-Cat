<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import AsciiCat from './AsciiCat.vue'

interface Props {
  variant?: 'general' | 'cat' | 'model' | 'shortcut' | 'about'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'general',
})

// 当前时间
const currentTime = ref('')
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 不同页面的配置
const pageConfig = {
  general: {
    catVariant: 'idle' as const,
    asciiTitle: '｢ 通用 ｣',
    tips: ['窗口会立即生效', '透明度可调节', '穿透不影响操作'],
    decoration: '✧ ── ✦ ── ✧',
  },
  cat: {
    catVariant: 'happy' as const,
    asciiTitle: '｢ 猫咪 ｣',
    tips: ['多选表情随机播', '点击预览效果', '可自由搭配'],
    decoration: '🐾 ─ · ─ 🐾',
  },
  model: {
    catVariant: 'curious' as const,
    asciiTitle: '｢ 模型 ｣',
    tips: ['支持 Live2D 格式', '可导入自定义', '随时切换角色'],
    decoration: '✨ ── ★ ── ✨',
  },
  shortcut: {
    catVariant: 'coding' as const,
    asciiTitle: '｢ 快捷 ｣',
    tips: ['全局快捷键', '快速切换显示', '提高工作效率'],
    decoration: '⌨ ── · ── ⌨',
  },
  about: {
    catVariant: 'nyan' as const,
    asciiTitle: '｢ 关于 ｣',
    tips: ['感谢使用 ♡', '欢迎提交反馈', '给个 Star ~'],
    decoration: '♪ ── ♫ ── ♪',
  },
}

const config = computed(() => pageConfig[props.variant] || pageConfig.general)
</script>

<template>
  <div class="settings-decor">
    <!-- ASCII 风格头部 -->
    <div class="decor-header">
      <span class="ascii-border">╭───────────╮</span>
      <span class="ascii-title">{{ config.asciiTitle }}</span>
      <span class="ascii-border">╰───────────╯</span>
    </div>

    <!-- ASCII 猫咪 -->
    <div class="cat-box">
      <div class="cat-frame">
        <span class="frame-line">┌ ─ ─ ─ ─ ─ ┐</span>
        <AsciiCat :variant="config.catVariant" size="sm" />
        <span class="frame-line">└ ─ ─ ─ ─ ─ ┘</span>
      </div>
    </div>

    <!-- 装饰分隔 -->
    <div class="ascii-decoration">
      {{ config.decoration }}
    </div>

    <!-- 小提示 -->
    <div class="tips-box">
      <div class="tips-header">
        <span class="bracket">「</span>
        <span class="tips-title">Tips</span>
        <span class="bracket">」</span>
      </div>
      <ul class="tips-list">
        <li v-for="(tip, index) in config.tips" :key="index">
          <span class="bullet">›</span>
          <span>{{ tip }}</span>
        </li>
      </ul>
    </div>

    <!-- 底部时间 -->
    <div class="time-display">
      <span class="time-frame">[ {{ currentTime }} ]</span>
    </div>

    <!-- 浮动装饰 -->
    <div class="floating-decor">
      <span class="float-item f1">·</span>
      <span class="float-item f2">✦</span>
      <span class="float-item f3">·</span>
    </div>
  </div>
</template>

<style scoped>
.settings-decor {
  position: relative;
  width: 160px;
  min-width: 160px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 8px;
  gap: 16px;
  border-left: 1px dashed var(--color-border-2);
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--color-primary-1) 3%, transparent) 50%,
    transparent 100%
  );
  font-family: var(--font-cute);
  overflow: hidden;
}

/* ASCII 头部 */
.decor-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-3);
  line-height: 1.2;
}

.ascii-title {
  color: var(--color-primary-5);
  font-size: 11px;
  letter-spacing: 2px;
}

.ascii-border {
  opacity: 0.5;
}

/* 猫咪盒子 */
.cat-box {
  width: 100%;
}

.cat-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: var(--color-fill-1);
  border-radius: 8px;
}

.frame-line {
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--color-text-4);
  letter-spacing: 1px;
}

/* ASCII 装饰 */
.ascii-decoration {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-primary-4);
  letter-spacing: 2px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* 提示盒子 */
.tips-box {
  width: 100%;
  padding: 10px;
  background: var(--color-fill-1);
  border-radius: 8px;
}

.tips-header {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 11px;
}

.bracket {
  color: var(--color-primary-5);
  font-family: var(--font-mono);
}

.tips-title {
  color: var(--color-text-2);
  font-weight: 500;
}

.tips-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tips-list li {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 10px;
  color: var(--color-text-3);
}

.tips-list li:last-child {
  margin-bottom: 0;
}

.bullet {
  color: var(--color-primary-5);
  font-family: var(--font-mono);
}

/* 时间显示 */
.time-display {
  margin-top: auto;
}

.time-frame {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-3);
  letter-spacing: 1px;
}

/* 浮动装饰 */
.floating-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.float-item {
  position: absolute;
  font-size: 8px;
  color: var(--color-primary-4);
  animation: float 6s ease-in-out infinite;
}

.f1 { left: 10%; top: 30%; animation-delay: 0s; }
.f2 { right: 15%; top: 50%; animation-delay: 2s; }
.f3 { left: 20%; bottom: 20%; animation-delay: 4s; }

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-10px) scale(1.2);
    opacity: 0.8;
  }
}
</style>
