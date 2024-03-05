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

export const status = ref<string>("idle");
export const messageList = ref<Message[]>([])
export const participants = ref<Participant[]>([])
export const room = ref<string>('')
export const myInfo = ref<Participant>({ id: "", name: "User" });

export const messageCallback = (wakuMessage: any) => {
    if (!injectWaku.ChatInterface || !wakuMessage.payload) return;
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

export const changeRoom = (newRoom: string) => {
    room.value = (newRoom)
}

export const privateRoom = (userId: string) => {
    const myId = myInfo.value.id;
    if (userId === myId)
        room.value = userId
    else
        room.value = userId < myId ? userId + ' & ' + myId : myId + ' & ' + userId;
}

export let sendMessageToServer = async (msg: Message) => { console.log(msg) };

export const initialization = () => {
    injectWaku.startWaku = inject("startWaku") as () => Promise<LightNode>;
    injectWaku.ChatInterface = inject("chatInterface") as protobuf.Type;
    injectWaku.ChatEncoder = inject("chatEncoder") as Encoder;
    injectWaku.ChatDecoder = inject("chatDecoder") as Decoder;
}

export const loadChat = (async () => {
    status.value = "connecting"
    if (!injectWaku.startWaku || !injectWaku.ChatDecoder) return

    const n = await injectWaku.startWaku();
    myInfo.value.id = n.libp2p.peerId.toString();
    myInfo.value.name = `User ${myInfo.value.id.substring(0, 10)}`
    participants.value = [myInfo.value]

    await n.filter.subscribe([injectWaku.ChatDecoder], messageCallback);
    sendMessageToServer = async (msg: Message) => {
        if (status.value !== "connected") return;
        if (!injectWaku.ChatInterface || !injectWaku.ChatEncoder) return

        const protoMessage = injectWaku.ChatInterface.create({
            message: JSON.stringify(msg)
        });
        const serialisedMessage = injectWaku.ChatInterface.encode(protoMessage).finish();

        await n.lightPush.send(injectWaku.ChatEncoder, {
            payload: serialisedMessage,
        });
    };
    status.value = "connected";
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
    }, 0);
}