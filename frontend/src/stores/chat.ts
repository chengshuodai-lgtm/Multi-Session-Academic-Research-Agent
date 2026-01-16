import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import chatApi from '@/api/chat.ts'
import { ElMessage } from 'element-plus'

export const useChatStore = defineStore('chat', () => {
  // 全局状态
  const sessions = ref([])
  const currentSession = ref(null)
  const messages = ref([])
  const apiStatus = ref('检查中...')
  const loading = ref(false)
  const streaming = ref(false) // 是否使用流式
  const isStreaming = ref(false) // 当前是否正在流式传输中
  const streamContent = ref('') // 流式内容缓存
  
  // Getters
  const currentSessionId = computed(() => currentSession.value?.id)
  const messageCount = computed(() => messages.value.length)
  
  // Actions
  async function loadSessions() {
    try {
      loading.value = true
      const response = await chatApi.getSessions()
      sessions.value = response.data
      return sessions.value
    } catch (error) {
      console.error('加载会话失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  async function createSession(title?: string) {
    try {
      const response = await chatApi.createSession(title)
      const newSession = response.data
      sessions.value.unshift(newSession)
      return newSession
    } catch (error) {
      console.error('创建会话失败:', error)
      throw error
    }
  }
  
  async function loadSessionDetail(sessionId: string) {
    try {
      loading.value = true
      const response = await chatApi.getSession(sessionId)
      currentSession.value = response.data
      messages.value = response.data.messages || []
      return currentSession.value
    } catch (error) {
      console.error('加载会话详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  async function updateSessionTitle(sessionId: string, newTitle: string) {
    try {
      const response = await chatApi.updateSession(sessionId, { title: newTitle })
      const updatedSession = response.data
      
      // 更新会话列表中的会话
      const index = sessions.value.findIndex((s: any) => s.id === sessionId)
      if (index !== -1) {
        sessions.value[index] = { ...sessions.value[index], ...updatedSession }
      }
      
      // 更新当前会话
      if (currentSession.value?.id === sessionId) {
        currentSession.value = { ...currentSession.value, ...updatedSession }
      }
      
      return updatedSession
    } catch (error) {
      console.error('更新会话标题失败:', error)
      throw error
    }
  }
  
  async function deleteSession(sessionId: string) {
    try {
      await chatApi.deleteSession(sessionId)
      
      // 从列表中移除
      sessions.value = sessions.value.filter((s: any) => s.id !== sessionId)
      
      // 如果删除的是当前会话，清空当前会话
      if (currentSession.value?.id === sessionId) {
        currentSession.value = null
        messages.value = []
      }
      
      return true
    } catch (error) {
      console.error('删除会话失败:', error)
      throw error
    }
  }
  
  async function sendMessage(chatRequest: any) {
    try {
      if (streaming.value) {
        return await sendStreamMessage(chatRequest)
      } else {
        return await sendNormalMessage(chatRequest)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }
  
  async function sendNormalMessage(chatRequest: any) {
    const requestData = {
      message: chatRequest.content,
      session_id: chatRequest.session_id,
      stream: false
    }
    
    const response = await chatApi.sendMessage(requestData)
    const newMessage = response.data.message
    
    // 添加到消息列表
    messages.value.push(newMessage)
    
    // 更新会话列表中的更新时间
    await loadSessions()
    
    return newMessage
  }
  
  async function sendStreamMessage(chatRequest: any) {
    return new Promise((resolve, reject) => {
      // 先添加用户消息
      const userMessage = {
        id: 'temp-user-' + Date.now(),
        session_id: chatRequest.session_id,
        role: 'user',
        content: chatRequest.content,
        created_at: new Date().toISOString()
      }
      messages.value.push(userMessage)
      
      // 创建临时的助手消息用于流式显示
      const tempAssistantId = 'temp-assistant-' + Date.now()
      let tempMessage = {
        id: tempAssistantId,
        session_id: chatRequest.session_id,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      }
      messages.value.push(tempMessage)
      
      isStreaming.value = true
      let fullContent = ''
      
      // 使用新的streamMessage方法
      chatApi.streamMessage(
        {
          message: chatRequest.content,
          session_id: chatRequest.session_id
        },
        (data) => {
          // 处理流式数据
          if (data.content && data.content !== '') {
            fullContent += data.content
            
            // 更新临时消息内容
            const index = messages.value.findIndex((m: any) => m.id === tempAssistantId)
            if (index !== -1) {
              tempMessage = {
                ...tempMessage,
                content: fullContent
              }
              messages.value[index] = tempMessage
            }
          }
          
          if (data.is_final) {
            // 流式结束
            isStreaming.value = false
            
            // 延迟移除临时消息并重新加载完整消息
            setTimeout(async () => {
              // 移除临时消息
              const index = messages.value.findIndex((m: any) => m.id === tempAssistantId)
              if (index !== -1) {
                messages.value.splice(index, 1)
              }
              
              // 重新加载会话获取完整消息
              if (fullContent.trim()) {
                await loadSessionDetail(chatRequest.session_id)
              }
              
              resolve({ content: fullContent })
            }, 500)
          }
        },
        (error) => {
          isStreaming.value = false
          
          // 移除临时消息
          const index = messages.value.findIndex((m: any) => m.id === tempAssistantId)
          if (index !== -1) {
            messages.value.splice(index, 1)
          }
          
          ElMessage.error('流式响应失败: ' + error.message)
          reject(error)
        }
      )
    })
  }
  
  function toggleStreaming() {
    streaming.value = !streaming.value
    return streaming.value
  }
  
  async function checkApiStatus() {
    try {
      await chatApi.checkApiStatus()
      apiStatus.value = '已连接'
      return true
    } catch (error) {
      apiStatus.value = '无法连接'
      console.error('API连接失败:', error)
      return false
    }
  }
  
  function setCurrentSession(session: any) {
    currentSession.value = session
  }
  
  function clearCurrentSession() {
    currentSession.value = null
    messages.value = []
  }
  
  return {
    // 状态
    sessions,
    currentSession,
    messages,
    apiStatus,
    loading,
    streaming,
    isStreaming,
    streamContent,
    
    // Getters
    currentSessionId,
    messageCount,
    
    // Actions
    loadSessions,
    createSession,
    loadSessionDetail,
    updateSessionTitle,
    deleteSession,
    sendMessage,
    checkApiStatus,
    setCurrentSession,
    clearCurrentSession,
    toggleStreaming
  }
})