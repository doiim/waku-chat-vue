<script setup lang="ts">
import WakuChat from "./components/WakuChat.vue";
</script>

<template>
  <div id="app">
    <WakuChat :availableRooms="['General', 'Support', 'Off Topic']" :allowPrivateChat="false" :cssConfig="{
      primaryColor: 'rgba(29, 78, 216, 1)',
      primaryColorHover: 'rgba(29, 78, 180, 1)',
      secondaryColor: 'rgba(229, 231, 235, 1)',
      secondaryColorHover: 'rgba(229, 231, 235, 0.7)',
      backgroundColor: 'rgba(0, 0, 0, 0.01)',
      myMessageColor: 'rgba(29, 78, 216, 1)',
      myMessageTextColor: 'rgba(255, 255, 255, 1)',
      otherMessageColor: 'rgba(136, 153, 166, 0.3)',
      otherMessageTextColor: 'rgba(29, 78, 216, 1)',
    }" />
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
