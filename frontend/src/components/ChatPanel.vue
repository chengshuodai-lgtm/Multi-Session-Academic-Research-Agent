<template>
  <div class="chat-panel">
    <div v-if="!currentSession" class="no-session">
      <div class="empty-state">
        <el-icon size="60"><ChatDotRound /></el-icon>
        <h3>选择或创建会话</h3>
        <p>从左侧选择一个会话或创建新会话来开始聊天</p>
      </div>
    </div>
    
    <div v-else class="session-detail">
      <SessionHeader
        :title="currentSession.title"
        @edit="showEditModal = true"
        @refresh="handleRefresh"
        @delete="showDeleteModal = true"
      />
      
      <MessagesList :messages="messages" />
      
      <MessageInput />
      
      <SessionInfo />
    </div>
    
    <EditTitleModal
      v-model="showEditModal"
      :current-title="currentSession?.title"
      @saved="handleTitleSaved"
    />
    
    <DeleteModal
      v-model="showDeleteModal"
      @deleted="handleSessionDeleted"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useChatStore } from '@/stores/chat.ts'
import { ChatDotRound } from '@element-plus/icons-vue'
import SessionHeader from './SessionHeader.vue'
import MessagesList from './MessagesList.vue'
import MessageInput from './MessageInput.vue'
import SessionInfo from './SessionInfo.vue'
import EditTitleModal from './EditTitleModal.vue'
import DeleteModal from './DeleteModal.vue'

const chatStore = useChatStore()

const showEditModal = ref(false)
const showDeleteModal = ref(false)

const currentSession = computed(() => chatStore.currentSession)
const messages = computed(() => chatStore.messages)

function handleRefresh() {
  if (chatStore.currentSessionId) {
    chatStore.loadSessionDetail(chatStore.currentSessionId)
  }
}

function handleTitleSaved() {
  // 标题保存后的处理
  showEditModal.value = false
}

function handleSessionDeleted() {
  // 会话删除后的处理
  showDeleteModal.value = false
}
</script>

<style scoped>
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.no-session {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
}

.empty-state h3 {
  font-size: 1.8rem;
  margin: 20px 0 10px;
  color: #666;
}

.empty-state p {
  font-size: 1.1rem;
}

.session-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>