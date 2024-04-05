import { createApp } from 'vue'
import App from './App.vue'
import WakuChatVuePlugin from 'waku-chat-vue-plugin';

createApp(App).use(WakuChatVuePlugin, {
    wakuChannelName: 'my-app-name',
    wakuPeers: [],
    availableRooms: ['Trollbox', 'Support'],
    changeNickMode: 'application',
    allowPrivateChat: false,
}).mount('#app');