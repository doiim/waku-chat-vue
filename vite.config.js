import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        vue(),
    ],
    css: {
        modules: { scopeBehaviour: 'global', },
    },
    input: 'src/index.ts',
    base: '/waku-chat-vue/',
    resolve: {
        preserveSymlinks: true,
    },
    build: {
        lib: {
            entry: resolve(__dirname, './src/index.ts'),
            name: 'ChatComponent',
            fileName: 'waku-chat-vue',
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                intro: `require ('./style.css')`,
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
})