import {defineConfig} from 'vite';
export default defineConfig(({command})=>({base:command==='build'?'./':'/',build:{rollupOptions:{output:{manualChunks:{three:['three']}}}}}));
