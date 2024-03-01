<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";
import { Message } from "../types/ChatTypes";
import { initialization, sendMessage, participants, room, messageList, isConnected, changeRoom, privateRoom, myInfo } from "../components/WakuLogic"

const isChatOpen = ref<boolean>(false);
const messageFiltered = ref<Message[]>([]);
const messageInput = ref<string>('');
const props = defineProps(['availableRooms', 'allowPrivateChat']);

onMounted(() => {
  room.value = props.availableRooms[0]
  initialization()
});

const editMode = ref(false);
const editedUserName = ref(myInfo.value.name);

const enterEditMode = () => {
  editMode.value = true;
};

const exitEditMode = () => {
  editMode.value = false;
};

const saveEditedUserName = () => {
  // You can add additional validation if needed
  myInfo.value.name = editedUserName.value;
  exitEditMode();
};

const getRoomName = (room: string) => {
  let name = props.availableRooms[0];
  participants.value.forEach(participant => {
    name = room.replace(new RegExp(participant.id, 'g'), participant.name);
  });
  return name;
};

const changeRoomDropdown = (selectedRoom: string) => {
  changeRoom(selectedRoom);
};

const openChat = () => {
  if (!isConnected) return
  isChatOpen.value = true
}

const closeChat = () => {
  isChatOpen.value = false
}

const handleSendMessage = () => {
  sendMessage({ text: messageInput.value }, 'text')
  messageInput.value = ''
}

const messageContainerRef = ref<HTMLElement | null>(null);
const scrollToBottom = () => {
  // Verifica se a referência ao contêiner de mensagens existe
  if (messageContainerRef.value) {
    const container = messageContainerRef.value
    // Define o scrollTop para a altura total do contêiner
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }
};

watchEffect(() => {
  messageFiltered.value = messageList.value.filter(message => {
    return message.room === room.value;
  })
  if (messageFiltered.value.length > 0)
    scrollToBottom();
});

</script>

<template>
  <div v-if="isConnected">
    <div v-if="isChatOpen" class="chat-container" :class="{ 'open': isChatOpen }">
      <div class="chat-header">
        <div class="user-section">
          <div class="user-profile">
            <span class="user-name" v-if="!editMode" @click="enterEditMode">{{ myInfo.name }}</span>
            <input v-model="editedUserName" v-if="editMode" @blur="exitEditMode" @keypress.enter="saveEditedUserName"
              class="edit-user-input" />
          </div>
          <button @click="closeChat" class="minimize-button">-</button>
        </div>
        <div class="room-section">
          <div class="room-info">
            <span class="room-name">{{ getRoomName(room) + ' room' }}</span>
          </div>
          <div class="room-dropdown">
            <button class="dropdown-button">Change Room</button>
            <div class="dropdown-content">
              <div v-for="availableRoom in props.availableRooms" :key="availableRoom">
                <button @click="changeRoomDropdown(availableRoom)">
                  {{ availableRoom }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-body" ref="messageContainerRef">
        <div v-for="message in messageFiltered" :key="message.id"
          :class="{ 'own-message': message.author.id === myInfo.id }" class="message-container">
          <div class="message">
            <div class="message-info">
              <span class="user-name">
                <button v-if="props.allowPrivateChat" @click="privateRoom(message.author.id)"
                  class="user-name-baloon-btn">
                  {{ message.author.name }}
                </button>
                <span v-else class="user-name-baloon">
                  {{ message.author.name }}
                </span>
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
.room-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  right: 0;
  position: absolute;
  background-color: rgba(29, 78, 216, 1);
  /* Cor de fundo do dropdown */
  min-width: 100%;
  /* Ocupa 100% da largura do dropdown */
  box-shadow: 0px 8px 16px 0px rgba(31, 41, 55, 0.1);
  z-index: 1;
  max-width: 256px;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Adiciona reticências (...) quando o texto ultrapassa o tamanho */
  white-space: nowrap;
  /* Impede a quebra de linha */
  border-radius: 16px;
  border: 2px solid rgba(229, 231, 235, 1);
  /* Borda arredondada */
}

