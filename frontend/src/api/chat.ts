import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/chat'

const chatApi = {
  // 会话管理
  getSessions() {
    return axios.get(`${API_BASE_URL}/sessions`)
  },
  
  createSession(title = '新会话') {
    return axios.post(`${API_BASE_URL}/sessions`, { title })
  },
  
  getSession(sessionId: string) {
    return axios.get(`${API_BASE_URL}/sessions/${sessionId}`)
  },
  
  updateSession(sessionId: string, updateData: any) {
    return axios.put(`${API_BASE_URL}/sessions/${sessionId}`, updateData)
  },
  
  deleteSession(sessionId: string) {
    return axios.delete(`${API_BASE_URL}/sessions/${sessionId}`)
  },
  
  // 消息管理
  getMessages(sessionId: string) {
    return axios.get(`${API_BASE_URL}/sessions/${sessionId}/messages`)
  },
  
  // 发送普通消息
  sendMessage(chatRequest: any) {
    return axios.post(`${API_BASE_URL}/message`, chatRequest)
  },
  
  // 流式发送消息 - 使用EventSource
  streamMessage(chatRequest: any, onMessage: (data: any) => void, onError?: (error: any) => void) {
    // 使用fetch API处理流式响应
    const requestData = {
      message: chatRequest.message,
      session_id: chatRequest.session_id,
      stream: true
    }
    
    return fetch(`${API_BASE_URL}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestData)
    }).then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is not readable')
      }
      
      const decoder = new TextDecoder()
      let buffer = ''
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          
          // 解析SSE格式的数据
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 保留未完成的行
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim()
              
              if (dataStr === '[DONE]') {
                return
              }
              
              try {
                const data = JSON.parse(dataStr)
                onMessage(data)
              } catch (e) {
                console.error('解析SSE数据失败:', e, '原始数据:', dataStr)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    }).catch(error => {
      if (onError) {
        onError(error)
      } else {
        console.error('流式请求失败:', error)
      }
    })
  },
  
  // 检查API状态
  checkApiStatus() {
    return axios.get(`${API_BASE_URL}/sessions`)
  }
}

export default chatApi