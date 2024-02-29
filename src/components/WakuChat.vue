<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";
import { Message } from "../types/ChatTypes";
import { initialization, sendMessage, participants, room, messageList, isConnected, changeRoom, myInfo } from "../components/WakuLogic"

const isChatOpen = ref<boolean>(false);
const messageFiltered = ref<Message[]>([]);
const messageInput = ref<string>('');

onMounted(initialization);

const openChat = () => {
  // called when the user clicks on the fab button to open the chat
  if (!isConnected) return
  isChatOpen.value = true
}

const closeChat = () => {
  isChatOpen.value = false
}

// const like = (msgId: string) => {
//   const msgList = [...messageList.value]
//   const m = msgList.findIndex((m) => m.id === msgId)
//   var msg = msgList[m]
//   msg.liked = !msg.liked
//   msgList[m] = msg
//   messageList.value = (msgList)
// }

const handleSendMessage = () => {
  sendMessage({ text: messageInput.value }, 'text')
  messageInput.value = ''
}

const getUserName = (userId: string) => {
  let name = 'All'
  participants.value.forEach(participant => {
    if (participant.id === userId)
      name = participant.name
  });
  return name
}

watchEffect(() => {
  messageFiltered.value = messageList.value.filter(message => {
    return message.room === room.value;
  })
});

</script>

<template>
  <div v-if="isConnected">
    <div v-if="isChatOpen" class="chat-container" :class="{ 'open': isChatOpen }">
      <div class="chat-header">
        <div class="title">{{ getUserName(room.split(' ')[0]) + ' room' }}</div>
        <button @click="changeRoom('All', $event)" class="back-button">
          back to all
        </button>
        <button @click="closeChat" class="minimize-button">-</button>
      </div>
      <div class="chat-body">
        <div v-for="message in messageFiltered" :key="message.id" class="message-container">
          <div :class="{ 'own-message': message.author.id === myInfo.id }" class="message">
            <div class="message-info">
              <span class="user-name">
                <button @click="changeRoom(message.author.id, $event)" class="back-button">
                  {{ message.author.name }}
                </button>
              </span>
              
            </div>
            <div class="message-content">{{ message.data.text }}</div>
          </div>
          <div class="timestamp">
            <button @click="message.liked = !message.liked" class="like-button">👍</button>
            <span v-if="!message.liked">like</span>
            <span v-if="message.liked">liked</span>
            <span>{{ ((new
              Date(message.timestamp)).toLocaleTimeString()) }}
            </span>
          </div>
        </div>
      </div>
      <div class="chat-footer">
        <input v-model="messageInput" class="message-input" placeholder="Type your message..."
          @keypress.enter="handleSendMessage" />
        <button @click="handleSendMessage" class="send-button">Send</button>
      </div>
    </div>
    <button v-else @click="openChat" class="open-button">Open Chat</button>
  </div>
  <div v-else class="spinner">
    <div></div>
  </div>
</template>

<style scoped>
.chat-container {
  width: 370px;
  height: 590px;
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;
}

.chat-container.open {
  transform: translateY(0);
}

.chat-header {
  background-color: #3498db;
  color: #fff;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
}

.back-button,
.minimize-button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.like-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  margin-left: 5px;
}

.message-info {
  display: flex;
  align-items: center;
}

.chat-footer {
  display: flex;
  align-items: center;
  padding: 10px;
}

.message-input {
  flex: 1;
  padding: 5px;
  margin-right: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.send-button,
.emoji-button {
  background-color: #3498db;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.open-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #3498db;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.message-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.message {
  max-width: 70%;
  padding: 10px;
  border-radius: 8px;
  background-color: #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.own-message {
  justify-content: flex-start;
  background-color: #3498db;
  color: #fff;
}

.user-name {
  font-weight: bold;
  margin-right: 5px;
}

.timestamp {
  font-size: 12px;
  color: #888;
}

.message-content {
  word-wrap: break-word;
}

.spinner {
  width: 60px;
  height: 60px;
  background-color: black;
  position: fixed;
  right: 25px;
  bottom: 25px;
  border-radius: 50%;
  box-shadow: none;
  transition: box-shadow .2s ease-in-out;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner div {
  width: 20px;
  height: 20px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 5px solid white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
