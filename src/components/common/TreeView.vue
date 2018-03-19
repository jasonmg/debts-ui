<template>
    <li>
        <div @click='toggle'><span v-if='hasLeaves'>[{{open ? '-' : '+'}}]</span>{{model.text}}</div>
        <ul>
            <treeview v-for='model in model.children' :key='model.text' :model='model' v-show='open'></treeview>
        </ul>
    </li>
</template>

<script>
    export default {
        name: 'treeview',
        props: {
            model: {
                type: Object
            }
        },
        data() {
            return {
                open: false
            }
        },
        methods: {
            toggle:function(){
                this.open=!this.open;
            }
        },
        computed:{
            hasLeaves: function() {
                return this.model.children && this.model.children.length
            }
        }
    }
</script>
<style scoped>
    ul,li{
        list-style-type: none;
    }
</style>
