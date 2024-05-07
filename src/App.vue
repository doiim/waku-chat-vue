<template>
  <div id="app">
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
      <label for="nameInput">Message:</label>
      <div>
        <input type="text" :disabled="true" v-model="message" id="nameInput"
          placeholder="Messages that comes from chat">
      </div>

    </div>

    <WakuChatVuePlugin :externalUserId="externalId" :externalUserName="externalName" :onOpen="onOpen" :onClose="onClose"
      :onConnect="onConnect" :onDisconnect="onDisconnect" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const idInput = ref('thisIsMyIdDefinedByMyApplication');
const nameInput = ref('');

const externalId = ref('thisIsMyIdDefinedByMyApplication');
const externalName = ref('');

const message = ref('');


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
</script>

<style scoped>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f2f2f2;
}

#app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: rgba(31, 41, 55, 1);
}

p {
  color: rgba(107, 114, 128, 1);
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
  color: rgba(156, 163, 175, 1);
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
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>