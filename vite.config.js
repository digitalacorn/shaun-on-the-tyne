import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig((command, mode) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: env.BASE_URL,
    plugins: [react()],
  };
});
