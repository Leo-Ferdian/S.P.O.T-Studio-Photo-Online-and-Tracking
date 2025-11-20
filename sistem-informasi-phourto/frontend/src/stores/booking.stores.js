import { defineStore } from 'pinia'
import apiClient from '../api/api'
import { useAuthStore } from './auth.stores'
import router from '../router'

/* =================================================================
HELPER V1.14 (Ditambahkan untuk BranchDetail)
================================================================= */

/**
 * Mem-parsing string inklusi dari database.
 */
const parseInclusions = (inclusionsStr) => {
    if (!inclusionsStr) return [];
    return inclusionsStr
        .split('\n')
        .map((item) => item.replace(/^- /, '').trim())
        .filter((item) => item.length > 0);
};

/**
 * SOLUSI V1.14: Memetakan gambar ke NAMA RUANGAN (Room Name Display).
 * Ini 100% stabil dan tidak bergantung pada UUID.
 */
const getRoomImageByName = (roomName) => {
    const roomNameImageLookup = {
        // Panam
        'Room 1 (Basic Plan)': new URL('@/assets/basicpanam.jpg', import.meta.url).href,
        'Room 2 (Blue Purple Fisheye)': new URL('@/assets/bluepurplee.jpg', import.meta.url).href,
        'Room 3 (Blank Space/Spotlight)': new URL('@/assets/blank.jpg', import.meta.url).href,
        'Y2K Concept Room (BLUE)': new URL('@/assets/y2kpanam.jpg', import.meta.url).href,
        'Y2K Concept Room (PINK)': new URL('@/assets/y2kpanam.jpg', import.meta.url).href,

        // Sail
        'Room 1 (Basic)': new URL('@/assets/basicsail.jpg', import.meta.url).href,
        'Room 2 (Fisheye Room)': new URL('@/assets/fisheyesail.jpg', import.meta.url).href,
        'Room 3 (Elevator)': new URL('@/assets/elevatorsail.jpg', import.meta.url).href,
        'Room 4 (Spotlight/Blank Space)': new URL('@/assets/blank.jpg', import.meta.url).href,
        'Y2K Concept Room': new URL('@/assets/y2ksail.jpg', import.meta.url).href,

        // Marpoyan
        'Room 1 (Basic)': new URL('@/assets/basicmarpoyan.jpg', import.meta.url).href,
        'Y2K Concept Room': new URL('@/assets/y2kmarpoyan.jpg', import.meta.url).href,

        // Default
        'default': new URL('@/assets/blank.jpg', import.meta.url).href
    };

    return roomNameImageLookup[roomName] || roomNameImageLookup['default'];
};


// =================================================================
// PINIA STORE
// =================================================================

