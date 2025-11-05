// File: stores/booking.stores.js
// (Versi Rapi — Mengelola alur Booking & Pembayaran global)

import { defineStore } from 'pinia'
import apiClient from '../api/api'
import { useAuthStore } from './auth.stores'
import router from '../router'

export const useBookingStore = defineStore('booking', {
    // ==========================================================
    // === 1. STATE (DATA) ======================================
    // ==========================================================
    state: () => ({
        catalog: [],
        branches: [],

        // Pilihan user
        selectedBranch: null,
        selectedPackage: null,
        selectedDateTime: null,

        // Detail tambahan
        customerDetails: { name: '', email: '', whatsapp: '', instagram: '' },
        selectedBackground: '',
        additionalPeople: 0,

        // Opsi pembayaran
        paymentOption: 'FULL', // 'FULL' atau 'DP'
        addOnPricePerPerson: 25000, // Harga add-on per orang

        // Data status & proses
        availability: { isAvailable: null, message: '', slots: [] },
        currentBooking: null,
        myBookings: [],
        isLoading: false,
        error: null,

        // ZIP Download status
        zipStatus: { status: null, message: '', downloadUrl: null },
    }),

    // ==========================================================
    // === 2. GETTERS ===========================================
    // ==========================================================
    getters: {
        isCatalogLoaded: (state) => state.catalog.length > 0,
        isLoadingCatalog: (state) => state.isLoading && state.catalog.length === 0,

        isZipReady: (state) =>
            state.zipStatus.status === 'READY' && state.zipStatus.downloadUrl,
        isZipProcessing: (state) => state.zipStatus.status === 'PROCESSING',

        hasSelectedPackage: (state) =>
            !!state.selectedBranch && !!state.selectedPackage,

        // ---- Perhitungan Harga ----
        packageBasePrice: (state) =>
            parseFloat(state.selectedPackage?.price) || 0,

        packageDpPrice: (state) =>
            (parseFloat(state.selectedPackage?.price) || 0) * 0.5,

        addonsTotalPrice: (state) =>
            state.additionalPeople * state.addOnPricePerPerson,

        /**
         * Hitung total harga akhir yang harus dibayar sekarang
         * berdasarkan opsi pembayaran (DP / FULL)
         */
        grandTotal: (state) => {
            const packagePrice = parseFloat(state.selectedPackage?.price) || 0
            const addons = state.additionalPeople * state.addOnPricePerPerson

            if (state.paymentOption === 'DP') {
                const dp = packagePrice * 0.5
                return dp + addons
            }
            return packagePrice + addons
        },

        // Ringkasan data booking untuk tampilan konfirmasi
        getBookingSummary: (state) => {
            if (
                !state.selectedBranch ||
                !state.selectedPackage ||
                !state.selectedDateTime
            )
                return null

            return {
                branch: state.selectedBranch,
                package: state.selectedPackage,
                dateTime: state.selectedDateTime,
            }
        },
    },

    // ==========================================================
    // === 3. ACTIONS ===========================================
    // ==========================================================
    actions: {
        // ---- Setters ----
        setBranchAndPackage(branch, pkg) {
            this.selectedBranch = branch
            this.selectedPackage = pkg
        },

        setDateAndTime(dateTime) {
            this.selectedDateTime = dateTime
        },

        setCustomerDetails(details) {
            this.customerDetails = details
        },

        setSelectedBackground(bg) {
            this.selectedBackground = bg
        },

        setAdditionalPeople(count) {
            this.additionalPeople = Number(count) || 0
        },

        setPaymentOption(option) {
            this.paymentOption = option // 'DP' atau 'FULL'
        },

        // ---- Fetch Data ----
        async fetchCatalog() {
            this.isLoading = true
            this.error = null
            try {
                const response = await apiClient.get('/packages/catalog')
                this.catalog = response.data.data
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.error = `Gagal memuat katalog: ${message}`
            } finally {
                this.isLoading = false
            }
        },

        async fetchBranches() {
            this.error = null
            try {
                const response = await apiClient.get('/branches')
                this.branches = response.data.data
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.error = `Gagal memuat cabang: ${message}`
            }
        },

        async checkAvailability(packageId, startTime) {
            this.isLoading = true
            this.error = null
            this.availability = { isAvailable: null, message: '', slots: [] }

            try {
                const response = await apiClient.get('/bookings/availability', {
                    params: { packageId, startTime: startTime.toISOString() },
                })

                const slots = response.data.data.availableSlots
                if (Array.isArray(slots) && slots.length > 0) {
                    this.availability.slots = slots
                    this.availability.isAvailable = true
                } else {
                    this.availability.slots = []
                    this.availability.isAvailable = false
                }
                this.availability.message = response.data.message
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.availability = { isAvailable: false, message, slots: [] }
            } finally {
                this.isLoading = false
            }
        },

        // ---- Create Booking ----
        async createBooking() {
            // Validasi waktu
            if (
                !this.selectedDateTime ||
                !(this.selectedDateTime instanceof Date) ||
                isNaN(this.selectedDateTime.getTime())
            ) {
                this.error = 'Waktu booking tidak valid.'
                throw new Error('Invalid booking time.')
            }

            // Ambil data lengkap dari state
            const bookingData = {
                package_id: this.selectedPackage?.package_id,
                start_time: this.selectedDateTime.toISOString(),
                customer_name: this.customerDetails.name,
                customer_email: this.customerDetails.email,
                customer_whatsapp: this.customerDetails.whatsapp,
                customer_instagram: this.customerDetails.instagram,
                addons: [
                    { type: 'background', value: this.selectedBackground },
                    { type: 'additional_people', value: this.additionalPeople },
                ],
                payment_type: this.paymentOption,
                total_price_paid: this.grandTotal,
            }

            if (!bookingData.package_id) {
                this.error = 'Data paket tidak lengkap.'
                throw new Error('Data paket tidak lengkap.')
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

            try {
                const response = await apiClient.post('/bookings', bookingData)
                this.currentBooking = response.data.data
                this.availability = { isAvailable: null, message: '', slots: [] }
                return response.data.data
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.error = `Gagal membuat pesanan: ${message}`
                throw new Error(`Gagal membuat pesanan: ${message}`)
            } finally {
                this.isLoading = false
            }
        },

        // ---- Riwayat Booking ----
        async fetchMyBookings() {
            this.isLoading = true
            this.error = null
            try {
                const response = await apiClient.get('/bookings/my-bookings')
                this.myBookings = response.data.data.data
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.error = `Gagal memuat riwayat pesanan: ${message}`
            } finally {
                this.isLoading = false
            }
        },

        // ---- ZIP Download ----
        async triggerZipDownload(bookingId) {
            this.isLoading = true
            this.error = null
            this.zipStatus = {
                status: 'PROCESSING',
                message: 'Memicu pembuatan file ZIP...',
                downloadUrl: null,
            }

            try {
                const response = await apiClient.post(`/photos/${bookingId}/download`)
                const data = response.data.data
                this.zipStatus = { ...this.zipStatus, ...data }
                return data
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.error = `Gagal memicu ZIP: ${message}`
                this.zipStatus = { status: 'FAILED', message, downloadUrl: null }
                throw new Error(`Gagal memicu ZIP: ${message}`)
            } finally {
                this.isLoading = false
            }
        },

        async checkZipStatus(bookingId) {
            this.error = null
            try {
                const response = await apiClient.get(
                    `/photos/${bookingId}/download-status`
                )
                this.zipStatus = response.data.data
                return response.data.data
            } catch (error) {
                const message = error.response?.data?.message || error.message
                this.zipStatus = { status: 'FAILED', message, downloadUrl: null }
                throw new Error(`Gagal mengecek status ZIP: ${message}`)
            }
        },
    },
})
