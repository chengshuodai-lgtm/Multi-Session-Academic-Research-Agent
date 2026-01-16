<template>
  <el-dialog
    v-model="visible"
    title="确认删除"
    width="400px"
    @close="handleClose"
  >
    <p>确定要删除这个会话吗？此操作不可撤销。</p>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="danger" @click="handleConfirm" :loading="loading">
          删除
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/stores/chat.ts'

const chatStore = useChatStore()

const visible = ref(false)
const loading = ref(false)

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'deleted'])

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

async function handleConfirm() {
  try {
    loading.value = true
    await chatStore.deleteSession(chatStore.currentSessionId)
    visible.value = false
    ElMessage.success('会话删除成功')
    emit('deleted')
  } catch (error) {
    ElMessage.error('删除会话失败')
  } finally {
    loading.value = false
  }
}

function handleClose() {
  // 关闭时的清理操作
}
</script>