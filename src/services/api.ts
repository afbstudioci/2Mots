import axios from 'axios';

// L'URL de ton backend Render
const API_BASE_URL = 'https://twomots-backend.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 secondes
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour injecter automatiquement l'Access Token dans les requêtes
api.interceptors.request.use(async (config) => {
    const { getToken } = require('./authStorage');
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;