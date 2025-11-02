// File: stores/booking.stores.js
// (DIPERBARUI - V1.13)
// Tujuan: Mengelola state (status) katalog, ketersediaan, dan pesanan
//         serta mengimplementasikan logika Unduh ZIP Asynchronous.

import { defineStore } from 'pinia';
import apiClient from '../api/api'; // (Langkah 1) Impor Axios instance kita
import { useAuthStore } from './auth.stores'; // (Langkah 2) Impor Auth Store

export const useBookingStore = defineStore('booking', {
    
    // 1. STATE (DATA)
    state: () => ({
        catalog: [], // Untuk GET /api/packages/catalog
        branches: [], // Untuk GET /api/branches
        
        // Untuk alur booking
        availability: {
            isAvailable: null, // null, true, atau false
            message: ''
        },
        currentBooking: null, // Menyimpan booking yang baru dibuat
        myBookings: [], // Riwayat pesanan pelanggan

        // Status UI
        isLoading: false,
        error: null,

        // --- STATE BARU V1.13 ---
        zipStatus: {
            status: null, // 'PENDING', 'PROCESSING', 'READY', 'FAILED'
            message: '',
            downloadUrl: null
        }
    }),

    // 2. GETTERS (COMPUTED PROPERTIES)
    getters: {
        isCatalogLoaded: (state) => state.catalog.length > 0,
        isLoadingCatalog: (state) => state.isLoading && state.catalog.length === 0,
        // Getter untuk status ZIP
        isZipReady: (state) => state.zipStatus.status === 'READY' && state.zipStatus.downloadUrl,
        isZipProcessing: (state) => state.zipStatus.status === 'PROCESSING'
    },

    // 3. ACTIONS (METHODS)
    actions: {
        
        /**
         * @action fetchCatalog
         * @desc Mengambil katalog lengkap (Join 4-tabel) dari rute publik.
         */
        async fetchCatalog() {
            this.isLoading = true;
            this.error = null;
            try {
                // Panggil API (V1.11 - Rute Publik)
                const response = await apiClient.get('/packages/catalog');
                this.catalog = response.data.data;
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                this.error = `Gagal memuat katalog: ${errorMessage}`;
                console.error("Error fetchCatalog:", errorMessage);
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * @action fetchBranches
         * @desc Mengambil daftar cabang (untuk filter) dari rute publik.
         */
        async fetchBranches() {
            this.error = null;
            try {
                // Panggil API (V1.11 - Rute Publik)
                const response = await apiClient.get('/branches');
                this.branches = response.data.data;
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                this.error = `Gagal memuat cabang: ${errorMessage}`;
                console.error("Error fetchBranches:", errorMessage);
            }
        },

        /**
         * @action checkAvailability
         * @desc Mengecek ketersediaan slot (Area 4)
         */
        async checkAvailability(packageId, startTime) {
            this.isLoading = true;
            this.error = null;
            this.availability = { isAvailable: null, message: '' }; // Reset
            
            try {
                // Panggil API (V1.9.7 - Memerlukan Query Params & camelCase)
                const response = await apiClient.get('/bookings/availability', {
                    params: {
                        packageId: packageId,
                        startTime: startTime
                    }
                });
                
                // 200 OK
                this.availability = {
                    isAvailable: true,
                    message: response.data.message
                };
                
            } catch (error) {
                const status = error.response?.status;
                const errorMessage = error.response?.data?.message || error.message;
                
                if (status === 409) { // 409 Conflict (Slot bentrok)
                    this.availability = {
                        isAvailable: false,
                        message: errorMessage
                    };
                } else {
                    this.error = `Gagal cek ketersediaan: ${errorMessage}`;
                }
                console.error("Error checkAvailability:", errorMessage);
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * @action createBooking
         * @desc Membuat pesanan baru (Area 4)
         */
        async createBooking(bookingData) {
            // bookingData = { package_id, start_time, addons: [] }
            // (Validator V1.9.8 memerlukan snake_case)
            
            this.isLoading = true;
            this.error = null;
            
            // Memastikan auth token sudah ada (diambil otomatis oleh apiClient)
            const authStore = useAuthStore();
            if (!authStore.isLoggedIn) {
                this.error = "Anda harus login untuk membuat pesanan.";
                this.isLoading = false;
                return false;
            }
            
            try {
                // Panggil API (V1.9.8)
                const response = await apiClient.post('/bookings', bookingData);
                
                // 201 Created
                this.currentBooking = response.data.data;
                this.myBookings.push(this.currentBooking); // Tambahkan ke riwayat
                this.availability = { isAvailable: null, message: '' }; // Reset availability
                
                return response.data.data; // Kembalikan data booking baru

            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                this.error = `Gagal membuat pesanan: ${errorMessage}`;
                console.error("Error createBooking:", errorMessage);
                throw new Error(`Gagal membuat pesanan: ${errorMessage}`);
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * @action fetchMyBookings
         * @desc Mengambil riwayat pesanan pelanggan yang sedang login
         */
        async fetchMyBookings() {
            this.isLoading = true;
            this.error = null;
            try {
                // Panggil API (V1.10)
                const response = await apiClient.get('/bookings/my-bookings');
                this.myBookings = response.data.data.data; // (Data ada di dalam 'data.data')
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                this.error = `Gagal memuat riwayat pesanan: ${errorMessage}`;
                console.error("Error fetchMyBookings:", errorMessage);
            } finally {
                this.isLoading = false;
            }
        },
        
        // =================================================================
        // IMPLEMENTASI TODO V1.13: Actions (Aksi) ZIP Download
        // =================================================================

        /**
         * @action triggerZipDownload
         * @desc Memanggil 'POST /api/photos/:bookingId/download' untuk memulai proses ZIP.
         */
        async triggerZipDownload(bookingId) {
            this.isLoading = true;
            this.error = null;
            // Set status ke PROCESSING segera untuk feedback UI
            this.zipStatus = { status: 'PROCESSING', message: 'Memicu pembuatan file ZIP...', downloadUrl: null };
            
            try {
                // Panggil API (V1.13)
                const response = await apiClient.post(`/photos/${bookingId}/download`);
                const data = response.data.data;
                
                // Update state (status) dengan respons dari server (seharusnya 'PROCESSING')
                this.zipStatus = { ...this.zipStatus, ...data }; 
                
                return data; // Kembalikan status (cth: { status: 'PROCESSING', ... })

            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                this.error = `Gagal memicu ZIP: ${errorMessage}`;
                this.zipStatus = { status: 'FAILED', message: errorMessage, downloadUrl: null };
                console.error("Error triggerZipDownload:", errorMessage);
                throw new Error(`Gagal memicu ZIP: ${errorMessage}`);
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * @action checkZipStatus
         * @desc Memanggil 'GET /api/photos/:bookingId/download-status' untuk polling.
         */
        async checkZipStatus(bookingId) {
            // Kita tidak set isLoading=true di sini, agar polling bisa berjalan di latar belakang
            // tanpa memblokir UI.
            this.error = null; 
            
            try {
                // Panggil API (V1.13)
                const response = await apiClient.get(`/photos/${bookingId}/download-status`);
                const data = response.data.data;

                // Update state (status) dengan status terbaru dari server
                this.zipStatus = data; 
                
                return data; // Kembalikan status (cth: { status: 'READY', downloadUrl: '...' })

            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                // Jangan set error utama, cukup di zipStatus
                this.zipStatus = { status: 'FAILED', message: errorMessage, downloadUrl: null };
                console.error("Error checkZipStatus:", errorMessage);
                throw new Error(`Gagal mengecek status ZIP: ${errorMessage}`);
            }
        }
    }
});