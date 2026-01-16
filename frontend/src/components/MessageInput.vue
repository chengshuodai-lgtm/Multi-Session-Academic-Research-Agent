<template>
  <div class="message-input-container">
    <div class="stream-toggle">
      <el-tooltip :content="streaming ? '当前使用流式响应' : '当前使用普通响应'" placement="top">
        <el-switch
          v-model="streaming"
          inline-prompt
          active-text="流式"
          inactive-text="普通"
          @change="handleStreamToggle"
          size="default"
          :disabled="isStreaming"
        />
      </el-tooltip>
      <span class="stream-tip" :class="{ 'stream-active': streaming, 'stream-disabled': isStreaming }">
        {{ streaming ? (isStreaming ? '流式传输中...' : '流式响应已开启') : '流式响应已关闭' }}
      </span>
    </div>
    
    <el-form :model="form" @submit.prevent="handleSubmit">
      <el-form-item>
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="2"
          :placeholder="streaming ? '输入消息... (流式模式)' : '输入消息... (普通模式)'"
          @keydown.enter="handleKeydown"
          resize="none"
          :disabled="isStreaming"
        />
      </el-form-item>
      <div class="input-actions">
        <el-select v-model="form.role" size="default" :disabled="isStreaming">
          <el-option label="用户" value="user" />
          <el-option label="助手" value="assistant" />
          <el-option label="系统" value="system" />
          <el-option label="工具" value="tool" />
        </el-select>
        <el-button 
          type="primary" 
          native-type="submit" 
          :loading="loading || isStreaming"
          :disabled="isStreaming"
        >
          <template v-if="isStreaming">
            <span class="streaming-indicator">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              传输中
            </span>
          </template>
          <template v-else>
            发送 <el-icon><Promotion /></el-icon>
          </template>
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/stores/chat.ts'

const chatStore = useChatStore()

const loading = ref(false)
const form = reactive({
  content: '',
  role: 'user'
})

// 使用computed来获取状态
const streaming = computed({
  get: () => chatStore.streaming,
  set: (value) => {
    if (!chatStore.isStreaming) {
      chatStore.streaming = value
    }
  }
})

const isStreaming = computed(() => chatStore.isStreaming)

function handleStreamToggle(value) {
  if (!chatStore.isStreaming) {
    ElMessage.success(`已切换到${value ? '流式' : '普通'}模式`)
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey && !isStreaming.value) {
    event.preventDefault()
    handleSubmit()
  }
}

async function handleSubmit() {
  if (!form.content.trim()) {
    ElMessage.warning('消息内容不能为空')
    return
  }

  if (!chatStore.currentSessionId) {
    ElMessage.warning('请先选择或创建会话')
    return
  }

  if (isStreaming.value) {
    ElMessage.warning('请等待当前流式传输完成')
    return
  }

  try {
    loading.value = true
    
    const messageData = {
      session_id: chatStore.currentSessionId,
      content: form.content,
      role: form.role
    }
    
    await chatStore.sendMessage(messageData)
    form.content = ''
    
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.message || '发送消息失败'
    ElMessage.error(`发送消息失败: ${errorMsg}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.message-input-container {
  padding: 20px;
  border-top: 1px solid #eaeaea;
  background-color: white;
}

.stream-toggle {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eaeaea;
}

.stream-tip {
  font-size: 0.85rem;
  color: #666;
}

.stream-tip.stream-active {
  color: #409eff;
  font-weight: 600;
}

.stream-tip.stream-disabled {
  color: #999;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: white;
  animation: pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

:deep(.el-textarea__inner) {
  font-family: inherit;
}

@media (max-width: 768px) {
  .input-actions {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .stream-toggle {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>