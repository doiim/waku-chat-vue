<template>
  <div :class="['app', theme]">
    <div class="configuration">
      <h1>Vue Waku Tester</h1>
      <p>
        This is a simple page test with the ability to change your name and id.
      </p>

      <div class="input-container">
        <label for="idInput">ID:</label>
        <div>
          <input type="text" v-model="idInput" id="idInput" />
          <button @click="changeId">Change ID</button>
        </div>
      </div>

      <div class="input-container">
        <label for="nameInput">Name:</label>
        <div>
          <input
            type="text"
            v-model="nameInput"
            id="nameInput"
            placeholder="Type your name"
          />
          <button @click="changeName">Change Name</button>
        </div>
      </div>

      <div class="input-container">
        <label for="typeInput">Type:</label>
        <div>
          <input
            type="text"
            v-model="typeInput"
            id="typeInput"
            placeholder="Type your user type"
          />
          <button @click="changeType">Change Type</button>
        </div>
      </div>

      <div class="input-container">
        <label for="messageInput">Message:</label>
        <div>
          <input
            type="text"
            :disabled="true"
            v-model="message"
            id="messageInput"
            placeholder="Messages that comes from chat"
          />
        </div>
      </div>

      <button class="theme-button" @click="toggleTheme">Toggle Theme</button>
      <button class="switch-button" @click="switchChat" :disabled="loadingChat">
        {{ chatOpened ? "Close Chat" : "Open Chat" }}
      </button>

      <div class="position-config">
        <div>
          <h2>Chat Position</h2>
          <div class="pos-config-group">
            <div class="pos-buttons">
              <button
                :class="{ active: chatPosTopBottom === 'top' }"
                @click="setChatPos('top')"
              >
                Top
              </button>
              <div>
                <button
                  :class="{ active: chatPosLeftRight === 'left' }"
                  @click="setChatPos('left')"
                >
                  Left
                </button>
                <button
                  :class="{ active: chatPosLeftRight === 'right' }"
                  @click="setChatPos('right')"
                >
                  Right
                </button>
              </div>
              <button
                :class="{ active: chatPosTopBottom === 'bottom' }"
                @click="setChatPos('bottom')"
              >
                Bottom
              </button>
            </div>
          </div>
          <div class="pos-config-group">
            <div class="pos-buttons">
              <label>Vertical Position: {{ chatPosValue.vertical }}%</label>
              <input
                type="range"
                min="0"
                max="100"
                v-model="chatPosValue.vertical"
              />
              <label>Horizontal Position: {{ chatPosValue.horizontal }}%</label>
              <input
                type="range"
                min="0"
                max="100"
                v-model="chatPosValue.horizontal"
              />
            </div>
          </div>
        </div>
        <hr />
        <div>
          <h2>Balloon Position</h2>
          <div class="pos-config-group">
            <div class="pos-buttons">
              <button
                :class="{ active: balloonPosTopBottom === 'top' }"
                @click="setBalloonPos('top')"
              >
                Top
              </button>
              <div>
                <button
                  :class="{ active: balloonPosLeftRight === 'left' }"
                  @click="setBalloonPos('left')"
                >
                  Left
                </button>
                <button
                  :class="{ active: balloonPosLeftRight === 'right' }"
                  @click="setBalloonPos('right')"
                >
                  Right
                </button>
              </div>
              <button
                :class="{ active: balloonPosTopBottom === 'bottom' }"
                @click="setBalloonPos('bottom')"
              >
                Bottom
              </button>
            </div>
          </div>
          <div class="pos-config-group">
            <div class="pos-buttons">
              <label>Vertical Position: {{ balloonPosValue.vertical }}%</label>
              <input
                type="range"
                min="0"
                max="100"
                v-model="balloonPosValue.vertical"
              />
              <label
                >Horizontal Position: {{ balloonPosValue.horizontal }}%</label
              >
              <input
                type="range"
                min="0"
                max="100"
                v-model="balloonPosValue.horizontal"
              />
            </div>
          </div>
        </div>
      </div>

      <WakuChatVuePlugin
        ref="wakuChatRef"
        :externalUserId="externalId"
        :externalUserName="externalName"
        :externalUserType="externalType"
        :onOpen="onOpen"
        :onClose="onClose"
        :onConnect="onConnect"
        :onDisconnect="onDisconnect"
        :theme="chatTheme"
        :chatPos="computedChatPos"
        :balloonPos="computedBalloonPos"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
const wakuChatRef = ref<any>(null);
const chatOpened = ref(false);
const loadingChat = ref(false);

