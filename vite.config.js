import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/waku-chat-vue/",
  define: { process: "window.process" },
  resolve: {
    preserveSymlinks: true,
  },
});
