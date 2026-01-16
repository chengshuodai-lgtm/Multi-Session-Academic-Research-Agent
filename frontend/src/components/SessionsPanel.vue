<template>
  <div class="sessions-panel">
    <div class="panel-header">
      <h2><el-icon><ChatLineRound /></el-icon> 聊天会话</h2>
      <el-button type="primary" @click="handleCreateSession" :loading="loading">
        <el-icon><Plus /></el-icon> 新会话
      </el-button>
    </div>
    
    <div class="sessions-list">
      <div v-if="loading" class="loading">正在加载会话...</div>
      <div v-else-if="sessions.length === 0" class="loading">暂无会话，点击上方按钮创建</div>
      
      <div
        v-for="session in sessions"
        :key="session.id"
        :class="['session-item', { active: session.id === currentSessionId }]"
        @click="selectSession(session)"
      >
        <div class="session-title">{{ session.title }}</div>
        <div class="session-time">创建: {{ formatDate(session.created_at) }}</div>
        <div class="session-time">更新: {{ formatDate(session.updated_at) }}</div>
      </div>
    </div>
    
    <div class="panel-footer">
      <p>后端运行在: <span :class="apiStatusClass">{{ apiStatus }}</span></p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat.ts'
import { ChatLineRound, Plus } from '@element-plus/icons-vue'

const chatStore = useChatStore()

const sessions = computed(() => chatStore.sessions)
const currentSessionId = computed(() => chatStore.currentSessionId)
const loading = computed(() => chatStore.loading)
const apiStatus = computed(() => chatStore.apiStatus)

const apiStatusClass = computed(() => ({
  'api-connected': apiStatus.value === '已连接',
  'api-disconnected': apiStatus.value !== '已连接'
}))

function formatDate(dateString) {
  return new Date(dateString).toLocaleString()
}

async function handleCreateSession() {
  try {
    const title = `新会话 ${new Date().toLocaleTimeString()}`
    const newSession = await chatStore.createSession(title)
    selectSession(newSession)
  } catch (error) {
    ElMessage.error('创建会话失败')
  }
}

function selectSession(session) {
  chatStore.setCurrentSession(session)
  chatStore.loadSessionDetail(session.id)
}
</script>

<style scoped>
.sessions-panel {
  width: 300px;
  border-right: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #444;
  margin: 0;
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.session-item {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #eee;
  background-color: white;
}

.session-item:hover {
  background-color: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

.session-item.active {
  background-color: #e6f2ff;
  border-color: #4dabf7;
}

.session-title {
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 0.85rem;
  color: #777;
}

.session-item.active .session-title {
  color: #1971c2;
}

.panel-footer {
  padding: 15px 20px;
  border-top: 1px solid #eaeaea;
  font-size: 0.85rem;
  color: #666;
}

.api-connected {
  color: #2ecc71;
  font-weight: 600;
}

.api-disconnected {
  color: #e74c3c;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 30px;
  color: #888;
  font-style: italic;
}

@media (max-width: 1024px) {
  .sessions-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eaeaea;
    max-height: 300px;
  }
  
  .sessions-list {
    max-height: 200px;
  }
}
</style>