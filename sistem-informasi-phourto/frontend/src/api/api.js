import axios from 'axios';

// 1. URL dasar backend V1.10 kita
// Pastikan server.js Anda berjalan di port 5000
const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. INTERCEPTOR REQUEST (PENTING)
// Sebelum *setiap* request dikirim, jalankan fungsi ini.
apiClient.interceptors.request.use(
    (config) => {
        // Ambil token dari localStorage
        // (Kita akan pastikan auth.store.js menyimpan token dengan nama 'spotToken')
        const token = localStorage.getItem('spotToken');

        if (token) {
            // Jika token ada, tambahkan ke header Authorization
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Jika ada error saat membuat request
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
        // Jika backend mengirim error
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // (401 Unauthorized) atau 403 (Forbidden - Token tidak valid/kadaluarsa)

            try {
                const { useAuthStore } = await import('@/stores/auth.stores.js');
                const authStore = useAuthStore();
                authStore.logout(); // Panggil action logout
            } catch (e) {
                console.error("Gagal memanggil logout dari interceptor:", e);
                // Fallback jika store gagal (brute force)
                localStorage.removeItem('spotToken');
                localStorage.removeItem('spotUser');
                window.location.href = '/login';
            }

            return Promise.reject(new Error('Sesi Anda telah berakhir. Silakan login kembali.'));
        }

        // Untuk error lain (400, 404, 500), teruskan error-nya
        // (Biarkan Pinia store yang menanganinya)
        return Promise.reject(error);
    }
);

export default apiClient;