import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';  // Подключаем стили
import App from './App.jsx';  // Подключаем главный компонент

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);