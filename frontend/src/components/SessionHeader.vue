<template>
  <div class="session-header">
    <div class="session-title">
      <h2>{{ title }}</h2>
      <el-button type="text" @click="$emit('edit')" title="编辑标题">
        <el-icon><Edit /></el-icon>
      </el-button>
    </div>
    <div class="session-actions">
      <el-button type="text" @click="$emit('refresh')" title="刷新会话">
        <el-icon><Refresh /></el-icon>
      </el-button>
      <el-button type="text" @click="$emit('delete')" title="删除会话" class="btn-danger">
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Edit, Refresh, Delete } from '@element-plus/icons-vue'

defineProps({
  title: {
    type: String,
    default: '会话标题'
  }
})

defineEmits(['edit', 'refresh', 'delete'])
</script>

<style scoped>
.session-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
}

.session-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.session-title h2 {
  font-size: 1.6rem;
  color: #333;
  margin: 0;
}

.session-actions {
  display: flex;
  gap: 10px;
}

.btn-danger :deep(.el-icon) {
  color: #f56c6c;
}

.btn-danger:hover :deep(.el-icon) {
  color: #c45656;
}
</style>