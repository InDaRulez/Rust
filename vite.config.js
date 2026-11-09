import { defineConfig } from 'vite';
const host = process.env.TAURI_DEV_HOST;
export default defineConfig({
  clearScreen: false,
  server: {
    host: host || '0.0.0.0',
    port: 5173,
    strictPort: true,
    ...(host ? { hmr: { protocol: 'ws', host, port: 1421 } } : {}),
    watch: { ignored: ['**/src-tauri/**', '**/crates/**'] },
  },
});
