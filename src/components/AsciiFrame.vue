<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'simple' | 'rounded' | 'double' | 'stars' | 'dots'
  title?: string
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'rounded',
  animated: false,
})

// ASCII 边框字符集
const borderChars = {
  simple: {
    tl: '+', tr: '+', bl: '+', br: '+',
    h: '-', v: '|',
    titleL: '[', titleR: ']',
  },
  rounded: {
    tl: '╭', tr: '╮', bl: '╰', br: '╯',
    h: '─', v: '│',
    titleL: '「', titleR: '」',
  },
  double: {
    tl: '╔', tr: '╗', bl: '╚', br: '╝',
    h: '═', v: '║',
    titleL: '【', titleR: '】',
  },
  stars: {
    tl: '✧', tr: '✧', bl: '✧', br: '✧',
    h: '·', v: '✦',
    titleL: '★', titleR: '★',
  },
  dots: {
    tl: '●', tr: '●', bl: '●', br: '●',
    h: '·', v: '·',
    titleL: '◉', titleR: '◉',
  },
}

const chars = computed(() => borderChars[props.variant] || borderChars.rounded)
</script>

<template>
  <div class="ascii-frame" :class="{ animated }">
    <!-- 顶部边框 -->
    <div class="frame-top">
      <span class="corner">{{ chars.tl }}</span>
      <span v-if="title" class="title">
        {{ chars.titleL }}{{ title }}{{ chars.titleR }}
      </span>
      <span class="line">{{ chars.h.repeat(title ? 10 : 20) }}</span>
      <span class="corner">{{ chars.tr }}</span>
    </div>

    <!-- 内容区 -->
    <div class="frame-content">
      <span class="side">{{ chars.v }}</span>
      <div class="content">
        <slot />
      </div>
      <span class="side">{{ chars.v }}</span>
    </div>

    <!-- 底部边框 -->
    <div class="frame-bottom">
      <span class="corner">{{ chars.bl }}</span>
      <span class="line">{{ chars.h.repeat(20) }}</span>
      <span class="corner">{{ chars.br }}</span>
    </div>
  </div>
</template>

<style scoped>
.ascii-frame {
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-3);
}

.frame-top,
.frame-bottom {
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
}

.corner {
  flex-shrink: 0;
}

.title {
  flex-shrink: 0;
  color: var(--color-primary-5);
  padding: 0 4px;
}

.line {
  overflow: hidden;
  opacity: 0.6;
}

.frame-content {
  display: flex;
}

.side {
  flex-shrink: 0;
  opacity: 0.6;
}

.content {
  flex: 1;
  padding: 8px 12px;
  font-family: var(--font-cute);
}

/* 动画效果 */
.animated .corner,
.animated .title {
  animation: twinkle 2s ease-in-out infinite;
}

.animated .frame-top .corner { animation-delay: 0s; }
.animated .frame-top .title { animation-delay: 0.3s; }
.animated .frame-bottom .corner:first-child { animation-delay: 0.6s; }
.animated .frame-bottom .corner:last-child { animation-delay: 0.9s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; color: var(--color-primary-5); }
}
</style>