.dropdown-content button {
  color: rgba(255, 255, 255, 1);
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;
  width: 100%;
  /* Ocupa 100% da largura do botão */
  text-align: left;
  /* Alinha o texto à esquerda */
  border: none;
  background: none;
  transition: background-color 0.3s ease-in-out;
  border-radius: 16px;
}

.dropdown-content button:hover {
  background-color: rgba(31, 41, 55, 0.9);
  /* Cor de destaque ao passar o mouse */
}

.room-dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: rgba(255, 255, 255, 1);
}

.chat-container {
  width: 368px;
  height: 592px;
  position: fixed;
  bottom: 16px;
  right: 16px;
  background-color: rgba(255, 255, 255, 1);
  border: 2px solid rgba(29, 78, 216, 1);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;
}

.chat-container.open {
  transform: translateY(0);
}

.chat-header {
  background-color: rgba(29, 78, 216, 1);
  color: rgba(255, 255, 255, 1);
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  flex-direction: column;
}

.user-section {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 8px;
}

.room-section {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.user-profile {
  display: flex;
  align-items: center;
  height: 48px;
  border: 2px solid white;
  padding: 0px 8px;
  width: 100%;
  margin-right: 8px;
  cursor: pointer;
  background-color: rgba(29, 78, 216, 0.8);
  transition: background-color 0.3s ease-in-out;
  /* Add background color to highlight the section */
  border-radius: 16px;
  /* Add border-radius for rounded corners */
}

.user-profile:hover {
  background-color: rgba(31, 41, 55, 0.9);
  /* Add hover effect to make it interactive */
}

.user-name {
  font-weight: bold;
  width: 100%;
  margin-left: 4px;
  text-align: start;
  /* Add cursor pointer to indicate it's clickable */
}

.edit-user-input {
  font-size: 14px;
  border: 1px solid rgba(29, 78, 216, 0.5);
  /* Add border to the input for visibility */
  border-radius: 16px;
  /* Add border-radius for rounded corners */
  margin: 4px 0px;
  height: 38px;
  width: 100%;
}

.room-info {
  margin-right: 10px;
  /* Adjust the spacing between user info and room info */
}

.room-name {
  font-size: 14px;
  font-weight: bold;
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
  padding: 16px;
}

.message-input {
  flex: 1;
  height: 32px;
  /* Aumenta o preenchimento para destacar mais as cores */
  padding: 16px;
  margin-right: 8px;
  border: 2px solid rgba(29, 78, 216, 1);
  border-radius: 16px;
  /* Adiciona bordas arredondadas */
}

.open-button,
.spinner,
.minimize-button,
.send-button {
  width: 64px;
  height: 64px;
  background-color: rgba(29, 78, 216, 1);
  color: rgba(255, 255, 255, 1);
  border-radius: 50%;
  border: 2px solid rgba(229, 231, 235, 1);
  transition: background-color 0.3s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
}

.open-button,
.minimize-button,
.send-button {
  cursor: pointer;
}

.open-button:hover,
.minimize-button:hover,
.send-button:hover {
  background-color: rgba(31, 41, 55, 0.9);
}

.open-button,
.spinner {
  position: fixed;
  right: 34px;
  bottom: 36px;
}

.minimize-button {
  width: 32px;
  height: 32px;
}

.user-name-baloon {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 1);
  font-weight: bold;
}

.user-name-baloon-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 1);
  cursor: pointer;
  font-weight: bold;
  text-decoration: underline;
}

.message-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.message-container div {
  align-self: end;
}

.message {
  min-width: 96px;
  max-width: 67%;
  padding: 10px;
  border-radius: 16px;
  background-color: rgba(229, 231, 235, 1);
  box-shadow: 0 2px 4px rgba(29, 78, 216, 0.1);
}

.own-message div {
  align-self: start;
}

.own-message .message {
  background-color: rgba(29, 78, 216, 1);
  color: rgba(255, 255, 255, 1);
}

.timestamp {
  font-size: 12px;
  color: rgba(136, 153, 166, 1);
}

.message-content {
  word-wrap: break-word;
}

.spinner div {
  width: 16px;
  height: 16px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid rgba(255, 255, 255, 1);
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
