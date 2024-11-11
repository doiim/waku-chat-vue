import { createApp } from "vue";
import App from "./App.vue";
import WakuChatVuePlugin from "@doiim/waku-chat-vue-plugin";

createApp(App)
  .use(WakuChatVuePlugin, {
    wakuChannelName: "my-app-name",
    wakuPeers: [],
    availableRooms: ["General", "Support"],
    changeNickMode: "user",
    allowPrivateChat: false,
    userChangeNick: true,
    showSettings: true,
    disconnectDelay: 5 * 60 * 1000,
    styleConfig: {
      colors: {
        light: {
          primary: "rgba(41, 79, 204, 1)",
        },
        dark: {
          primary: "rgba(135, 79, 204, 1)",
        },
      },
    },
    // example of call
    // messageAgeToDownload: (4 * 24 + 7) * 60 * 60 * 1000
  })
  .mount("#app");
