import {defineConfig} from 'vite';
export default defineConfig(({command})=>({base:command==='build'?'/samebestie/':'/',build:{rollupOptions:{output:{manualChunks:{three:['three']}}}}}));
