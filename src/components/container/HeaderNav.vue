<template>
    <header>
            <div class="head-left">
                <h1>数据总线dtbus</h1>
                <router-link to="/man/home">主页</router-link>
                <router-link to="/man/dtmgr">数据管理</router-link>
                <!-- <router-link to="/man/dtapi">数据分析</router-link> -->
                <strong>欢迎访问，{{ getUsername }}用户</strong>
            </div>
    </header>
</template>

<script>
    export default {
        computed: {
            getUsername () {
                let userId =localStorage.getItem('user')
                if(userId === ""){
                    this.$router.push('/');
                }
                return userId
            }
        }
    }
</script>

<style>
    .head-left {
        text-align: left;
        border-bottom: 1px solid #666;
        margin-bottom: 20px;
    }
    .head-left h1 {
        display: inline-block;
    }
    header strong {
        float: right;
    }
    header a {
        padding-left: 20px;
    }
    .router-link-active {
        color: red;
    }
</style>
