import { defineStore } from 'pinia';
import apiClient from '../api/api';
import router from '../router'; // (Hanya 'logout' yang diizinkan menggunakan ini)

export const useAuthStore = defineStore('auth', {

    state: () => ({
        token: localStorage.getItem('spotToken') || null,
        user: JSON.parse(localStorage.getItem('spotUser')) || null,
        returnUrl: null
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        isAdmin: (state) => !!state.user && state.user.role === 'admin',
        isCustomer: (state) => !!state.user && state.user.role === 'customer'
    },

    actions: {

        async login(email, password) {
            try {
                const response = await apiClient.post('/auth/login', {
                    email: email,
                    password: password
                });
                const { token, user } = response.data.data;
                this.token = token;
                this.user = user;
                localStorage.setItem('spotToken', token);
                localStorage.setItem('spotUser', JSON.stringify(user));
                return true;
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                throw new Error(`${errorMessage}`);
            }
        },

        async register(userData) {
            try {
                // --- PERBAIKAN: HAPUS 'router.push' ---
                const response = await apiClient.post('/auth/register', userData);
                return response.data.message || 'Registrasi berhasil. Silahkan Cek Email Anda';
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                throw new Error(`${errorMessage}`);
            }
        },

        async requestPasswordReset(email) {
            try {
                const response = await apiClient.post('/auth/forgot-password', { email });
                return true;
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                throw new Error(`${errorMessage}`);
            }
        },

        logout() {
            this.token = null;
            this.user = null;
            this.returnUrl = null;
            localStorage.removeItem('spotToken');
            localStorage.removeItem('spotUser');
            router.push('/login'); // 'logout' adalah satu-satunya pengecualian
        }
    }
});