import axios from 'axios';

// 1. URL dasar backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. INTERCEPTOR REQUEST (PENTING)
// (Fungsi ini tidak berubah)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('spotToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. INTERCEPTOR RESPONSE (PENTING)
// Menangani error 401 (Token kadaluarsa / tidak valid) secara global
apiClient.interceptors.response.use(
    (response) => {
        // Jika response 2xx, 3xx, lanjutkan
        return response;
    },
    async (error) => {

        // --- PERBAIKAN BUG DIMULAI DI SINI ---
        const originalRequest = error.config;
        const status = error.response ? error.response.status : null;

        // Cek apakah ini error 401 atau 403
        if (status === 401 || status === 403) {

            // Cek apakah error ini berasal dari 'login'
            // (Kita gunakan .includes() untuk menangani '/login' dan '/admin/login' jika mereka memanggil endpoint yang sama)
            if (originalRequest.url.includes('/auth/login')) {
                // JANGAN lakukan logout global.
                // Biarkan komponen login (login.vue) menangani error 'Password salah.'
                return Promise.reject(error);
            }

            // Jika ini error 401/403 dari endpoint LAIN,
            // maka ini adalah token yang kedaluwarsa/tidak valid.
            // Lanjutkan dengan logout global.
            try {
                const { useAuthStore } = await import('@/stores/auth.stores.js');
                const authStore = useAuthStore();
                authStore.logout(); // Panggil action logout
            } catch (e) {
                console.error("Gagal memanggil logout dari interceptor:", e);
                localStorage.removeItem('spotToken');
                localStorage.removeItem('spotUser');
                window.location.href = '/login';
            }

            return Promise.reject(new Error('Sesi Anda telah berakhir. Silakan login kembali.'));
        }
        // --- AKHIR PERBAIKAN ---

        // Untuk error lain (400, 404, 500), teruskan error-nya
        return Promise.reject(error);
    }
);

export default apiClient;