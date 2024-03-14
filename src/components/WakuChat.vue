<script setup lang="ts">
import { ref, onMounted, watchEffect, onBeforeUnmount } from "vue";
import { Message } from "../types/ChatTypes";
import {
  initialization,
  sendMessage,
  loadChat,
  setRoom,
  getParticipants,
  getStatus,
  getMessageList,
  getRoom,
  setMyName,
  getMyName,
  getMyID,
  getOptions,
  onDestroyWaku
} from "../components/WakuLogic"

const isChatOpen = ref<boolean>(false);

const messageFiltered = ref<Message[]>([]);
const messageInput = ref<string>('');

const computedCss = ref<any>({
  primaryColor: 'rgba(29, 78, 216, 1)',
  primaryColorHover: 'rgba(29, 78, 180, 1)',
  primaryTextColor: 'rgba(255, 255, 255, 1)',
  secondaryColor: 'rgba(229, 231, 235, 1)',
  secondaryColorHover: 'rgba(229, 231, 235, 0.7)',
  secondaryTextColor: 'rgba(0, 0, 0, 1)',
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  myMessageColor: 'rgba(29, 78, 216, 1)',
  myMessageTextColor: 'rgba(255, 255, 255, 1)',
  otherMessageColor: 'rgba(136, 153, 166, 0.3)',
  otherMessageTextColor: 'rgba(29, 78, 216, 1)',
});

const editMode = ref(false);
const editedUserName = ref('');

const messageContainerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  initialization();

  editedUserName.value = getMyName();

  const handleNickNameChange = (event: Event) => {
    const newNick = (event as CustomEvent).detail;

    if (getOptions()?.changeNickMode === 'message' || getOptions()?.changeNickMode === 'interface') {
      setMyName(newNick);
    }
  };
  //document.dispatchEvent(new CustomEvent('changeNickName', { detail: 'newNick' }));
  document.addEventListener('changeNickName', handleNickNameChange);

  onBeforeUnmount(() => {
    document.removeEventListener('changeNickName', handleNickNameChange);
    onDestroyWaku();
  });
});

const enterEditMode = () => {
  editMode.value = true;
};
const exitEditMode = () => {
  editMode.value = false;
};

const saveEditedUserName = () => {
  setMyName(editedUserName.value);
  exitEditMode();
};

const getRoomName = (room: string) => {
  let name = getOptions()?.availableRooms[0];
  getParticipants().forEach(participant => {
    name = room.replace(new RegExp(participant.id, 'g'), participant.name);
  });
  return name;
};

const changeRoomDropdown = (selectedRoom: string) => {
  setRoom(selectedRoom);
};

const openChat = () => {
  if (getStatus() !== "connected") {
    loadChat()
  }
  isChatOpen.value = true
}

const closeChat = () => {
  isChatOpen.value = false
}

const handleSendMessage = () => {
  sendMessage({ text: messageInput.value }, 'text')
  messageInput.value = ''
}

const scrollToBottom = () => {
  if (messageContainerRef.value) {
    const container = messageContainerRef.value
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }
};

watchEffect(() => {
  messageFiltered.value = getMessageList().filter(message => {
    return message.room === getRoom();
  })
  if (messageFiltered.value.length > 0)
    scrollToBottom();
});

watchEffect(() => {
  const props = getOptions();
  const cssConfig = props?.cssConfig as Record<string, string> | undefined;;

  if (!cssConfig) return;

  const cssProperties = [
    'primaryColor',
    'primaryColorHover',
    'primaryTextColor',
    'secondaryColor',
    'secondaryColorHover',
    'secondaryTextColor',
    'backgroundColor',
    'otherMessageColor',
    'otherMessageTextColor',
    'myMessageColor',
    'myMessageTextColor',
  ];

  cssProperties.forEach((property) => {
    if (cssConfig[property]) {
      computedCss.value[property] = cssConfig[property];
    }
  });
});

</script>

<template>
  <div v-if="getStatus() === 'connected'">
    <div v-if="isChatOpen" class="chat-container" :class="{ 'open': isChatOpen }">
      <div class="chat-header">
        <div class="user-section">
          <div v-if="getOptions()?.changeNickMode === 'interface'" class="user-profile" @click="enterEditMode">
            <span v-if="!editMode">{{ getMyName() }}</span>
            <input v-model="editedUserName" v-else @blur="exitEditMode" @keypress.enter="saveEditedUserName"
              class="edit-user-input" />
          </div>
          <div v-else class="user-profile non-edit">
            <span>{{ getMyName() }}</span>
          </div>
          <button @click="closeChat" class="minimize-button">-</button>
        </div>
        <div class="room-section">
          <div class="room-info">
            <span class="room-name">{{ getRoomName(getRoom()) + ' room' }}</span>
          </div>
          <div class="room-dropdown">
            <button class="dropdown-button">Change Room</button>
            <div class="dropdown-content">
              <div v-for="availableRoom in getOptions()?.availableRooms" :key="availableRoom">
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
          :class="{ 'own-message': message.author.id === getMyID() }" class="message-container">
          <div class="message">
            <div class="message-info">
              <span>
                <span class="user-name-baloon">
                  {{ message.author.name }}
                </span>
              </span>
            </div>
            <div class="message-content">{{ message.data.text }}</div>
          </div>
          <div class="timestamp">
            <span>
              {{ (new Date(message.timestamp)).toLocaleTimeString() }}
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
  <div v-else-if="getStatus() === 'connecting'" class="spinner">
    <div></div>
  </div>
  <div v-else>
    <button @click="openChat" class="open-button">Load Chat</button>
  </div>
</template>

<style lang="css" src="./WakuChat.css" />