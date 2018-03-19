<template>
    <div class="container">
        <header-nav></header-nav>
        <router-view></router-view>
    </div>
</template>

<script>
    import headerNav from './HeaderNav.vue'
    export default {
        components: {
            headerNav
        }
    }
</script>

<style>
    .container {
      width: 100%;
    }
    header > h1 {
        display: inline-block;
    }
    header > a {
        margin: 0 10px;
        color: #000;
        text-decoration: none;
    }
</style>
