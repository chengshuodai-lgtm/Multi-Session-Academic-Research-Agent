<template>
  <div class="container">
    <header>
      <h1><el-icon><ChatLineRound /></el-icon> 研究助手</h1>
      <p class="subtitle">AI驱动的研究助手，高效收集和分析信息</p>
    </header>
    
    <div class="app-container">
      <SessionsPanel />
      <ChatPanel />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '@/stores/chat.ts'
import { ChatLineRound } from '@element-plus/icons-vue'
import SessionsPanel from './components/SessionsPanel.vue'
import ChatPanel from './components/ChatPanel.vue'

const chatStore = useChatStore()

onMounted(async () => {
  // 检查API状态
  await chatStore.checkApiStatus()
  
  // 加载会话列表
  await chatStore.loadSessions()
  
  // 设置键盘快捷键
  setupKeyboardShortcuts()
})

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N 创建新会话
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault()
      // 这里可以触发创建会话的逻辑
    }
    
    // Esc 关闭模态框（Element Plus Dialog会自动处理）
  })
}
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-height: 100vh;
}

header {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

header h1 {
  font-size: 2.2rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 300;
}

.app-container {
  display: flex;
  min-height: 700px;
}

@media (max-width: 1024px) {
  .app-container {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .container {
    border-radius: 0;
    box-shadow: none;
    min-height: 100vh;
  }
}
</style>