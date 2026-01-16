<template>
  <div class="messages-container">
    <div class="messages-list">
      <div v-if="messages.length === 0" class="message message-system">
        暂无消息，开始对话吧！
      </div>
      
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', `message-${message.role}`]"
      >
        <div class="message-header">
          <span class="message-role">{{ roleNames[message.role] }}</span>
          <span class="message-id">ID: {{ message.id.substring(0, 8) }}...</span>
        </div>
        <div class="message-content">{{ message.content }}</div>
        <div class="message-time">{{ formatTime(message.created_at) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const roleNames = {
  'user': '用户',
  'assistant': '助手',
  'system': '系统',
  'tool': '工具'
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString()
}
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9f9f9;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  max-width: 80%;
  padding: 15px 18px;
  border-radius: 12px;
  position: relative;
  word-wrap: break-word;
}

.message-user {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-assistant {
  align-self: flex-start;
  background-color: #f1f3f5;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-system {
  align-self: center;
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  max-width: 90%;
  font-size: 0.9rem;
}

.message-tool {
  align-self: flex-start;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.85rem;
  opacity: 0.8;
}

.message-content {
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-time {
  font-size: 0.75rem;
  text-align: right;
  margin-top: 5px;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .message {
    max-width: 90%;
  }
}
</style>