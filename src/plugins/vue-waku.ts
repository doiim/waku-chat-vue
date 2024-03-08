import * as protobuf from "protobufjs";
import {
  createLightNode,
  waitForRemotePeer,
  createDecoder,
  createEncoder,
} from "@waku/sdk";

const plugin = {
  install: async (app: any, options: any) => {

    const startWaku = async function () {

      // Bootstrap node using the static peers
      const node = await createLightNode({
        defaultBootstrap: true
      });
      await node.start();

      // Wait for a successful peer connection
      await waitForRemotePeer(node);
      return node
    }

    app.provide('startWaku', startWaku)

    const ParticipantInterface = new protobuf.Type("Participant")
      .add(new protobuf.Field("id", 1, "string"))
      .add(new protobuf.Field("name", 2, "string"))

    const MsgDataInterface = new protobuf.Type("MsgData")
      .add(new protobuf.Field("text", 1, "string"))
      .add(new protobuf.Field("emoji", 2, "string"))

    // Create a message structure using Protobuf
    const ChatInterface = new protobuf.Type("ChatInterface")
      .add(new protobuf.Field("id", 1, "string"))
      .add(new protobuf.Field("author", 2, "Participant",))
      .add(new protobuf.Field("type", 3, "string"))
      .add(new protobuf.Field("timestamp", 4, "uint64"))
      .add(new protobuf.Field("liked", 5, "string"))
      .add(new protobuf.Field("data", 6, "MsgData"))
      .add(new protobuf.Field("room", 7, "string"));

    ChatInterface.add(ParticipantInterface)
    ChatInterface.add(MsgDataInterface)

    app.provide('chatInterface', ChatInterface)
    app.provide('chatOptions', options)
  },

}


export default plugin

export const changeTopic = (_channel: string, _topic: string) => {
  const topic = _topic.toLowerCase().replace(/\s/g, '');
  const channel = _topic.toLowerCase().replace(/\s/g, '');

  // Choose a content topic
  const contentTopic = `/${channel}/1/${topic}/proto`;

  // Create a message encoder and decoder
  const encoder = createEncoder({
    contentTopic: contentTopic, // message content topic
    ephemeral: true, // allows messages not be stored on the network
  });
  const decoder = createDecoder(contentTopic);
  return { encoder, decoder }
}
