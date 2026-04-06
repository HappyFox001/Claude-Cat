<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Props {
  variant?: 'idle' | 'coding' | 'thinking' | 'sleeping' | 'happy' | 'random'
  animate?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'random',
  animate: true,
  size: 'md',
})

// ASCII 猫咪艺术集合 - Kaomoji 风格
const catArts = {
  idle: [
    `  ∧,,,∧
 (  ̳• · • ̳)
 /    づ♡`,
    `  ∧,,,∧
 (  ̳- · - ̳)
 /    づ～`,
  ],
  coding: [
    `   ∧__∧  ⌨️
  ( •̀ω•́ )つ
  /つ     |`,
    `   ∧__∧  💻
  ( •̀_•́ )つ
  /つ     |`,
    `   ∧__∧  ✨
  ( ≧ω≦ )つ
  /つ     |`,
  ],
  thinking: [
    `  ∧__∧ ？
 ( ˙꒳​˙ )
  |>　 <|`,
    `  ∧__∧  💭
 ( ˙-˙ )
  |>　 <|`,
    `  ∧__∧  ...
 ( •̥̥̥_•̥̥̥ )
  |>　 <|`,
  ],
  sleeping: [
    `  ∧__∧  💤
 ( ˘ω˘ )
  |>　 <| zzZ`,
    `  ∧,,,∧
 ( -ω- ) zzz
  /    づ`,
  ],
  happy: [
    `  ∧__∧  ✨
 ( ≧▽≦ )
  ノ　　ヽ`,
    `  ∧,,,∧  💕
 ( ˶ˆᗜˆ˵ )
 /    づ♡`,
    `  ∧__∧  ♪
 ( ᵔᴥᵔ )
  ノ　　ヽ`,
  ],
  nyan: [
    `☆ﾟ.*･｡ﾟ
  ∧__∧
 ( ･ω･)つ━☆
  |>　 <|
   しーＪ ✧`,
    ` ☆ ∧__∧ ☆
  ( ≧∇≦)/
    |>  <|✧`,
  ],
  curious: [
    `  ∧__∧  ？
 (｡◕ω◕)
  |つ🐟⊂|`,
    `  ∧__∧  !
 (｡◕‿◕)っ
  |>　 <|`,
  ],
  playful: [
    ` ฅ^•ﻌ•^ฅ`,
    ` /ᐠ. ֑ .ᐟ\\ﾉ`,
    `  ^•ﻌ•^ฅ♡`,
  ],
}

const currentFrame = ref(0)
let animationTimer: ReturnType<typeof setInterval> | null = null

const selectedVariant = computed(() => {
  if (props.variant === 'random') {
    const variants = Object.keys(catArts) as (keyof typeof catArts)[]
    return variants[Math.floor(Math.random() * variants.length)]
  }
  return props.variant
})

const frames = computed(() => catArts[selectedVariant.value] || catArts.idle)

const currentArt = computed(() => frames.value[currentFrame.value] || frames.value[0])

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-xs'
    case 'lg': return 'text-base'
    default: return 'text-sm'
  }
})

onMounted(() => {
  if (props.animate && frames.value.length > 1) {
    animationTimer = setInterval(() => {
      currentFrame.value = (currentFrame.value + 1) % frames.value.length
    }, 800)
  }
})

onUnmounted(() => {
  if (animationTimer) {
    clearInterval(animationTimer)
  }
})
</script>

<template>
  <div class="ascii-cat" :class="sizeClasses">
    <pre class="cat-art">{{ currentArt }}</pre>
  </div>
</template>

<style scoped>
.ascii-cat {
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.cat-art {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  line-height: 1.3;
  color: var(--color-text-3);
  margin: 0;
  white-space: pre;
  text-align: center;
  transition: opacity 0.2s;
}

.ascii-cat:hover .cat-art {
  color: var(--color-text-2);
}
</style>
