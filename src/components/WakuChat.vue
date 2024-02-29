<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";
import { Message } from "../types/ChatTypes";
import { initialization, sendMessage, participants, room, messageList, isConnected, changeRoom } from "../components/WakuLogic"

const isChatOpen = ref<boolean>(false);
const messageFiltered = ref<Message[]>([]);

onMounted(initialization);

const openChat = () => {
  // called when the user clicks on the fab button to open the chat
  if (!isConnected) return
  isChatOpen.value = true
}

const closeChat = () => {
  isChatOpen.value = false
}

const like = (msgId: string) => {
  const msgList = [...messageList.value]
  const m = msgList.findIndex((m) => m.id === msgId)
  var msg = msgList[m]
  msg.liked = !msg.liked
  msgList[m] = msg
  messageList.value = (msgList)
}

const getUserName = (userId: string) => {
  console.log(userId)
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
    {{ participants }}
    <BeautifulChat title="Doiim Chat" :participants="participants" :isOpen="isChatOpen" :close="closeChat"
      :open="openChat" :onMessageWasSent="sendMessage" :messageList="messageFiltered" :showEmoji="true" :showFile="false"
      :showEdition="true" :showDeletion="true" :deletionConfirmation="true" :showLauncher="true" :showCloseButton="true"
      :disableUserListToggle="false">
      <template v-slot:header>
        {{ getUserName(room) + ' room' }}
        <button @click="changeRoom('All', $event)">
          back to all
        </button>
      </template>
      <template v-slot:user-avatar="{ user }">
        <button v-if="user" @click="changeRoom(user.id, $event)">
          {{ user.name }}
        </button>
        <div>
          diz:
        </div>
      </template>
      <template v-slot:text-message-toolbox="scopedProps">
        <button v-if="!scopedProps.me && scopedProps.message.type === 'text'"
          @click.prevent="like(scopedProps.message.id)">
          👍
        </button>
      </template>
      <template v-slot:text-message-body="scopedProps">
        <p v-html="scopedProps.messageText"></p>
        <p v-if="scopedProps.message.data.meta" :style="{ color: scopedProps.messageColors.color }">
          {{ scopedProps.message.data.meta }}
        </p>
        <p v-if="scopedProps.message.isEdited || scopedProps.message.liked">
          <template v-if="scopedProps.message.isEdited">✎</template>
          <template v-if="scopedProps.message.liked">👍</template>
        </p>
      </template>
      <template v-slot:system-message-body="{ message }"> [System]: {{ message.text }} </template>
    </BeautifulChat>
  </div>
  <div v-else class="spinner">
    <div></div>
  </div>
</template>

<style scoped>
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
