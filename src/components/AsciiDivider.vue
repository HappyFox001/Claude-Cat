<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'dots' | 'stars' | 'wave' | 'arrow' | 'cat'
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'dots',
  animated: false,
})

const patterns = {
  dots: '· · · · · · · · · ·',
  stars: '✦ · ✧ · ✦ · ✧ · ✦',
  wave: '～ ～ ～ ～ ～ ～ ～',
  arrow: '› › › › › › › › ›',
  cat: '🐾 · · 🐾 · · 🐾 · ·',
}

const pattern = computed(() => patterns[props.variant] || patterns.dots)
</script>

<template>
  <div class="ascii-divider" :class="[variant, { animated }]">
    <span class="pattern">{{ pattern }}</span>
  </div>
</template>

<style scoped>
.ascii-divider {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-4);
  overflow: hidden;
}

.pattern {
  white-space: nowrap;
  letter-spacing: 2px;
}

.animated .pattern {
  animation: flow 3s linear infinite;
}

@keyframes flow {
  0% { transform: translateX(-10px); }
  100% { transform: translateX(10px); }
}

.stars .pattern {
  color: var(--color-primary-4);
}

.cat .pattern {
  font-size: 8px;
}
</style>
