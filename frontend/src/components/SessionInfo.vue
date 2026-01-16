<template>
  <div class="session-info">
    <p>会话ID: <span>{{ sessionId }}</span></p>
    <p>创建时间: <span>{{ formatDate(createdAt) }}</span></p>
    <p>更新时间: <span>{{ formatDate(updatedAt) }}</span></p>
    <p>消息数量: <span>{{ messageCount }}</span></p>
    <p>响应模式: <span :class="responseModeClass">{{ responseMode }}</span></p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat.ts'

const chatStore = useChatStore()

const sessionId = computed(() => chatStore.currentSession?.id || '-')
const createdAt = computed(() => chatStore.currentSession?.created_at || '-')
const updatedAt = computed(() => chatStore.currentSession?.updated_at || '-')
const messageCount = computed(() => chatStore.messageCount)
const responseMode = computed(() => chatStore.streaming ? '流式' : '普通')
const responseModeClass = computed(() => ({
  'stream-mode': chatStore.streaming,
  'normal-mode': !chatStore.streaming
}))

function formatDate(dateString) {
  if (dateString === '-') return '-'
  return new Date(dateString).toLocaleString()
}
</script>

<style scoped>
.session-info {
  padding: 15px 25px;
  border-top: 1px solid #eaeaea;
  background-color: #f8f9fa;
  font-size: 0.85rem;
  color: #666;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.session-info p {
  margin: 5px 0;
}

.session-info span {
  font-weight: 600;
  color: #444;
}

.stream-mode {
  color: #409eff;
}

.normal-mode {
  color: #67c23a;
}

@media (max-width: 768px) {
  .session-info {
    grid-template-columns: 1fr;
  }
}
</style>