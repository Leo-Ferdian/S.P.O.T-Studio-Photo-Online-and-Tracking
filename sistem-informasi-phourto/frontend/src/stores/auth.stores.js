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
    },
});