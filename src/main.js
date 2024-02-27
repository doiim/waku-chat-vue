import { createApp } from 'vue'
import App from './App.vue'
import waku from './plugins/vue-waku';
import Chat from 'vue3-beautiful-chat'

createApp(App).use(waku).use(Chat).mount('#app')