<template>
  <el-dialog
    v-model="visible"
    title="编辑会话标题"
    width="500px"
    @close="handleClose"
  >
    <el-input
      v-model="newTitle"
      placeholder="输入新标题"
      @keyup.enter="handleSave"
      ref="inputRef"
    />
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/stores/chat.ts'

const chatStore = useChatStore()

const visible = ref(false)
const newTitle = ref('')
const loading = ref(false)
const inputRef = ref()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    newTitle.value = props.currentTitle
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

async function handleSave() {
  if (!newTitle.value.trim()) {
    ElMessage.warning('标题不能为空')
    return
  }

  try {
    loading.value = true
    await chatStore.updateSessionTitle(chatStore.currentSessionId, newTitle.value)
    visible.value = false
    ElMessage.success('标题更新成功')
    emit('saved')
  } catch (error) {
    ElMessage.error('更新标题失败')
  } finally {
    loading.value = false
  }
}

function handleClose() {
  newTitle.value = ''
}
</script>