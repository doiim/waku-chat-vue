<script setup lang="ts">
import { ref, inject, onMounted, watchEffect } from "vue";
import * as protobuf from "protobufjs";
import { LightNode, Encoder, Decoder } from "@waku/sdk";

type Message = { id: string, author: string, type: string, timestamp: number, liked: boolean, data: { text?: string, emoji?: string }, room: string }

const startWaku = inject("startWaku") as () => Promise<LightNode>;
const ChatInterface = inject("chatInterface") as protobuf.Type;
const ChatEncoder = inject("chatEncoder") as Encoder;
const ChatDecoder = inject("chatDecoder") as Decoder;
const id = ref<string>("");
const status = ref<string>("Waku Connecting...");
const isConnected = ref<boolean>(false);

const typedMessage = ref<string>("");
const isChatOpen = ref<boolean>(false);
const newMessagesCount = ref<number>(0);
const messageList = ref<Message[]>([])
const messageFiltered = ref<Message[]>([]);
const participants = ref<{ id: string, name: string }[]>([])
const myName = ref<string>('Me')
const room = ref<string>('All')

// Create the callback function
const messageCallback = (wakuMessage: any) => {
  // Check if there is a payload on the message
  if (!wakuMessage.payload) return;
  // Render the messageObj as desired in your application
  const messageObj: any = ChatInterface.decode(wakuMessage.payload);
  messageList.value = [...messageList.value, {
    id: messageObj.id,
    author: messageObj.sender,
    type: messageObj.type,
    liked: false,
    room: messageObj.room,
    data: { text: messageObj.message },
    timestamp: messageObj.timestamp
  }]

  for (let i = 0; i < participants.value.length; i++) {
    if (participants.value[i].id === messageObj.sender.id) {
      participants.value[i] = messageObj.sender;
      return;
    }
  }
  participants.value = [...participants.value, messageObj.sender]
};

let sendMessageToServer = async (msg: Message) => { console.log(msg) };

onMounted(async () => {
  const n = await startWaku();
  id.value = n.libp2p.peerId.toString();
  participants.value = [{ id: id.value, name: myName.value }]
  status.value = "Waku connected.";

  // Create a Filter subscription
  // const subscription = await node.value.filter.createSubscription();
  // Subscribe to content topics and process new messages
  await n.filter.subscribe([ChatDecoder], messageCallback);
  isConnected.value = true;
  sendMessageToServer = async (msg: Message) => {
    if (!isConnected) return;

    // Create a new message object
    const protoMessage = ChatInterface.create({
      timestamp: msg.timestamp,
      author: msg.author,
      message: typedMessage.value,
      liked: msg.liked,
      room: msg.room,
      id: msg.id
    });
    // Serialise the message using Protobuf
    const serialisedMessage = ChatInterface.encode(protoMessage).finish();

    // Send the message using Light Push
    await n.lightPush.send(ChatEncoder, {
      payload: serialisedMessage,
    });
    typedMessage.value = "";
  };
});

const sendMessage = (msg: Message) => {
  msg.author = id.value
  msg.room = room.value
  msg.liked = false
  msg.timestamp = Date.now()
  msg.id = msg.author + msg.timestamp

  let messageData = ''
  if (msg.data.text && msg.data.text.length > 0) {
    messageData = msg.data.text
  } else if (msg.data.emoji && msg.data.emoji.length > 0) {
    messageData = msg.data.emoji
  }

  setTimeout(async () => {
    newMessagesCount.value = isChatOpen ? newMessagesCount.value : newMessagesCount.value + 1
    typedMessage.value = messageData
    await sendMessageToServer(msg)
    onMessageWasSent(msg)
  }, 0);
}

const onMessageWasSent = (message: Message) => {
  // called when the user sends a message
  messageList.value = [...messageList.value, message]
}
const openChat = () => {
  // called when the user clicks on the fab button to open the chat
  if (!isConnected) return
  isChatOpen.value = true
  newMessagesCount.value = 0
}

const closeChat = () => {
  isChatOpen.value = false
}

const like = (id: string) => {
  const m = messageList.value.findIndex((m) => m.id === id)
  var msg = messageList.value[m]
  msg.liked = !msg.liked
  messageList.value[m] = msg
}

const changeRoom = (newRoom: string, e: MouseEvent) => {
  e.stopPropagation();
  room.value = newRoom + ' ' + id
}

const getUserName = (id: string) => {
  let name = 'All'
  participants.value.forEach(participant => {
    if (participant.id === id)
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
    <BeautifulChat title="Doiim Chat" :participants="participants" :isOpen="isChatOpen" :close="closeChat"
      :open="openChat" :onMessageWasSent="sendMessage" :messageList="messageFiltered" :showEmoji="true" :showFile="false"
      :showEdition="true" :showDeletion="true" :deletionConfirmation="true" :showLauncher="true" :showCloseButton="true"
      :disableUserListToggle="false">
      <template v-slot:header>
        {{ getUserName(room.split(' ')[0]) + ' room' }}
        <button @click="changeRoom('All', $event)">
          back to all
        </button>
      </template>
      <template v-slot:user-avatar="{ user }">
        <button v-if="user && user.name" @click="changeRoom(user.id, $event)">
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
