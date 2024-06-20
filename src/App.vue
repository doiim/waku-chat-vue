<template>
  <div :class="['app', theme]">
    <div class="configuration">
      <h1>Vue Waku Tester</h1>
      <p>This is a simple page test with the ability to change your name and id.</p>

      <div class="input-container">
        <label for="idInput">ID:</label>
        <div>
          <input type="text" v-model="idInput" id="idInput">
          <button @click="changeId">Change ID</button>
        </div>
      </div>

      <div class="input-container">
        <label for="nameInput">Name:</label>
        <div>
          <input type="text" v-model="nameInput" id="nameInput" placeholder="Type your name">
          <button @click="changeName">Change Name</button>
        </div>
      </div>

      <div class="input-container">
        <label for="messageInput">Message:</label>
        <div>
          <input type="text" :disabled="true" v-model="message" id="messageInput"
            placeholder="Messages that comes from chat">
        </div>
      </div>

      <button class="theme-button" @click="toggleTheme">Toggle Theme</button>

      <WakuChatVuePlugin :externalUserId="externalId" :externalUserName="externalName" :onOpen="onOpen"
        :onClose="onClose" :onConnect="onConnect" :onDisconnect="onDisconnect" :theme="chatTheme" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const idInput = ref('thisIsMyIdDefinedByMyApplication');
const nameInput = ref('');

const externalId = ref('thisIsMyIdDefinedByMyApplication');
const externalName = ref('');

const message = ref('');

const theme = ref('light');
const chatTheme = ref('light');

const onConnect = () => {
  message.value = 'Connected to the Chat'
};

const onDisconnect = () => {
  message.value = 'Disconnected to the Chat'
};

const onOpen = () => {
  message.value = 'Opened Chat'
};

const onClose = () => {
  message.value = 'Closed Chat'
};

const changeId = () => {
  externalId.value = idInput.value
};

const changeName = () => {
  externalName.value = nameInput.value
};

const toggleTheme = () => {
  if (theme.value === 'light') {
    theme.value = 'dark';
    chatTheme.value = 'dark';
  } else {
    theme.value = 'light';
    chatTheme.value = 'light';
  }
};
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
  width: 100%;
  margin-left: 0px;
}
</style>