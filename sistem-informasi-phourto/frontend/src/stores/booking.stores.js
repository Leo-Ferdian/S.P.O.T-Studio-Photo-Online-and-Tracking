import { defineStore } from 'pinia'
import apiClient from '../api/api'
import { useAuthStore } from './auth.stores'
import router from '../router'

export const useBookingStore = defineStore('booking', {
    // === 1. STATE (DATA) ===
    state: () => ({
        catalog: [],
        branches: [],

        // State baru untuk Pilihan User 
        selectedBranch: null,
        selectedPackage: null,
        selectedDateTime: null,

        // State dari form Confirmation.vue
        customerDetails: { name: '', email: '', whatsapp: '', instagram: '' },
        selectedBackground: '',
        additionalPeople: 0,

        // Untuk alur booking
        availability: {
            isAvailable: null,
            message: '',
            slots: [],
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
        isZipReady: (state) => state.zipStatus.status === 'READY' && state.zipStatus.downloadUrl,
        isZipProcessing: (state) => state.zipStatus.status === 'PROCESSING',

        // --- Getter tambahan ---
        hasSelectedPackage: (state) =>
            !!state.selectedBranch && !!state.selectedPackage,

        // Getter yang digunakan oleh Confirmation.vue
        addOnPricePerPerson: (state) => 25000,
        grandTotal: (state) => {
            const packagePrice = parseFloat(state.selectedPackage?.price) || 0;
            const addonsPrice = state.additionalPeople * (state.addOnPricePerPerson || 25000);
            return packagePrice + addonsPrice;
        },

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
        setCustomerDetails(details) {
            this.customerDetails = details;
        },
        setSelectedBackground(bg) {
            this.selectedBackground = bg;
        },
        setAdditionalPeople(count) {
            this.additionalPeople = count;
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
            this.availability = { isAvailable: null, message: '', slots: [] }

            try {
                const response = await apiClient.get('/bookings/availability', {
                    params: {
                        packageId,
                        startTime: startTime.toISOString(),
                        _: new Date().getTime()
                    },
                })

                const slotsData = response.data.data.availableSlots || response.data.data || [];

                if (!Array.isArray(slotsData)) {
                    console.warn("Data slot yang diterima BUKAN array, mengosongkan slot.");
                    this.availability.slots = [];
                } else {
                    this.availability.slots = slotsData;
                }

                this.availability = {
                    isAvailable: true,
                    message: response.data.message,
                    slots: slotsData
                };

            } catch (error) {
                const status = error.response?.status
                const message = error.response?.data?.message || error.message
                console.error("Error checkAvailability:", error.response || error);

                if (status === 409) {
                    this.availability = {
                        isAvailable: false,
                        message,
                        slots: [],
                    }
                } else {
                    this.error = `Gagal cek ketersediaan: ${message}`
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
                addons: [],
            }

            if (!bookingData.package_id || !bookingData.start_time) {
                this.error = 'Data paket atau waktu tidak lengkap.'
                console.error('CreateBooking Error: Data tidak lengkap')
                throw new Error('Data paket atau waktu tidak lengkap.')
            }

            this.isLoading = true
            this.error = null

            const authStore = useAuthStore()
            if (!authStore.isLoggedIn) {
                this.error = 'Anda harus login untuk membuat pesanan.'
                this.isLoading = false
                authStore.returnUrl = router.currentRoute.value.fullPath
                router.push('/login')
                return false
            }

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
        // ACTION PEMBAYARAN QRIS (FINAL PATH FIX: MENGGUNAKAN PLURAL /payments)
        // =================================================================

        /**
         * @action generatePaymentQR
         * @desc Memanggil API untuk generate QR code DOKU/QRIS.
         * @param {string} bookingId - ID booking yang akan dibayar.
         */
        async generatePaymentQR(bookingId) {
            this.isLoading = true;
            this.error = null;
            try {
                // *** FIX KRITIS: MENGGUNAKAN PLURAL /payments SESUAI DENGAN BACKEND APP.USE ***
                const response = await apiClient.post(`/payments/${bookingId}/qr`);

                const paymentData = response.data.data;

                // Update data booking di state (agar Payment.vue bisa me-refresh)
                if (this.currentBooking && this.currentBooking.booking_id === bookingId) {
                    this.currentBooking.payment_qr_url = paymentData.qr_code_url;
                    this.currentBooking.payment_deadline = paymentData.expires_at;
                    // Update total price yang dibayar berdasarkan respons backend (jika ada)
                    this.currentBooking.total_price_paid = paymentData.total_amount || this.currentBooking.total_price_paid;
                }

                return paymentData;
            } catch (error) {
                const message = error.response?.data?.message || error.message || 'Error tidak diketahui.';
                this.error = `Gagal membuat QR Pembayaran: ${message}`;
                console.error('Error generatePaymentQR:', message);
                throw new Error(`Gagal membuat QR Pembayaran: ${message}`);
            } finally {
                this.isLoading = false;
            }
        },

        // =================================================================
        // IMPLEMENTASI ZIP Download (TETAP)
        // =================================================================

        /**
         * @action triggerZipDownload
         * @desc Memanggil 'POST /api/photos/:bookingId/download' untuk memulai proses ZIP.
         */
        async triggerZipDownload(bookingId) {
            this.isLoading = true;
            this.error = null;
            this.zipStatus = { status: 'PROCESSING', message: 'Memicu pembuatan file ZIP...', downloadUrl: null };

            try {
                const response = await apiClient.post(`/photos/${bookingId}/download`);
                const data = response.data.data;

                this.zipStatus = { ...this.zipStatus, ...data };

                return data;

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
            this.error = null;

            try {
                const response = await apiClient.get(`/photos/${bookingId}/download-status`);
                const data = response.data.data;

                this.zipStatus = data;

                return data;

            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                this.zipStatus = { status: 'FAILED', message: errorMessage, downloadUrl: null };
                console.error("Error checkZipStatus:", errorMessage);
                throw new Error(`Gagal mengecek status ZIP: ${errorMessage}`);
            }
        }
    }
});