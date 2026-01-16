export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  session_id: string
  role: string
  content: string
  tool_calls?: string | null
  tool_results?: string | null
  created_at: string
}

export interface ChatRequest {
  message: string
  session_id?: string
  stream?: boolean
}

export interface ChatResponse {
  session_id: string
  message: ChatMessage
  is_complete: boolean
}

export interface ChatStreamChunk {
  content: string
  is_final: boolean
  tool_calls?: any[]
}