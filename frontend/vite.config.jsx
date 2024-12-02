import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // Задаёт порт для разработки
    open: true, // Автоматически открывает приложение в браузере
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Адрес вашего бэкенда
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist', // Папка для сборки
    sourcemap: true, // Включить карты исходного кода для отладки
  },
  base: '/', // Указываем базовый путь для вашего приложения
});