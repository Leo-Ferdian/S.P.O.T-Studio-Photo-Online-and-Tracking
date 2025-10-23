import { defineStore } from 'pinia';
import apiClient from '../api/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('userToken') || null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.token,
        getUser: (state) => state.user,
    },
    actions: {
        async login(credentials) {
            try {
                const response = await apiClient.post('/auth/login', credentials);
                const { token, user } = response.data.data;

                // Simpan ke state dan localStorage
                this.token = token;
                this.user = user;
                localStorage.setItem('userToken', token);
                localStorage.setItem('user', JSON.stringify(user));

                // Arahkan ke dashboard yang sesuai setelah login
                if (user.role === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/dashboard'); // Asumsi dashboard customer di /dashboard
                }

                return true;
            } catch (error) {
                console.error("Login failed:", error);
                return false;
            }
        },
        logout() {
            // Hapus dari state dan localStorage
            this.token = null;
            this.user = null;
            localStorage.removeItem('userToken');
            localStorage.removeItem('user');
            // Arahkan ke halaman login (akan ditangani oleh router)
        },
        async requestPasswordReset(email) {
            try {
                // TODO: Panggil API backend POST /api/auth/forgot-password
                // Untuk sekarang, kita simulasikan sukses setelah 2 detik
                console.log(`Requesting password reset for: ${email}`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                // Jika API berhasil, return true
                return true;
            } catch (error) {
                console.error("Forgot password request failed:", error);
                throw error;
            }
        },
    },
});