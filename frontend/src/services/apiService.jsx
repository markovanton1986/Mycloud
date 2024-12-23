import axios from 'axios';

// Получаем базовый URL из переменных окружения (используйте REACT_APP_ для создания переменных в .env)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Создайте экземпляр axios с базовым URL
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Если используется куки для аутентификации
});

// Функция для выполнения GET-запросов
export const getRequest = async (url, params = {}) => {
    try {
        const response = await apiClient.get(url, { params });
        return response.data;
    } catch (error) {
        console.error('Ошибка GET-запроса:', error);
        throw error;
    }
};

// Функция для выполнения POST-запросов
export const postRequest = async (url, data) => {
    try {
        const response = await apiClient.post(url, data);
        return response.data;
    } catch (error) {
        console.error('Ошибка POST-запроса:', error);
        throw error;
    }
};

// Функция для выполнения PUT-запросов
export const putRequest = async (url, data) => {
    try {
        const response = await apiClient.put(url, data);
        return response.data;
    } catch (error) {
        console.error('Ошибка PUT-запроса:', error);
        throw error;
    }
};

// Функция для выполнения DELETE-запросов
export const deleteRequest = async (url) => {
    try {
        const response = await apiClient.delete(url);
        return response.data;
    } catch (error) {
        console.error('Ошибка DELETE-запроса:', error);
        throw error;
    }
};

// Функция для выполнения POST-запроса с CSRF токеном (для защиты от CSRF атак)
export const postWithCSRF = async (url, data, csrfToken) => {
    try {
        const response = await apiClient.post(url, data, {
            headers: {
                'X-CSRFToken': csrfToken, // Используем CSRF токен из cookies или сгенерированный на фронте
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка POST-запроса с CSRF:', error);
        throw error;
    }
};

// Функция для выполнения GET-запроса с CSRF токеном
export const getWithCSRF = async (url, csrfToken, params = {}) => {
    try {
        const response = await apiClient.get(url, {
            headers: {
                'X-CSRFToken': csrfToken, // CSRF токен
            },
            params,
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка GET-запроса с CSRF:', error);
        throw error;
    }
};