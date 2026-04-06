<script setup lang="ts">
import { emit } from '@tauri-apps/api/event'
import { Button } from 'ant-design-vue'
import { ref } from 'vue'

import { type ClaudeState, CLAUDE_STATES, EXPRESSIONS, useCatStore } from '@/stores/cat'

const catStore = useCatStore()
const expandedState = ref<string | null>(null)

// Fluent Emoji 3D CDN 基础路径
const EMOJI_CDN = 'https://registry.npmmirror.com/@lobehub/fluent-emoji-3d/latest/files/assets'

// 表情对应的 Fluent Emoji Unicode (3D 风格)
const expressionEmojis: Record<string, string> = {
  normal: '1f60a',    // 😊 Smiling Face with Smiling Eyes
  question: '1f914',  // 🤔 Thinking Face
  angry: '1f621',     // 😡 Pouting Face (更生气的表情)
  sad: '1f625',       // 😥 Sad but Relieved Face
  cry: '1f62d',       // 😭 Loudly Crying Face
  surprised: '1f632', // 😲 Astonished Face
  excited: '1f929',   // 🤩 Star-Struck
  fluffy: '1f970',    // 🥰 Smiling Face with Hearts
  knife: '1f52a',     // 🔪 Kitchen Knife
  long: '1f611',      // 😑 Expressionless Face
  no_pupil: '1f47b',  // 👻 Ghost (更符合"无瞳"的诡异感)
}

// 获取 emoji 图片 URL
function getEmojiUrl(name: string): string {
  const unicode = expressionEmojis[name] || '1f60a'
  return `${EMOJI_CDN}/${unicode}.webp`
}

// 状态对应的图标
const stateIcons: Record<string, string> = {
  idle: 'i-solar:sleeping-square-bold-duotone',
  thinking: 'i-solar:lightbulb-bolt-bold-duotone',
  coding: 'i-solar:code-bold-duotone',
  reading: 'i-solar:book-bookmark-bold-duotone',
  running: 'i-solar:play-circle-bold-duotone',
  error: 'i-solar:danger-triangle-bold-duotone',
  celebrate: 'i-solar:confetti-bold-duotone',
  failed: 'i-solar:close-circle-bold-duotone',
  denied: 'i-solar:forbidden-bold-duotone',
  busy: 'i-solar:hourglass-bold-duotone',
  searching: 'i-solar:magnifer-bold-duotone',
}

// 状态对应的颜色
const stateColors: Record<string, string> = {
  idle: '#94a3b8',
  thinking: '#fbbf24',
  coding: '#a78bfa',
  reading: '#60a5fa',
  running: '#34d399',
  error: '#f87171',
  celebrate: '#f472b6',
  failed: '#fb923c',
  denied: '#ef4444',
  busy: '#8b5cf6',
  searching: '#06b6d4',
}

function isExpressionSelected(stateKey: string, expressionIndex: number) {
  return catStore.expressions[stateKey as ClaudeState]?.includes(expressionIndex)
}

function toggleExpression(stateKey: string, expressionIndex: number) {
  const current = catStore.expressions[stateKey as ClaudeState] || []

  if (current.includes(expressionIndex)) {
    if (current.length > 1) {
      catStore.expressions[stateKey as ClaudeState] = current.filter(i => i !== expressionIndex)
    }
  }
  else {
    catStore.expressions[stateKey as ClaudeState] = [...current, expressionIndex]
  }
}

function getSelectedCount(stateKey: string) {
  return catStore.expressions[stateKey as ClaudeState]?.length || 0
}

function toggleExpand(stateKey: string) {
  expandedState.value = expandedState.value === stateKey ? null : stateKey
}

function previewExpression(index: number) {
  emit('preview-expression', { index })
}

function previewRandomExpression(stateKey: string) {
  const index = catStore.getRandomExpression(stateKey as ClaudeState)
  emit('preview-expression', { index })
}
</script>

