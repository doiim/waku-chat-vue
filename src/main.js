import { createApp } from 'vue'
import App from './App.vue'
import waku from './plugins/vue-waku';

createApp(App).use(waku).mount('#app')