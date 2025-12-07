<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🎵 Smusic</h1>
      <p class="subtitle">网易云音乐播放器</p>

      <div class="tabs">
        <button
          :class="['tab', { active: loginType === 'phone' }]"
          @click="loginType = 'phone'"
        >
          手机号登录
        </button>
        <button
          :class="['tab', { active: loginType === 'email' }]"
          @click="loginType = 'email'"
        >
          邮箱登录
        </button>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="loginType === 'phone'" class="form-group">
          <label>手机号</label>
          <input
            v-model="phone"
            type="tel"
            placeholder="请输入手机号"
            required
          />
        </div>

        <div v-else class="form-group">
          <label>邮箱</label>
          <input
            v-model="email"
            type="email"
            placeholder="请输入邮箱"
            required
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          ⚠️ {{ error }}
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="tips">
        <p>💡 提示：使用网易云音乐账号登录</p>
        <p>🔒 密码仅用于登录验证，不会被保存</p>
      </div>

      <div class="skip-login">
        <router-link to="/" class="skip-btn">跳过登录，继续使用</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginType = ref('phone')
const phone = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!password.value) {
    error.value = '请输入密码'
    return
  }

  loading.value = true
  error.value = ''

  let success = false
  if (loginType.value === 'phone') {
    if (!phone.value) {
      error.value = '请输入手机号'
      loading.value = false
      return
    }
    success = await userStore.loginPhone(phone.value, password.value)
  } else {
    if (!email.value) {
      error.value = '请输入邮箱'
      loading.value = false
      return
    }
    success = await userStore.loginEmail(email.value, password.value)
  }

  loading.value = false

  if (success) {
    router.push('/')
  } else {
    error.value = userStore.error || '登录失败，请检查账号密码'
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  text-align: center;
  font-size: 32px;
  margin: 0 0 10px 0;
  color: #333;
}

.subtitle {
  text-align: center;
  color: #999;
  margin: 0 0 30px 0;
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  transition: all 0.3s;
}

.tab:hover {
  background: #e8e8e8;
}

.tab.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tips {
  background: #f0f4ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.tips p {
  margin: 5px 0;
  font-size: 13px;
  color: #666;
}

.skip-login {
  text-align: center;
}

.skip-btn {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.skip-btn:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>
