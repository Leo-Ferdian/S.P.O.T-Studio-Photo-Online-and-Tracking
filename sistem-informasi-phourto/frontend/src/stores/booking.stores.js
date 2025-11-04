// File: stores/booking.stores.js
// (DIPERBARUI - V1.13)
// Tujuan: Mengelola state (status) katalog, ketersediaan, dan pesanan
//         serta mengimplementasikan logika Unduh ZIP Asynchronous.

import { defineStore } from 'pinia'
import apiClient from '../api/api'
import { useAuthStore } from './auth.stores'
import router from '../router'

export const useBookingStore = defineStore('booking', {
    // === 1. STATE (DATA) ===
    state: () => ({
        catalog: [],
        branches: [],

        // --- PENYESUAIAN: State baru untuk Pilihan User ---
        selectedBranch: null, // Info cabang yang dipilih
        selectedPackage: null, // Info paket yang dipilih
        selectedDateTime: null, // Objek Date lengkap
        // ---------------------------------------------------

        // Untuk alur booking
        availability: {
            isAvailable: null,
            message: '',
            slots: [], // Slot waktu yang tersedia
        },
        currentBooking: null,
        myBookings: [],

        // Status UI
        isLoading: false,
        error: null,

        // --- State ZIP ---
        zipStatus: {
            status: null,
            message: '',
            downloadUrl: null,
        },
    }),

    // === 2. GETTERS ===
    getters: {
        isCatalogLoaded: (state) => state.catalog.length > 0,
        isLoadingCatalog: (state) => state.isLoading && state.catalog.length === 0,
        isZipReady: (state) =>
            state.zipStatus.status === 'READY' && state.zipStatus.downloadUrl,
        isZipProcessing: (state) => state.zipStatus.status === 'PROCESSING',

        // --- Getter tambahan ---
        hasSelectedPackage: (state) =>
            !!state.selectedBranch && !!state.selectedPackage,

        getBookingSummary: (state) => {
            if (
                !state.selectedBranch ||
                !state.selectedPackage ||
                !state.selectedDateTime
            ) {
                return null
            }
            return {
                branch: state.selectedBranch,
                package: state.selectedPackage,
                dateTime: state.selectedDateTime,
            }
        },
    },

    // === 3. ACTIONS ===
    actions: {
        /**
         * Menyimpan pilihan cabang dan paket (dipanggil dari BranchDetail.vue)
         */
        setBranchAndPackage(branch, pkg) {
            this.selectedBranch = branch
            this.selectedPackage = pkg
        },

        /**
         * Menyimpan waktu booking (dipanggil dari BookingAppointment.vue)
         */
        setDateAndTime(dateTime) {
            this.selectedDateTime = dateTime
        },

        /**
         * Mengambil katalog paket
         */
        async fetchCatalog() {
            this.isLoading = true
            this.error = null
            try {
                const response = await apiClient.get('/packages/catalog')
                this.catalog = response.data.data
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.error = `Gagal memuat katalog: ${message}`
                console.error('Error fetchCatalog:', message)
            } finally {
                this.isLoading = false
            }
        },

        /**
         * Mengambil daftar cabang
         */
        async fetchBranches() {
            this.error = null
            try {
                const response = await apiClient.get('/branches')
                this.branches = response.data.data
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.error = `Gagal memuat cabang: ${message}`
                console.error('Error fetchBranches:', message)
            }
        },

        /**
        * Mengecek ketersediaan jadwal
        */
        async checkAvailability(packageId, startTime) {
            this.isLoading = true
            this.error = null
            this.availability = { isAvailable: null, message: '', slots: [] } // Reset ke array kosong

            try {
                const response = await apiClient.get('/bookings/availability', {
                    params: {
                        packageId,
                        startTime: startTime.toISOString(),
                    },
                })

                // --- TAMBAHAN DEBUGGING ---
                // Ini akan memberi tahu kita struktur data yang sebenarnya di konsol
                console.log("Respons API Ketersediaan:", response.data);
                // ---------------------------

                // Kembalikan ke logika asli Anda (atau yang mendekati)
                // Kita asumsikan array slot ada di 'response.data.data' ATAU 'response.data.data.availableSlots'
                const slotsData = response.data.data.availableSlots || response.data.data || [];

                // Pastikan 'slotsData' adalah array
                if (!Array.isArray(slotsData)) {
                    console.warn("Data slot yang diterima BUKAN array, mengosongkan slot.");
                    this.availability.slots = [];
                } else {
                    this.availability.slots = slotsData;
                }

                this.availability.isAvailable = true;
                this.availability.message = response.data.message;

            } catch (error) {
                const status = error.response?.status
                const message = error.response?.data?.message || error.message
                console.error("Error checkAvailability:", error.response || error);

                if (status === 409) {
                    this.availability = {
                        isAvailable: false,
                        message,
                        slots: [], // Pastikan tetap array
                    }
                } else {
                    this.error = `Gagal cek ketersediaan: ${message}`
                    // Pastikan 'slots' tetap array kosong jika ada error lain
                    this.availability.slots = [];
                }
            } finally {
                this.isLoading = false
            }
        },

        /**
         * Membuat pesanan baru
         */
        async createBooking() {
            const bookingData = {
                package_id: this.selectedPackage?.package_id,
                start_time: this.selectedDateTime?.toISOString(),
                addons: [], // Tambahkan addons di sini bila perlu
            }

            // Validasi
            if (!bookingData.package_id || !bookingData.start_time) {
                this.error = 'Data paket atau waktu tidak lengkap.'
                console.error(
                    'CreateBooking Error: Data tidak lengkap',
                    this.selectedPackage,
                    this.selectedDateTime
                )
                throw new Error('Data paket atau waktu tidak lengkap.')
            }

            this.isLoading = true
            this.error = null

            // Cek login
            const authStore = useAuthStore()
            if (!authStore.isLoggedIn) {
                this.error = 'Anda harus login untuk membuat pesanan.'
                this.isLoading = false
                authStore.returnUrl = router.currentRoute.value.fullPath
                router.push('/login')
                return false
            }

            // Panggil API
            try {
                const response = await apiClient.post('/bookings', bookingData)
                this.currentBooking = response.data.data
                this.availability = { isAvailable: null, message: '', slots: [] }
                return response.data.data
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.error = `Gagal membuat pesanan: ${message}`
                console.error('Error createBooking:', message)
                throw new Error(`Gagal membuat pesanan: ${message}`)
            } finally {
                this.isLoading = false
            }
        },

        /**
         * Mengambil riwayat pesanan
         */
        async fetchMyBookings() {
            this.isLoading = true
            this.error = null
            try {
                const response = await apiClient.get('/bookings/my-bookings')
                this.myBookings = response.data.data.data
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.error = `Gagal memuat riwayat pesanan: ${message}`
                console.error('Error fetchMyBookings:', message)
            } finally {
                this.isLoading = false
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