import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Сокращённый путь для импорта из src
    },
  },
  server: {
    port: 3000, // Порт, на котором запустится dev-сервер
    open: true, // Автоматически открывать браузер при запуске
    hmr: {
      overlay: true, // Включить оверлей для ошибок
    },
  },
  build: {
    outDir: 'dist', // Директория для сборки
    sourcemap: true, // Генерация sourcemap для удобной отладки
  },
  base: '/', // Базовый путь, если приложение разворачивается в поддиректории
});
