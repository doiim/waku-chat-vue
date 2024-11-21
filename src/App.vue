<template>
  <div :class="['app', theme]">
    <div class="configuration">
      <h1>Vue Waku Tester</h1>
      <p>
        This is a simple page test with the ability to change your name and id.
      </p>
      <hr class="split-section">
      <h3>User Settings:</h3><br/>

      <div class="input-container">
        <label for="idInput">ID:</label>
        <div>
          <input type="text" v-model="idInput" id="idInput" />
          <button @click="changeId" style="margin-left: 16px">Change ID</button>
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
          <button @click="changeName" style="margin-left: 16px">Change Name</button>
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
          <button @click="changeType" style="margin-left: 16px">Change Type</button>
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

      <hr class="split-section">
      <h3>History Settings:</h3><br/>

      <div class="behaviour-controls">
   

        <div class="toggle-container">
          <label class="toggle-label">
            Load messages on scroll
            <div class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="fetchMsgsOnScroll"
                @change="updateFetchMsgsOnScroll"
              >
              <span class="slider"></span>
            </div>
          </label>
        </div>

        <div class="flex">
          <div class="input-container">
            <label for="fetchLimitInput">Messages {{fetchMsgsOnScroll ? 'per fetch' : 'to fetch'}}:</label>
            <div>
              <input
                type="number"
                v-model="fetchLimitInput"
                id="fetchLimitInput"
                :placeholder="fetchMsgsOnScroll ? '10' : '100'"
              />
            </div>
          </div>
          <div class="input-container">
            <label for="maxAttemptsInput">Max {{fetchMsgsOnScroll ? 'fetch attempts' : 'attempts'}}:</label>
            <div>
              <input
                type="number"
                v-model="maxAttemptsInput"
                id="maxAttemptsInput"
                placeholder="3"
              />
            </div>
          </div>
          <div v-if="fetchMsgsOnScroll" class="input-container">
            <label for="fetchTotalLimitInput">Max total messages:</label>
            <div>
              <input
                type="text"
                v-model="fetchTotalLimitInput"
                id="fetchTotalLimitInput"
                placeholder="0 = Full History"
              />
            </div>
          </div>
          <div v-if="!fetchMsgsOnScroll"  class="input-container message-age-selector">
            <label for="messageAgeSelect">Time Range:</label>
            <div>
              <select 
                v-model="selectedMessageAge" 
                id="messageAgeSelect"
                @change="updateMessageAge"
              >
                <option value="1">Last 24 hours</option>
                <option value="3">Last 3 days</option>
                <option value="7">Last 7 days</option>
                <option value="14">Last 2 weeks</option>
                <option value="30">Last 30 days</option>
                <option value="custom">Custom...</option>
              </select>
            </div>
          </div>
          <div v-if="!fetchMsgsOnScroll && selectedMessageAge === 'custom'" class="input-container" >
            <label for="customDays">Nº of days:</label>
            <div>
              <input
                type="number"
                v-model="customDays"
                id="customDays"
                min="1"
                max="365"
                @change="updateMessageAge"
              />
            </div>
          </div>
        </div>
      </div>
      <hr class="split-section">
      <h3>External Events:</h3><br/>
      <div class="flex">
        <button class="third-size button" @click="switchChat" :disabled="loadingChat"
          title="Open or close the chat using your own UI">
          {{ chatOpened ? "Close Chat" : "Open Chat" }}
        </button>
        <button class="third-size button" @click="loadChatOnBackground" :disabled="loadingChat"
          title="Call it in vue's final lyfecycle activated()">
          Load on background
        </button>
        <button class="third-size button black" @click="switchDebug" :disabled="loadingChat"
          title="Console messages will be printed on devmode">
          {{ debugMode ? "Turn Off" : "Turn On" }} Debugger
        </button>
      </div>
      <hr class="split-section">
      <h3>Customizations:</h3><br/>
      <button class="full-size button" @click="toggleTheme">Toggle Theme</button>

      <div class="position-config">
        <div>
          <div class="pos-config-group">
            <h2>Chat Position</h2>
            <h2>Animation</h2>
          </div>
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
            <div class="pos-buttons">
              <button
                :class="{ active: animation === 'up' }"
                @click="setAnimation('up')"
              >
                Up
              </button>
              <div>
                <button
                  :class="{ active: animation === 'left' }"
                  @click="setAnimation('left')"
                >
                  Left
                </button>
                <button
                  :class="{ active: animation === 'right' }"
                  @click="setAnimation('right')"
                >
                  Right
                </button>
              </div>
              <button
                :class="{ active: animation === 'down' }"
                @click="setAnimation('down')"
              >
                Down
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
            <div class="pos-buttons">
              <label>Width Expression: </label>
              <input
                class="size-input"
                type="text"
                v-model="widthInput"
                id="widthInput"
                placeholder="360px"
              />
              <label>Height Expression: </label>
              <input
                class="size-input"
                type="text"
                v-model="heightInput"
                id="heightInput"
                placeholder="576px"
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
        :debugMode="debugMode"
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
        :animationDirection="animation"
        :chatSize="{ width: widthInput, height: heightInput }"
        :fetchMsgsOnScroll="fetchMsgsOnScroll"
        :fetchMaxAttempts="parseInt(maxAttemptsInput)"
        :fetchTotalLimit="parseInt(fetchTotalLimitInput)"
        :fetchLimit="parseInt(fetchLimitInput)"
        :messageAgeToDownload="messageAge"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
