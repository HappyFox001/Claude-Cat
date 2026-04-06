<script setup lang="ts">
import { convertFileSrc } from '@tauri-apps/api/core'
import { revealItemInDir } from '@tauri-apps/plugin-opener'
import { Card } from 'ant-design-vue'

import { useModelStore } from '@/stores/model'
import { join } from '@/utils/path'

const modelStore = useModelStore()
</script>

<template>
  <div class="flex flex-col gap-4">
    <Card
      v-if="modelStore.currentModel"
      class="max-w-80"
      hoverable
      size="small"
    >
      <template #cover>
        <img
          alt="Void Cat"
          :src="convertFileSrc(join(modelStore.currentModel.path, 'resources', 'cover.png'))"
        >
      </template>

      <template #actions>
        <i
          class="i-iconamoon:check-circle-1-bold text-4 text-success"
        />

        <i
          class="i-iconamoon:link-external-bold text-4"
          @click.stop="revealItemInDir(modelStore.currentModel!.path)"
        />
      </template>

      <Card.Meta
        :description="$t('pages.preference.model.hints.voidCatDesc')"
        :title="$t('pages.preference.model.labels.voidCat')"
      />
    </Card>
  </div>
</template>
