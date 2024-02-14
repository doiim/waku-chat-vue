<script setup lang="ts">
import WakuChat from "./components/WakuChat.vue";
</script>

<template>
  <div id="app">
    <img id="libp2p-logo" alt="IPFS logo" src="./assets/waku-logo.svg" />
    <WakuChat />
  </div>
</template>

<style>
body {
  margin: 0;
}
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
#libp2p-logo {
  height: 10rem;
  margin: 24px;
}
img {
  background-color: black;
  border-radius: 100%;
}
</style>
