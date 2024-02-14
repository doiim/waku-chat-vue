import * as protobuf from "protobufjs";
import {
  createLightNode,
  waitForRemotePeer,
  createDecoder,
  createEncoder,
  Protocols
} from "@waku/sdk";

interface Options {
  proxyMultiaddrs: string
}

const plugin = {
  install: async (app: any, options: Options) => {

    const startWaku = async function () {
      // Create and start a Light Node
      const node = await createLightNode({ defaultBootstrap: true });
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

    // Choose a content topic
    const contentTopic = "/doiim/1/message";

    // Create a message encoder and decoder
    const encoder = createEncoder({
      contentTopic: contentTopic, // message content topic
      ephemeral: true, // allows messages not be stored on the network
    });
    const decoder = createDecoder(contentTopic);

    app.provide('chatEncoder', encoder)
    app.provide('chatDecoder', decoder)
  }
}

export default plugin
