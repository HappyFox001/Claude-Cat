<script setup lang="ts">
import { emit } from '@tauri-apps/api/event'
import { openUrl } from '@tauri-apps/plugin-opener'
import { Button } from 'ant-design-vue'

import ProList from '@/components/pro-list/index.vue'
import ProListItem from '@/components/pro-list-item/index.vue'
import { GITHUB_LINK, LISTEN_KEY } from '@/constants'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

function handleUpdate() {
  emit(LISTEN_KEY.UPDATE_APP)
}

function feedbackIssue() {
  openUrl(`${GITHUB_LINK}/issues/new/choose`)
}
</script>

<template>
  <ProList :title="$t('pages.preference.about.labels.aboutApp')">
    <ProListItem
      :description="`v${appStore.version}`"
      :title="appStore.name"
    >
      <Button
        type="primary"
        @click="handleUpdate"
      >
        {{ $t('pages.preference.about.buttons.checkUpdate') }}
      </Button>

      <template #icon>
        <div class="b b-color-2 rounded-xl b-solid">
          <img
            class="size-12"
            src="/logo.png"
          >
        </div>
      </template>
    </ProListItem>

    <ProListItem :title="$t('pages.preference.about.labels.openSource')">
      <Button
        danger
        @click="feedbackIssue"
      >
        {{ $t('pages.preference.about.buttons.feedbackIssues') }}
      </Button>

      <template #description>
        <a :href="GITHUB_LINK">
          {{ GITHUB_LINK }}
        </a>
      </template>
    </ProListItem>
  </ProList>
</template>
