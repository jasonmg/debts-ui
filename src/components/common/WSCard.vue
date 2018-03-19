<template lang="html">
  <div class="wscard-container" :class="{'wscard-expand': cardExpand}">
      <div class="wscard-header">
          <span @click="toggleWSCard" class="wscard-tr"><i class="el-icon-caret-bottom"></i></span>
          <span class="message-total-count">总的消息数: {{ messageList.length - 1 }}</span>
          <el-button type="text" :disabled="connectStatus" @click="reconnect">重连</el-button>
          <el-button type="text" :disabled="!connectStatus" @click="disconnect">停止</el-button>
      </div>
      <div class="wscard-content" v-html="renderMessage"></div>
      <div class="wscard-footer"></div>
  </div>
</template>

<script>
import Stomp from 'stompjs'

import { WSHostURL } from '../../constants/fetch.const'

export default {
    name: 'WSCard',
    data() {
        return {
            messageList: ['dt-bus WebSocket Monitor.'],
            client: null,
            WS: null,
            wsUrl: 'ws://10.0.31.145:8080/endpointSang/685/rc8q8xua/websocket',
            topic: '10.0.21.176_3306_dtmart_dm_zb',
            connectStatus: false,
            cardExpand: false
        }
    },
    created() {
        this.openWSInstance('ws://chat.workerman.net:7272/')
        // let socket = new SockJS('//10.0.72.79:8080/my-websocket');
        // socket.onmessage = function(data) {
        //     console.log('errr', data)
        // }
        // this.client = Stomp.over(socket);
        // console.log('connect before', this.client)
        // this.client.connect({}, this.onConnect)
        //
        // setTimeout(() => {
        //     this.client.send("/tail", {}, JSON.stringify({'topic': this.topic}));
        // }, 1000);
        //
        this.$bus.$on('changeTopic', function(value) {
            // this.topic = value
            this.wsUrl = value
            this.cardExpand = true
            this.messageList = ['dt-bus WebSocket Monitor.']
        }.bind(this))
    },
    computed: {
        renderMessage: function() {
            return this.messageList.map(li => `<p>${li}</p>`).reverse().join('')
        }
    },
    watch: {
        topic: function(newTopic) {
            this.topic = newTopic
            this.client.connect({}, this.onConnect)
            setTimeout(() => {
                this.client.send("/tail", {}, JSON.stringify({'topic': this.topic}));
            }, 1000);
        },
        wsUrl: function(url) {
            this.WS.close()
            this.$notify({
                message: `正在尝试连接远程的另一个WebSocket服务器`,
                type: 'info'
            })
            this.openWSInstance(url)
        }
    },
    methods: {
        openWSInstance(url) {
            this.WS = new WebSocket(url)
            this.WS.addEventListener('open', this.open)
            this.WS.addEventListener('message', this.message)
            this.WS.addEventListener('close', this.close)
            this.WS.addEventListener('error', this.error)
        },
        open(evt) {
            this.$notify({
                message: `已成功连接至远程WebSocket服务器！`,
                type: 'success'
            })
            this.connectStatus = true
        },
        message(evt) {
            this.messageList.push(evt.data)
        },
        error(err) {
            this.connectStatus = false
            this.$notify({
                message: `WebSocket出现异常，连接失败!`,
                type: 'error'
            })
        },
        onConnect(frame) {
            console.log('233frame:', frame)
            let path = `/topic/getResponse/${this.topic}`
            this.client.subscribe(path, this.responseCallback, this.onFailed)
        },
        responseCallback(frame) {
            this.$notify({
                message: `已成功订阅频道：${this.topic}`,
                type: 'success'
            })
            this.messageList.push(frame)
        },
        onFailed(error) {
            this.$notify({
                message: `频道${this.topic}出现异常，已停止订阅!`,
                type: 'error'
            })
        },
        close(evt) {
            if (!this.connectStatus) return
            this.$notify({
                title: '远程的WebSocket已被关闭',
                message: `状态码：${evt.code}\n关闭原因：${evt.reason}`,
                type: 'warning'
            })
            this.WS = null
            this.connectStatus = false
        },
        reconnect() {
            if (!this.connectStatus) {
                this.openWSInstance(this.wsUrl)
            } else {
                this.$notify({
                    message: `WebSocket连接状态异常，尝试手动刷新页面！`,
                    type: 'error'
                })
            }
            // this.client.connect({}, this.onConnect)
            // setTimeout(() => {
            //     this.client.send("/tail", {}, JSON.stringify({'topic': this.topic}));
            // }, 1000);
        },
        disconnect() {
            this.$notify({
                message: `WebSocket已断开连接!`,
                type: 'info'
            })
            this.WS.close()
            console.log('discount', this.WS)
            this.WS = null
            this.connectStatus = false
            // this.client.send("/disconnect", {}, JSON.stringify({'topic': this.topic}));
            //
            // if (this.client != null) {
            //     setTimeout(function () {
            //         this.client.disconnect();
            //     }, 2000);
            // }
        },
        toggleWSCard() {
            this.cardExpand = !this.cardExpand
        }
    }
}
</script>

<style lang="less">
.wscard-container {
    position: fixed;
    z-index: 999;
    right: 0;
    bottom: 0;
    height: 20px;
    width: 30px;
    background-color: #fff;
    color: #666;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid #C9A1A1;
    border-radius: 2px;
    transition: height 1s ease, width 2s ease 1s;
    .wscard-header, .wscard-footer {
        padding-right: 50px;
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: space-between;
        background-color: #537D54;
        color: #fff;
        flex: 0 1 50px;
        .wscard-tr {
            position: absolute;
            top: -8px;
            right: 0;
            color: rgb(51,44,60);
            font-size: 26px;
        }
    }
    .wscard-footer {
        height: 30px;
        flex: 0 1 30px;
    }
    .wscard-content {
        height: calc(~"100% - 100px");
        padding: 5px;
        overflow-y: auto;
    }
    .message-total-count {
        line-height: 3em;
    }
}
.wscard-expand {
    width: 30vw;
    height: 450px;
}
</style>
