import { Message, Participant } from "../types/ChatTypes";
import { ref, inject } from "vue";
import * as protobuf from "protobufjs";
import { LightNode, Encoder, Decoder } from "@waku/sdk";

type InjectWaku = {
    startWaku?: () => Promise<LightNode>,
    ChatInterface?: protobuf.Type,
    ChatEncoder?: Encoder,
    ChatDecoder?: Decoder
}

const injectWaku: InjectWaku = {}
const status = ref<string>("Waku Connecting...");

export const isConnected = ref<boolean>(false);
export const messageList = ref<Message[]>([])
export const participants = ref<Participant[]>([])
export const room = ref<string>('All')
export const myInfo = ref<Participant>({ id: "", name: "Me" });

// Create the callback function
export const messageCallback = (wakuMessage: any) => {
    // Check if there is a payload on the message
    if (!injectWaku.ChatInterface || !wakuMessage.payload) return;
    // Render the messageObj as desired in your application
    const messageObj: any = injectWaku.ChatInterface.decode(wakuMessage.payload);
    const parsedMsg = JSON.parse(messageObj.message);

    messageList.value = [...messageList.value, parsedMsg]

    for (let i = 0; i < participants.value.length; i++) {
        if (participants.value[i].id === parsedMsg.author.id) {
            participants.value[i] = parsedMsg.author;
            return;
        }
    }
    participants.value = [...participants.value, parsedMsg.author]

};

export const changeRoom = (newRoom: string, e: MouseEvent) => {
    e.stopPropagation();
    if (newRoom === 'All') {
        room.value = 'All'
        return
    }
    room.value = (newRoom + ' ' + myInfo.value.id)
}

export let sendMessageToServer = async (msg: Message) => { console.log(msg) };

export const initialization = (async () => {
    injectWaku.startWaku = inject("startWaku") as () => Promise<LightNode>;
    injectWaku.ChatInterface = inject("chatInterface") as protobuf.Type;
    injectWaku.ChatEncoder = inject("chatEncoder") as Encoder;
    injectWaku.ChatDecoder = inject("chatDecoder") as Decoder;

    const n = await injectWaku.startWaku();
    myInfo.value.id = n.libp2p.peerId.toString();
    participants.value = [myInfo.value]
    status.value = "Waku connected.";

    // Create a Filter subscription
    // const subscription = await node.value.filter.createSubscription();
    // Subscribe to content topics and process new messages
    await n.filter.subscribe([injectWaku.ChatDecoder], messageCallback);
    isConnected.value = true;
    sendMessageToServer = async (msg: Message) => {
        if (!isConnected) return;
        if (!injectWaku.ChatInterface || !injectWaku.ChatEncoder) return

        // Create a new message object
        const protoMessage = injectWaku.ChatInterface.create({
            message: JSON.stringify(msg)
        });
        // Serialise the message using Protobuf
        const serialisedMessage = injectWaku.ChatInterface.encode(protoMessage).finish();

        // Send the message using Light Push
        await n.lightPush.send(injectWaku.ChatEncoder, {
            payload: serialisedMessage,
        });
    };
});

export const sendMessage = (msgData: { text?: string, emoji?: string }, msgType: string) => {
    const timestamp = Date.now()
    const msg: Message = {
        author: myInfo.value,
        room: room.value,
        liked: false,
        type: msgType,
        data: msgData,
        timestamp: timestamp,
        id: myInfo.value.id + timestamp,
    }
    setTimeout(async () => {
        await sendMessageToServer(msg)
        onMessageWasSent(msg)
    }, 0);
}

export const onMessageWasSent = (message: Message) => {
    // called when the user sends a message
}