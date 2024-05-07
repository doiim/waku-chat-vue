import { createApp } from 'vue'
import App from './App.vue'
import WakuChatVuePlugin from '@doiim/waku-chat-vue-plugin';

createApp(App).use(WakuChatVuePlugin, {
    wakuChannelName: 'my-app-name',
    wakuPeers: [],
    availableRooms: ['General', 'Support'],
    changeNickMode: 'user',
    allowPrivateChat: false,
    userChangeNick: true,
    showSettings: true,
    messageAgeToDownload: (4 * 24 + 7) * 60 * 60 * 1000,
    disconnectDelay:5*1000
}).mount('#app');