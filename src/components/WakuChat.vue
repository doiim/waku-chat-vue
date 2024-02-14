<script setup lang="ts">
import { ref, inject, onMounted, watch } from "vue";
import * as protobuf from "protobufjs";
import { LightNode, Encoder, Decoder } from "@waku/sdk";

const startWaku = inject("startWaku") as () => Promise<LightNode>;
const ChatInterface = inject("chatInterface") as protobuf.Type;
const ChatEncoder = inject("chatEncoder") as Encoder;
const ChatDecoder = inject("chatDecoder") as Decoder;
const id = ref<string>("");
const status = ref<string>("Waku Connecting...");
const isConnected = ref<boolean>(false);
const message = ref<string>("");
const messages = ref<string[]>([]);
const messagesRef = ref<HTMLElement | null>(null);

// Create the callback function
const messageCallback = (wakuMessage: any) => {
  // Check if there is a payload on the message
  if (!wakuMessage.payload) return;
  // Render the messageObj as desired in your application
  const messageObj: any = ChatInterface.decode(wakuMessage.payload);
  messages.value.push(
    `${messageObj.sender.substring(
      messageObj.sender.length - 5,
      messageObj.sender.length
    )} says: ${messageObj.message} at ${new Date(
      messageObj.timestamp
    ).toLocaleTimeString()}`
  );
};

// watch works directly on a ref
watch(
  messages,
  async () => {
    setTimeout(() => {
      if (messagesRef.value) {
        console.log(
          "scrolling",
          messagesRef.value.scrollTop,
          messagesRef.value.scrollHeight
        );
        messagesRef.value.scrollTo({
          top: messagesRef.value.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 300);
  },
  { deep: true }
);

let sendMessage = () => {};

onMounted(async () => {
  const n = await startWaku();
  id.value = n.libp2p.peerId.toString();
  status.value = "Waku connected.";

  // Create a Filter subscription
  // const subscription = await node.value.filter.createSubscription();
  // Subscribe to content topics and process new messages
  await n.filter.subscribe([ChatDecoder], messageCallback);
  isConnected.value = true;
  sendMessage = async () => {
    if (!isConnected) return;

    // Create a new message object
    const protoMessage = ChatInterface.create({
      timestamp: Date.now(),
      sender: id.value,
      message: message.value,
    });
    // Serialise the message using Protobuf
    const serialisedMessage = ChatInterface.encode(protoMessage).finish();

    // Send the message using Light Push
    await n.lightPush.send(ChatEncoder, {
      payload: serialisedMessage,
    });
    message.value = "";
  };
});
</script>

<template>
  <div class="ipfs-info">
    <form v-if="isConnected" v-on:submit.prevent="sendMessage">
      <div id="messages" ref="messagesRef" class="messages">
        <p v-for="(m, idx) in messages" :key="idx">{{ m }}</p>
      </div>
      <input
        size="50"
        v-model="message"
        placeholder="Write something and press enter."
      /><br />
      <input type="submit" />
    </form>
    <h4>{{ status }}</h4>
    <h5>ID: {{ id }}</h5>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.messages {
  display: flex;
  flex-direction: column;
  flex-flow: column;
  align-items: center;
  overflow-y: scroll;
  max-height: 300px;
}
.messages p {
  max-width: 300px;
}
</style>
