<template lang="pug">
    .aside-container
        ul.aside-nav
            li <router-link to="/man/dtmgr/auditmgr/mysql">Mysql鉴权管理</router-link>
            li <router-link to="/man/dtmgr/applymgr">表申请管理</router-link>
            li <router-link to="/man/dtmgr/auditmgr/os">OS鉴权管理</router-link>
            li <router-link to="/man/dtmgr/logmgr">日志管理</router-link>
        <router-view class="aside-container"></router-view>
        //- <ws v-show="showWS"></ws>
</template>
<script type="text/javascript">
    import WSCard from '../common/WSCard.vue'
    export default {
        components: {
            ws: WSCard
        },
        data() {
            return {
                showWS: false
            }
        },
        mounted() {
            const routeArr = this['$route'].path.split('/')
            const page = routeArr[routeArr.length - 1]
            if (page === 'applymgr' || page === 'logmgr') {
                this.showWS = true
            }
        },
        watch: {
            '$route': function(newRoute) {
                const routeArr = newRoute.path.split('/')
                const page = routeArr[routeArr.length - 1]
                if (page === 'applymgr' || page === 'logmgr') {
                    this.showWS = true
                } else {
                    this.showWS = false
                }
            }
        }
    }
</script>
<style>
    .aside-nav {
        float: left;
        width: 100px;
        margin: 0 50px 0 0;
        padding-left: 0;
        list-style-type: none;
    }
    .aside-nav a {
        display: block;
        padding: 4px 0 5px;
        color: #555;
        text-align: left;
        text-decoration: none;
    }
    .aside-nav .router-link-active {
        color: #fff;
        background-color: orange;
    }
    .aside-container {
        float: left;
    }
</style>
