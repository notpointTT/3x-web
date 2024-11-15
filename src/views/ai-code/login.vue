<template>
  <div class="login-container">
    <div class="login-box">
      <h2>财务系统登录</h2>

      <div class="login-type">
        <el-radio-group v-model="loginType">
          <el-radio label="sms">验证码登录</el-radio>
          <el-radio label="password">密码登录</el-radio>
        </el-radio-group>
      </div>

      <div class="input-group">
        <el-input
          v-model="phone"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </div>

      <template v-if="loginType === 'sms'">
        <div class="code-group">
          <el-input
            v-model="smsCode"
            placeholder="请输入验证码"
            maxlength="6"
          />
          <el-button
            :disabled="countdown > 0"
            type="primary"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
          </el-button>
        </div>
      </template>

      <template v-else>
        <div class="input-group">
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </div>
        <div class="captcha-group">
          <el-input
            v-model="captcha"
            placeholder="请输入图形验证码"
            maxlength="4"
          />
          <img
            :src="captchaUrl"
            class="captcha-img"
            alt="验证码"
            @click="refreshCaptcha"
          >
        </div>
      </template>

      <div class="remember-me">
        <el-checkbox v-model="rememberMe">记住登录状态(7天)</el-checkbox>
      </div>

      <el-button type="primary" class="login-button" @click="handleLogin">
        登录
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginType: 'sms', // sms 或 password
      phone: '',
      smsCode: '',
      password: '',
      captcha: '',
      captchaUrl: '',
      countdown: 0,
      timer: null,
      rememberMe: false
    }
  },
  created() {
    // 初始化时获取图形验证码
    this.refreshCaptcha()
    // 恢复上次登录的手机号
    const savedPhone = localStorage.getItem('lastLoginPhone')
    if (savedPhone) {
      this.phone = savedPhone
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    // 刷新图形验证码
    refreshCaptcha() {
      // 这里替换成实际的验证码接口
      this.captchaUrl = `/api/captcha?t=${new Date().getTime()}`
    },

    validatePhone() {
      return /^1[3-9]\d{9}$/.test(this.phone)
    },

    async handleSendCode() {
      if (!this.validatePhone()) {
        this.$message.error('请输入正确的手机号码')
        return
      }

      try {
        // await this.$api.sendVerificationCode(this.phone)
        this.$message.success('验证码已发送')
        this.startCountdown()
      } catch (error) {
        this.$message.error('验证码发送失败')
      }
    },

    startCountdown() {
      this.countdown = 60
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
        } else {
          clearInterval(this.timer)
        }
      }, 1000)
    },

    async handleLogin() {
      if (!this.validatePhone()) {
        this.$message.error('请输入正确的手机号码')
        return
      }

      if (this.loginType === 'sms' && !this.smsCode) {
        this.$message.error('请输入验证码')
        return
      }

      if (this.loginType === 'password') {
        if (!this.password) {
          this.$message.error('请输入密码')
          return
        }
        if (!this.captcha) {
          this.$message.error('请输入图形验证码')
          return
        }
      }

      try {
        const params = {
          phone: this.phone,
          loginType: this.loginType,
          rememberMe: this.rememberMe
        }

        if (this.loginType === 'sms') {
          params.smsCode = this.smsCode
        } else {
          params.password = this.password
          params.captcha = this.captcha
        }

        // const res = await this.$api.login(params)

        // 记住登录状态
        if (this.rememberMe) {
          localStorage.setItem('lastLoginPhone', this.phone)
          // 设置token的过期时间为7天
          // localStorage.setItem('tokenExpireTime', new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
        } else {
          localStorage.removeItem('lastLoginPhone')
          // localStorage.removeItem('tokenExpireTime')
        }

        this.$message.success('登录成功')
        this.$router.push('/')
      } catch (error) {
        this.$message.error('登录失败')
        if (this.loginType === 'password') {
          this.refreshCaptcha()
        }
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* 添加背景图片 */
  background-image: url('../../assets/images/tech-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

/* 添加暗色遮罩，提高文字可读性 */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.login-type {
  text-align: center;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.code-group,
.captcha-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.code-group .el-input,
.captcha-group .el-input {
  flex: 1;
}

.captcha-img {
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
}

.remember-me {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

/* 输入框样式 */
.el-input >>> .el-input__inner {
  height: 40px;
  line-height: 40px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-box {
    margin: 20px;
    padding: 20px;
  }
}
</style>
