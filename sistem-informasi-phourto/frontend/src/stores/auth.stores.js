// File: stores/auth.stores.js
// (DIBUAT BARU - V1.10)
// Tujuan: Mengelola state (status) otentikasi (login, logout, token, user)
//         menggunakan Pinia dan terhubung ke backend V1.9.

import { defineStore } from 'pinia';
import apiClient from '../api/api'; // (Langkah 1) Impor Axios instance kita
import router from '../router';     // Impor router Vue

export const useAuthStore = defineStore('auth', {
    
    // 1. STATE (DATA)
    // Mengambil data dari localStorage saat store pertama kali dibuat
    state: () => ({
        // 'spotToken' dan 'spotUser' HARUS SAMA dengan key di 'api/api.js'
        token: localStorage.getItem('spotToken') || null,
        user: JSON.parse(localStorage.getItem('spotUser')) || null,
        returnUrl: null // Untuk menyimpan halaman yang ingin diakses sebelum login
    }),

    // 2. GETTERS (COMPUTED PROPERTIES)
    getters: {
        isLoggedIn: (state) => !!state.token,
        isAdmin: (state) => !!state.user && state.user.role === 'admin',
        isCustomer: (state) => !!state.user && state.user.role === 'customer'
    },

    // 3. ACTIONS (METHODS)
    actions: {
        
        /**
         * @action login
         * @desc Memanggil API login, menyimpan token & user ke state/localStorage.
         */
        async login(email, password) {
            try {
                // Panggil API (V1.9)
                const response = await apiClient.post('/auth/login', {
                    email: email,
                    password: password
                });

                // Ambil data dari respons backend V1.9 (dari 'ApiResponse.data')
                const { token, user } = response.data.data;

                // 1. Simpan ke state Pinia
                this.token = token;
                this.user = user;

                // 2. Simpan ke localStorage (agar 'apiClient' bisa menemukannya)
                localStorage.setItem('spotToken', token);
                localStorage.setItem('spotUser', JSON.stringify(user));

                // 3. Arahkan (Redirect) pengguna
                // (Arahkan ke 'returnUrl' jika ada, atau ke '/admin/dashboard' jika admin,
                // atau ke '/profile' jika customer)
                const redirectPath = this.returnUrl || (user.role === 'admin' ? '/admin/dashboard' : '/'); // "/profile"
                router.push(redirectPath);
                
                return true; // Sukses

            } catch (error) {
                // 'apiClient' akan menangani error 401/403 (logout otomatis)
                // Ini menangani error 404/400 (misal: "Password salah.")
                const errorMessage = error.response?.data?.message || error.message;
                console.error("Error login:", errorMessage);
                throw new Error(`Login gagal: ${errorMessage}`);
            }
        },

        /**
         * @action register
         * @desc Memanggil API register.
         */
        async register(userData) {
            // userData = { full_name, phone_number, email, password }
            try {
                // Panggil API (V1.9)
                const response = await apiClient.post('/auth/register', userData);
                
                // (Biasanya tidak auto-login setelah register)
                // Arahkan ke halaman login dengan pesan sukses
                router.push({ 
                    name: 'Login', // Asumsi nama rute Anda 'Login'
                    query: { success: 'true' } 
                });
                
                return response.data.message || 'Registrasi berhasil.';

            } catch (error) {
                // Menangani error validasi (misal: "Email sudah terdaftar")
                const errorMessage = error.response?.data?.message || error.message;
                console.error("Error register:", errorMessage);
                throw new Error(`Registrasi gagal: ${errorMessage}`);
            }
        },

        /**
         * @action logout
         * @desc Membersihkan state & localStorage, mengarahkan ke halaman login.
         */
        logout() {
            // 1. Bersihkan state Pinia
            this.token = null;
            this.user = null;
            this.returnUrl = null;

            // 2. Bersihkan localStorage (PENTING)
            localStorage.removeItem('spotToken');
            localStorage.removeItem('spotUser');

            // 3. Arahkan ke halaman login
            router.push('/login');
        }
    }
});

