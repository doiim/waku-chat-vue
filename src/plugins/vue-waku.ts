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

    // Create a message structure using Protobuf
    const ChatInterface = new protobuf.Type("ChatInterface")
      .add(new protobuf.Field("timestamp", 1, "uint64"))
      .add(new protobuf.Field("sender", 2, "string"))
      .add(new protobuf.Field("message", 3, "string"));

    app.provide('chatInterface', ChatInterface)
    app.provide('chatOptions', options)
  },

}

export default plugin

export const changeTopic = (_topic: string) => {
  const topic = _topic.toLowerCase().replace(/\s/g, '');

  // Choose a content topic
  const contentTopic = `/doiim/1/${topic}`;

  // Create a message encoder and decoder
  const encoder = createEncoder({
    contentTopic: contentTopic, // message content topic
    ephemeral: true, // allows messages not be stored on the network
  });
  const decoder = createDecoder(contentTopic);
  return { encoder, decoder }
}
