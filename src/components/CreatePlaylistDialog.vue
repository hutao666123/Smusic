<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleCancel">
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>创建歌单</h3>
        <button class="close-btn" @click="handleCancel">✕</button>
      </div>

      <div class="dialog-body">
        <div class="form-group">
          <label>歌单名称 (最多15字)</label>
          <input
            ref="nameInput"
            v-model="name"
            type="text"
            placeholder="请输入歌单名称"
            class="form-input"
            maxlength="15"
            @keyup.enter="handleConfirm"
          />
          <div class="char-count">{{ name.length }}/15</div>
        </div>

        <div class="form-group">
          <label>歌单描述（可选）</label>
          <textarea
            v-model="description"
            placeholder="请输入歌单描述"
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="handleCancel">取消</button>
        <button
          class="btn btn-primary"
          @click="handleConfirm"
          :disabled="!name.trim() || creating"
        >
          {{ creating ? '创建中...' : '创建' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { usePlaylistStore } from '../stores/playlist'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

const playlistStore = usePlaylistStore()

const name = ref('')
const description = ref('')
const creating = ref(false)
const nameInput = ref(null)

const handleConfirm = async () => {
  if (!name.value.trim() || creating.value) return

  creating.value = true
  try {
    const newPlaylist = await playlistStore.createPlaylist(
      name.value.trim(),
      description.value.trim()
    )

    if (newPlaylist) {
      emit('success', newPlaylist)
      handleClose()
    }
  } finally {
    creating.value = false
  }
}

const handleCancel = () => {
  handleClose()
}

const handleClose = () => {
  emit('update:visible', false)
  setTimeout(() => {
    name.value = ''
    description.value = ''
  }, 300)
}

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await nextTick()
    nameInput.value?.focus()
  }
})
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-content {
  background: linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:focus,
.form-textarea:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(102, 126, 234, 0.6);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.char-count {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-align: right;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