const wakuChatRef = ref<any>(null);
const debugMode = ref(false);
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

const widthInput = ref("360px");
const heightInput = ref("576px");

const animation = ref("up");


const fetchMsgsOnScroll = ref(true);
const maxAttemptsInput = ref();
const fetchLimitInput = ref();
const fetchTotalLimitInput = ref();

const selectedMessageAge = ref('1');
const customDays = ref(1);
const messageAge = ref<number| undefined>(undefined);

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

const loadChatOnBackground = () => {
  wakuChatRef.value.connectChat();
};

const switchChat = () => {
  if (wakuChatRef.value && chatOpened.value) {
    wakuChatRef.value.closeChat();
  } else if (wakuChatRef.value && !chatOpened.value) {
    wakuChatRef.value.openChat();
  }
  loadingChat.value = true;
};

const switchDebug = () => {
  if (wakuChatRef.value) {
    debugMode.value = !debugMode.value;
  }
};

const setAnimation = (position: string) => {
  animation.value = position;
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

const updateFetchMsgsOnScroll = async () => {
  await nextTick();
  if(fetchMsgsOnScroll.value == false) {
    updateMessageAge();
  }else{
    messageAge.value = undefined;
  }
};

const updateMessageAge = () => {
  const days = selectedMessageAge.value === 'custom' 
    ? customDays.value 
    : parseInt(selectedMessageAge.value);
  const milliseconds = days * 24 * 60 * 60 * 1000;
  messageAge.value = milliseconds;
};
</script>

<style scoped>

.app {
  padding-bottom: 100px;
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

hr.split-section {
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0));
    padding-top: 2px;
    margin-top: 20px;
    margin-bottom: 20px;
}

input[type="text"],
button {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.flex {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.flex .input-container {
  flex: 1;
}

.full-size {
  width: 100%;
}
.half-size {
  width: 50%;
}
.third-size {
  width: 33%;
}

.light {
  background-color: #f2f2f2;
  color: rgba(31, 41, 55, 1);
}

.light input[type="text"],
.light input[type="number"] {
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

.dark input[type="text"],
.dark input[type="number"] {
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


.light button:disabled,
.dark button:disabled  {
  filter: grayscale();
  pointer-events: none;
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

input[type="text"],
input[type="number"] {
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
  width: 200px;
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.position-config {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.pos-config-group {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-around;
}

.pos-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
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

.size-input {
  width: 120px !important;
}

.behaviour-controls {
  margin: 20px 0;
}

.toggle-container {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.toggle-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-left: 16px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.light input:checked + .slider {
  background-color: #007bff;
}

.dark input:checked + .slider {
  background-color: #2563eb;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.light .slider {
  background-color: #ccc;
}

.dark .slider {
  background-color: #4b5563;
}

.message-age-selector select {
  width: 100%;
  padding: 8px;
  padding-right: 24px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: var(--input-bg-color);
  color: var(--text-color);
  -webkit-appearance: menulist;  /* For Safari */
  -moz-appearance: menulist;     /* For Firefox */
  appearance: menulist;          /* Standard */
}

.light .message-age-selector select {
  --input-bg-color: #fff;
  --text-color: #000;
}

.dark .message-age-selector select {
  --input-bg-color: #374151;
  --text-color: #d1d5db;
}
</style>