export const useBookingStore = defineStore('booking', {
    /* ===============================================================
    1. STATE
    =============================================================== */
    state: () => ({
        catalog: [],
        branches: [],

        // State pilihan user
        selectedBranch: null,
        selectedPackage: null,
        selectedDateTime: null,

        // Form Confirmation
        customerDetails: { name: '', email: '', whatsapp: '', instagram: '' },
        selectedBackground: '',
        additionalPeople: 0,

        // Alur booking
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

        // Branch detail
        currentBranchDetails: {
            id: null,
            name: 'Loading...',
            slug: '',
            packages: []
        },

        // --- NEW: HYBRID GALLERY SYSTEM ---
        galleryPhotos: [],       // Menyimpan daftar foto untuk ditampilkan di grid
        galleryBookingInfo: [],
        isGalleryLoading: false, // Loading state khusus galeri
    }),

    /* ===============================================================
    2. GETTERS
    =============================================================== */
    getters: {
        isCatalogLoaded: (state) => state.catalog.length > 0,
        isLoadingCatalog: (state) => state.isLoading && state.catalog.length === 0,

        hasSelectedPackage: (state) =>
            !!state.selectedBranch && !!state.selectedPackage,

        addOnPricePerPerson: () => 25000,

        grandTotal: (state) => {
            const packagePrice = parseFloat(state.selectedPackage?.price) || 0;
            const addonsPrice = state.additionalPeople * 25000;
            return packagePrice + addonsPrice;
        },

        getBookingSummary: (state) => {
            if (!state.selectedBranch || !state.selectedPackage || !state.selectedDateTime)
                return null;
            return {
                branch: state.selectedBranch,
                package: state.selectedPackage,
                dateTime: state.selectedDateTime,
            };
        },
    },

    /* ===============================================================
    3. ACTIONS
    =============================================================== */
    actions: {

        /* -------------------------------------------
        Setters
        ------------------------------------------- */
        setBranchAndPackage(branch, pkg) {
            this.selectedBranch = branch;
            this.selectedPackage = pkg;
        },

        setDateAndTime(dateTime) {
            this.selectedDateTime = dateTime;
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


        /* -------------------------------------------
        Fetch Catalog
        ------------------------------------------- */
        async fetchCatalog() {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiClient.get('/packages/catalog');

                const catalogData = response.data.data?.data;

                if (Array.isArray(catalogData)) {
                    this.catalog = catalogData;
                } else {
                    console.error('Error fetchCatalog: respons bukan array.', response.data.data);
                    this.catalog = [];
                    throw new Error('Data katalog bukan array.');
                }

            } catch (error) {
                const message = error.response?.data?.message || error.message;
                this.error = `Gagal memuat katalog: ${message}`;
            } finally {
                this.isLoading = false;
            }
        },


        /* -------------------------------------------
        Fetch Branches
        ------------------------------------------- */
        async fetchBranches() {
            this.error = null;
            try {
                const response = await apiClient.get('/branches');
                this.branches = response.data.data;
            } catch (error) {
                const message = error.response?.data?.message || error.message;
                this.error = `Gagal memuat cabang: ${message}`;
            }
        },


        /* -------------------------------------------
        FETCH BRANCH DETAILS (V1.14)
        ------------------------------------------- */
        async fetchBranchDetails(branchSlug) {
            this.isLoading = true;
            this.error = null;
            this.currentBranchDetails = { name: 'Memuat...', packages: [] };

            try {
                if (this.catalog.length === 0) await this.fetchCatalog();
                if (this.branches.length === 0) await this.fetchBranches();

                const targetBranch = this.branches.find(
                    b => b.branch_name.toLowerCase().replace(/\s+/g, '-') === branchSlug
                );

                if (!targetBranch)
                    throw new Error(`Cabang "${branchSlug}" tidak ditemukan.`);

                const targetBranchId = targetBranch.branch_id;

                const branchPackages = this.catalog.filter(
                    (pkg) => pkg.branch_id === targetBranchId
                );

                if (branchPackages.length === 0) {
                    this.currentBranchDetails = { name: targetBranch.branch_name, packages: [] };
                    return;
                }

                const roomsMap = new Map();

                for (const pkg of branchPackages) {

                    const templatePlan = {
                        planId: pkg.package_id,
                        planName: pkg.package_name,
                        price: parseFloat(pkg.price),
                        capacity: pkg.capacity,
                        inclusions: parseInclusions(pkg.inclusions),
                        duration: pkg.duration_in_minutes,
                        durationText: pkg.duration,
                        _apiData: pkg,
                    };

                    if (!roomsMap.has(pkg.room_id)) {
                        roomsMap.set(pkg.room_id, {
                            id: pkg.room_id,
                            room: pkg.room_name_display,
                            image: getRoomImageByName(pkg.room_name_display),
                            duration: pkg.duration_in_minutes,
                            plans: [],
                        });
                    }

                    roomsMap.get(pkg.room_id).plans.push(templatePlan);
                }

                this.currentBranchDetails = {
                    id: targetBranch.branch_id,
                    name: targetBranch.branch_name,
                    slug: branchSlug,
                    packages: Array.from(roomsMap.values()),
                };

            } catch (error) {
                const message = error.response?.data?.message || error.message;
                this.error = `Gagal memuat detail cabang: ${message}`;
            } finally {
                this.isLoading = false;
            }
        },


        /* -------------------------------------------
        CHECK AVAILABILITY
        ------------------------------------------- */
        async checkAvailability(packageId, startTime) {
            this.isLoading = true;
            this.error = null;
            this.availability = { isAvailable: null, message: '', slots: [] };

            try {
                const response = await apiClient.get('/bookings/availability', {
                    params: {
                        packageId,
                        startTime: startTime.toISOString(),
                        _: Date.now(),
                    },
                });

                const slotsData =
                    response.data.data.availableSlots || response.data.data || [];

                this.availability.slots = Array.isArray(slotsData) ? slotsData : [];

                this.availability = {
                    isAvailable: true,
                    message: response.data.message,
                    slots: this.availability.slots,
                };

            } catch (error) {
                const status = error.response?.status;
                const message = error.response?.data?.message || error.message;

                if (status === 409) {
                    this.availability = {
                        isAvailable: false,
                        message,
                        slots: [],
                    };
                } else {
                    this.error = `Gagal cek ketersediaan: ${message}`;
                }

            } finally {
                this.isLoading = false;
            }
        },


        /* -------------------------------------------
        CREATE BOOKING
        ------------------------------------------- */
        async createBooking() {
            const bookingData = {
                package_id: this.selectedPackage?.package_id,
                start_time: this.selectedDateTime?.toISOString(),
                addons: [],
            };

            if (!bookingData.package_id || !bookingData.start_time) {
                this.error = 'Data paket atau waktu tidak lengkap.';
                throw new Error('Data paket atau waktu tidak lengkap.');
            }

            this.isLoading = true;
            this.error = null;

            const authStore = useAuthStore();

            if (!authStore.isLoggedIn) {
                this.error = 'Anda harus login untuk membuat pesanan.';
                authStore.returnUrl = router.currentRoute.value.fullPath;
                router.push('/login');
                this.isLoading = false;
                return false;
            }

            try {
                const response = await apiClient.post('/bookings', bookingData);
                this.currentBooking = response.data.data;
                this.availability = { isAvailable: null, message: '', slots: [] };
                return response.data.data;

            } catch (error) {
                const message = error.response?.data?.message || error.message;
                this.error = `Gagal membuat pesanan: ${message}`;
                throw new Error(`Gagal membuat pesanan: ${message}`);

            } finally {
                this.isLoading = false;
            }
        },


        /* -------------------------------------------
        FETCH MY BOOKINGS
        ------------------------------------------- */
        async fetchMyBookings() {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiClient.get('/bookings/my-bookings');
                this.myBookings = response.data.data.data;

            } catch (error) {
                const message = error.response?.data?.message || error.message;
                this.error = `Gagal memuat riwayat pesanan: ${message}`;

            } finally {
                this.isLoading = false;
            }
        },


        /* -------------------------------------------
        PAYMENT QR
        ------------------------------------------- */
        async generatePaymentQR(bookingId) {
            this.isLoading = true;
            this.error = null;

            const authStore = useAuthStore();
            const token = authStore.token || localStorage.getItem('token');

            if (!token) {
                this.error = 'Sesi Anda telah berakhir. Silakan login kembali.';
                this.isLoading = false;
                authStore.returnUrl = router.currentRoute.value.fullPath;
                router.push('/login');
                throw new Error(this.error);
            }

            try {
                const response = await apiClient.post(
                    `/payments/${bookingId}/qr`,
                    {},
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );

                const paymentData = response.data.data;

                if (this.currentBooking && this.currentBooking.booking_id === bookingId) {
                    this.currentBooking.payment_link = paymentData.payment_url;
                    this.currentBooking.total_price_paid =
                        paymentData.total_amount || this.currentBooking.total_price_paid;
                }

                return paymentData;

            } catch (error) {
                const message = error.response?.data?.message || error.message;
                this.error = `Gagal memproses pembayaran: ${message}`;
                throw new Error(this.error);

            } finally {
                this.isLoading = false;
            }
        },

        /* =================================================================
        HYBRID GALLERY SYSTEM (NEW)
        Menggantikan sistem Worker/Lambda ZIP lama.
        ================================================================= */

        /* -------------------------------------------
        1. FETCH GALLERY (Untuk Tampilan Grid)
        ------------------------------------------- */
        async fetchGallery(bookingId, email) {
            this.isGalleryLoading = true;
            this.error = null;
            this.galleryPhotos = [];
            this.galleryBookingInfo = null; // Reset info

            try {
                const response = await apiClient.get(`/photos/${bookingId}/gallery`, {
                    params: { email }
                });

                // Backend sekarang mengirim: { booking: {...}, photos: [...] }
                const result = response.data.data;

                this.galleryPhotos = result.photos || [];
                this.galleryBookingInfo = result.booking || null;

                return result;

            } catch (error) {
                const message = error.response?.data?.message || error.message;
                this.error = message;
                throw error;
            } finally {
                this.isGalleryLoading = false;
            }
        },

        /* -------------------------------------------
        2. GET ZIP URL (Untuk Tombol Download All)
        Membangun URL untuk streaming ZIP langsung
        ------------------------------------------- */
        getZipDownloadUrl(bookingId, email) {
            // Kita perlu menyusun URL lengkap karena ini akan dibuka via window.location
            // Pastikan VITE_API_URL di .env mengarah ke backend (misal http://localhost:3000/api)
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            return `${baseURL}/photos/${bookingId}/download-zip?email=${encodeURIComponent(email)}`;
        }
    }
});