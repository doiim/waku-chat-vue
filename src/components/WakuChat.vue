<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import * as protobuf from "protobufjs";
import { LightNode, Encoder, Decoder } from "@waku/sdk";

type Message = { author: string, type: string, data: { text: string } }

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

// Create the callback function
const messageCallback = (wakuMessage: any) => {
  // Check if there is a payload on the message
  if (!wakuMessage.payload) return;
  // Render the messageObj as desired in your application
  const messageObj: any = ChatInterface.decode(wakuMessage.payload);
  messageList.value = [...messageList.value, { author: messageObj.sender, type: 'message', data: { text: messageObj.message } }]
};

let sendMessageToServer = async () => { };

onMounted(async () => {
  const n = await startWaku();
  id.value = n.libp2p.peerId.toString();
  status.value = "Waku connected.";

  // Create a Filter subscription
  // const subscription = await node.value.filter.createSubscription();
  // Subscribe to content topics and process new messages
  await n.filter.subscribe([ChatDecoder], messageCallback);
  isConnected.value = true;
  sendMessageToServer = async () => {
    if (!isConnected) return;

    // Create a new message object
    const protoMessage = ChatInterface.create({
      timestamp: Date.now(),
      sender: id.value,
      message: typedMessage.value,
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
  if (msg.data.text.length > 0) {
    setTimeout(async () => {
      newMessagesCount.value = isChatOpen ? newMessagesCount.value : newMessagesCount.value + 1
      typedMessage.value = msg.data.text
      await sendMessageToServer()
      onMessageWasSent(msg)
    }, 0);
  }
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

</script>

<template>
  <div v-if="isConnected">
    <BeautifulChat title="Chat Name" :participants="[id]" :isOpen="isChatOpen" :close="closeChat" :open="openChat"
      :onMessageWasSent="sendMessage" :messageList="messageList" :showEmoji="true" :showFile="true" :showEdition="true"
      :showDeletion="true" :deletionConfirmation="true" :showLauncher="true" :showCloseButton="true"
      :disableUserListToggle="false" />
  </div>
  <div v-else>
    WAIT CONNECT
  </div>
</template>

<style scoped></style>
