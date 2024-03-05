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

const chatState = ref<{
    status: string,
    messageList: Message[],
    participants: Participant[],
    room: string
}>({
    status: 'idle',
    messageList: [],
    participants: [],
    room: ''
})

let sendMessageToServer = async (msg: Message) => { console.log(msg) };

const myInfo = ref<Participant>({ id: "", name: "User" });

export const setRoom = (_room: string) => {
    chatState.value.room = _room
}

export const getRoom = () => {
    return chatState.value.room
}

export const getMessageList = () => {
    return chatState.value.messageList
}

export const getParticipants = () => {
    return chatState.value.participants
}

export const getStatus = () => {
    return chatState.value.status
}

export const getMyID = () => {
    return myInfo.value.id
}

export const setMyName = (_newName: string) => {
    myInfo.value.name = _newName
}

export const getMyName = () => {
    return myInfo.value.name
}

export const privateRoom = (userId: string) => {
    const myId = myInfo.value.id;
    if (userId === myId)
        setRoom(userId)
    else
        setRoom(userId < myId ? userId + ' & ' + myId : myId + ' & ' + userId);
}

export const initialization = () => {
    injectWaku.startWaku = inject("startWaku") as () => Promise<LightNode>;
    injectWaku.ChatInterface = inject("chatInterface") as protobuf.Type;
    injectWaku.ChatEncoder = inject("chatEncoder") as Encoder;
    injectWaku.ChatDecoder = inject("chatDecoder") as Decoder;
}

export const loadChat = (async () => {
    chatState.value.status = "connecting"
    if (!injectWaku.startWaku || !injectWaku.ChatDecoder) return

    const n = await injectWaku.startWaku();
    myInfo.value.id = n.libp2p.peerId.toString();
    myInfo.value.name = `User ${myInfo.value.id.substring(0, 10)}`
    chatState.value.participants = [myInfo.value]

    await n.filter.subscribe([injectWaku.ChatDecoder], messageCallback);
    sendMessageToServer = async (msg: Message) => {
        if (chatState.value.status !== "connected") return;
        if (!injectWaku.ChatInterface || !injectWaku.ChatEncoder) return

        const protoMessage = injectWaku.ChatInterface.create({
            message: JSON.stringify(msg)
        });
        const serialisedMessage = injectWaku.ChatInterface.encode(protoMessage).finish();

        await n.lightPush.send(injectWaku.ChatEncoder, {
            payload: serialisedMessage,
        });
    };
    chatState.value.status = "connected";
});

export const sendMessage = (msgData: { text?: string, emoji?: string }, msgType: string) => {
    const timestamp = Date.now()
    const msg: Message = {
        author: myInfo.value,
        room: chatState.value.room,
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

const messageCallback = (wakuMessage: any) => {
    if (!injectWaku.ChatInterface || !wakuMessage.payload) return;
    const messageObj: any = injectWaku.ChatInterface.decode(wakuMessage.payload);
    const parsedMsg = JSON.parse(messageObj.message);

    chatState.value.messageList = [...chatState.value.messageList, parsedMsg]

    for (let i = 0; i < chatState.value.participants.length; i++) {
        if (chatState.value.participants[i].id === parsedMsg.author.id) {
            chatState.value.participants[i] = parsedMsg.author;
            return;
        }
    }
    chatState.value.participants = [...chatState.value.participants, parsedMsg.author]

};