const idInput = ref("thisIsMyIdDefinedByMyApplication");
const nameInput = ref("");
const typeInput = ref("");

const externalId = ref("thisIsMyIdDefinedByMyApplication");
const externalName = ref("");
const externalType = ref("");

const message = ref("");
const chatPosValue = ref({ vertical: 1, horizontal: 1 });
const balloonPosValue = ref({ vertical: 3, horizontal: 2 });

const theme = ref("light");
const chatTheme = ref("light");

const chatPosTopBottom = ref("bottom");
const chatPosLeftRight = ref("right");

const balloonPosTopBottom = ref("bottom");
const balloonPosLeftRight = ref("right");

const onConnect = () => {
  message.value = "Connected to the Chat";
};

const onDisconnect = () => {
  message.value = "Disconnected to the Chat";
};

const onOpen = () => {
  message.value = "Opened Chat";
  chatOpened.value = true;
  setTimeout(() => {
    loadingChat.value = false;
  }, 0);
};

const onClose = () => {
  message.value = "Closed Chat";
  chatOpened.value = false;
  setTimeout(() => {
    loadingChat.value = false;
  }, 0);
};

const changeId = () => {
  externalId.value = idInput.value;
};

const changeName = () => {
  externalName.value = nameInput.value;
};

const changeType = () => {
  externalType.value = typeInput.value;
};

const toggleTheme = () => {
  if (theme.value === "light") {
    theme.value = "dark";
    chatTheme.value = "dark";
  } else {
    theme.value = "light";
    chatTheme.value = "light";
  }
};

const switchChat = () => {
  if (wakuChatRef.value && chatOpened.value) {
    wakuChatRef.value.closeChat();
  } else if (wakuChatRef.value && !chatOpened.value) {
    wakuChatRef.value.openChat();
  }
  loadingChat.value = true;
};

const setChatPos = (position: string) => {
  if (position === "top" || position === "bottom") {
    chatPosTopBottom.value = position;
  } else if (position === "left" || position === "right") {
    chatPosLeftRight.value = position;
  }
};

const setBalloonPos = (position: string) => {
  if (position === "top" || position === "bottom") {
    balloonPosTopBottom.value = position;
  } else if (position === "left" || position === "right") {
    balloonPosLeftRight.value = position;
  }
};

const computedChatPos = computed(() => ({
  [chatPosTopBottom.value]: `${chatPosValue.value.vertical}%`,
  [chatPosLeftRight.value]: `${chatPosValue.value.horizontal}%`,
}));

const computedBalloonPos = computed(() => ({
  [balloonPosTopBottom.value]: `${balloonPosValue.value.vertical}%`,
  [balloonPosLeftRight.value]: `${balloonPosValue.value.horizontal}%`,
}));
</script>

<style scoped>
.app {
  height: 100%;
}

.configuration {
  padding-top: 100px;
  max-width: 600px;
  margin: 0 auto;
}

h1,
p,
label {
  transition: color 0.3s ease;
}

input[type="text"],
button {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.light {
  background-color: #f2f2f2;
  color: rgba(31, 41, 55, 1);
}

.light input[type="text"] {
  background-color: #fff;
  color: #000;
}

.light button {
  background-color: #007bff;
  color: white;
}

.light button:hover {
  background-color: #0056b3;
}

.dark {
  background-color: #1f2937;
  color: rgba(209, 213, 219, 1);
}

.dark input[type="text"] {
  background-color: #374151;
  color: #d1d5db;
}

.dark button {
  background-color: #2563eb;
  color: white;
}

.dark button:hover {
  background-color: #1d4ed8;
}

.input-container {
  margin-bottom: 20px;
}

.input-container div {
  width: 100%;
  display: flex;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
}

input[type="range"] {
  width: 100%;
  margin: 5px 0;
}

button {
  height: auto;
  margin-left: 16px;
  width: 200px;
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.theme-button {
  width: 68%;
  margin-left: 0px;
}

.switch-button {
  width: 28%;
  margin-left: 4%;
}

.switch-button:disabled {
  background-color: gray;
  pointer-events: none;
}

.switch-button:disabled:hover {
  background-color: gray;
}

.position-config {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.pos-config-group {
  margin-bottom: 20px;
}

.pos-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pos-buttons button {
  margin: 2px 5px;
  width: fit-content;
}

.pos-buttons button.active {
  background-color: #0056b3;
  color: white;
}

.pos-buttons div {
  display: flex;
  align-items: center;
}

.pos-buttons span {
  margin: 0 5px;
  min-width: 30px;
  text-align: center;
}
</style>