<template>
  <div class="expression-mapping">
    <!-- 头部 -->
    <div class="header">
      <div class="header-info">
        <span class="header-tip">点击状态卡片展开选择表情，支持多选</span>
      </div>
      <Button size="small" type="text" @click="catStore.resetExpressions()">
        <i class="i-solar:restart-bold mr-1" />
        重置
      </Button>
    </div>

    <!-- 状态列表 -->
    <div class="state-list">
      <div
        v-for="state in CLAUDE_STATES"
        :key="state.key"
        class="state-card"
        :class="{ expanded: expandedState === state.key }"
        :style="{ '--state-color': stateColors[state.key] }"
      >
        <!-- 状态头部 -->
        <div class="state-header" @click="toggleExpand(state.key)">
          <div class="state-info">
            <div class="state-icon">
              <i :class="stateIcons[state.key]" />
            </div>
            <div class="state-text">
              <span class="state-name">{{ state.label }}</span>
              <span class="state-desc">{{ state.description }}</span>
            </div>
          </div>

          <div class="state-actions">
            <!-- 已选表情预览 -->
            <div class="selected-emojis">
              <img
                v-for="idx in catStore.expressions[state.key as ClaudeState]"
                :key="idx"
                :src="getEmojiUrl(EXPRESSIONS[idx]?.name)"
                :alt="EXPRESSIONS[idx]?.label"
                class="emoji-badge"
              >
            </div>

            <!-- 预览按钮 -->
            <button
              class="preview-btn"
              title="预览随机表情"
              @click.stop="previewRandomExpression(state.key)"
            >
              <i class="i-solar:play-bold" />
            </button>

            <!-- 展开箭头 -->
            <i
              class="expand-arrow i-solar:alt-arrow-down-linear"
              :class="{ rotated: expandedState === state.key }"
            />
          </div>
        </div>

        <!-- 表情选择区 -->
        <Transition name="slide">
          <div v-if="expandedState === state.key" class="expression-panel">
            <div class="expression-grid">
              <div
                v-for="expr in EXPRESSIONS"
                :key="expr.index"
                class="expression-chip"
                :class="{ selected: isExpressionSelected(state.key, expr.index) }"
                @click="toggleExpression(state.key, expr.index)"
              >
                <img
                  :src="getEmojiUrl(expr.name)"
                  :alt="expr.label"
                  class="chip-emoji"
                >
                <span class="chip-label">{{ expr.label }}</span>
                <button
                  class="chip-preview"
                  title="预览"
                  @click.stop="previewExpression(expr.index)"
                >
                  <i class="i-solar:play-bold" />
                </button>
                <i
                  v-if="isExpressionSelected(state.key, expr.index)"
                  class="chip-check i-solar:check-circle-bold"
                />
              </div>
            </div>
            <div class="panel-hint">
              <i class="i-solar:info-circle-linear" />
              <span>点击选择，悬停显示预览按钮，已选 {{ getSelectedCount(state.key) }} 个</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expression-mapping {
  padding: 4px 0;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.header-tip {
  font-size: 12px;
  color: var(--color-text-3);
}

/* 状态列表 */
.state-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 状态卡片 */
.state-card {
  background: var(--color-fill-2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.state-card:hover {
  background: var(--color-fill-3);
}

.state-card.expanded {
  border-color: var(--state-color);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--state-color) 20%, transparent);
}

/* 状态头部 */
.state-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
}

.state-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.state-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--state-color) 15%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--state-color);
  font-size: 16px;
}

.state-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.state-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-1);
}

.state-desc {
  font-size: 11px;
  color: var(--color-text-3);
}

.state-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 已选表情 */
.selected-emojis {
  display: flex;
  gap: 4px;
  align-items: center;
}

.emoji-badge {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

/* 预览按钮 */
.preview-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: var(--color-fill-3);
  color: var(--color-text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.preview-btn:hover {
  background: var(--state-color);
  color: white;
}

/* 展开箭头 */
.expand-arrow {
  font-size: 14px;
  color: var(--color-text-3);
  transition: transform 0.2s;
}

.expand-arrow.rotated {
  transform: rotate(180deg);
}

/* 表情选择面板 */
.expression-panel {
  padding: 0 12px 12px;
}

.expression-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 表情选择芯片 */
.expression-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 6px 8px;
  border-radius: 20px;
  border: 1px solid var(--color-border-2);
  background: var(--color-fill-1);
  cursor: pointer;
  transition: all 0.15s;
  font-size: 12px;
  color: var(--color-text-2);
}

.expression-chip:hover {
  border-color: var(--state-color);
  background: color-mix(in srgb, var(--state-color) 8%, transparent);
}

.expression-chip.selected {
  border-color: var(--state-color);
  background: color-mix(in srgb, var(--state-color) 15%, transparent);
  color: var(--color-text-1);
}

.chip-emoji {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
  transition: transform 0.15s;
}

.expression-chip:hover .chip-emoji {
  transform: scale(1.15);
}

.chip-label {
  font-size: 12px;
}

.chip-preview {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: var(--color-fill-3);
  color: var(--color-text-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  opacity: 0;
  transition: all 0.15s;
  margin-left: auto;
}

.expression-chip:hover .chip-preview {
  opacity: 1;
}

.chip-preview:hover {
  background: var(--state-color);
  color: white;
  transform: scale(1.1);
}

.chip-check {
  font-size: 12px;
  color: var(--state-color);
}

/* 面板提示 */
.panel-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border-1);
  font-size: 11px;
  color: var(--color-text-3);
}

/* 展开动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
