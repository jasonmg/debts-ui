<template>
  <div class="box">
    <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-width="100px" class="form-box">
      <el-form-item label="用户名" prop="userId">
        <el-input v-model="loginForm.userId" placeholder="请输入用户名" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="userPwd">
        <el-input type="password" v-model="loginForm.userPwd" placeholder="请输入对应的密码" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin" @keyup.enter.native="handleLogin">登录</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { loginUrl, userAdd } from '../../constants/fetch.const'
import { msgList } from '../../constants/msg.const'
export default {
  data() {
    return {
      loginForm: {
        userId: '',
        userName: '',
        userPwd: '',
      },
      loginRules: {
        userId: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        userPwd: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    handleLogin(event) {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
//          store.state.username = this.loginForm.userId;
          this.createLoading=true;

          let resource = this.$resource(loginUrl);
          resource.save(JSON.stringify(this.loginForm))
                  .then(response => {
                    this.createLoading=false;
                    let errCode = parseInt(response.data.code)
                    if (errCode) {
                        this.$message.error(response.data.errmsg);
                    } else {
                        localStorage.setItem('user', response.data.data.userId)
                        this.$router.push('man/home');
                    }
                  })
                  .catch(response => {
                      this.createLoading=false;
                      this.$message.error(msgList.SYSTEM_ERROR);
                  });

        } else {
          return false;
        }
      });
    },
    handleReset() {
      this.$refs.loginForm.resetFields();
    }
  }
}
</script>

<style>
.form-box {
  width: 500px;
  margin-top: 100px;
  margin-right: auto;
  margin-left: auto;
}
</style>
