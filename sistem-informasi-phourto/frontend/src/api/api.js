import axios from 'axios';

// Membuat instance Axios dengan konfigurasi dasar
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // URL dasar backend kita
    headers: {
        'Content-Type': 'application/json'
    }
});

// PENTING: Menambahkan interceptor untuk menyertakan token JWT secara otomatis
apiClient.interceptors.request.use(
    (config) => {
        // Ambil token dari localStorage (nanti akan dikelola oleh Pinia)
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;