import { defineStore } from 'pinia';

export const useBookingStore = defineStore('booking', {
    state: () => ({
        // Informasi Cabang & Paket (akan diisi dari BranchDetail)
        selectedBranch: null, // { id: 1, name: 'STUDIO SAIL', slug: 'studio-sail' }
        selectedPackage: null, // { id: 1, room: 'ROOM 1: BASIC', price: 125000, duration: 30 }

        // Pilihan Tanggal & Waktu (akan diisi dari BookingAppointment)
        selectedDate: null, // Objek Date
        selectedTime: null, // String "18.30"

        // Add-ons (akan diisi dari Confirmation)
        additionalPeople: 0,
        addOnPricePerPerson: 15000, // Harga per orang tambahan

        // Data Pengguna (opsional, bisa diambil dari auth store)
        customerDetails: {
            name: '',
            email: '',
            whatsapp: '',
            instagram: '',
        },
        selectedBackground: '',
    }),
    getters: {
        totalAddOnPrice: (state) => state.additionalPeople * state.addOnPricePerPerson,
        grandTotal: (state) => (state.selectedPackage?.price || 0) + state.totalAddOnPrice,
    },
    actions: {
        setBranchAndPackage(branch, pkg) {
            this.selectedBranch = branch;
            this.selectedPackage = pkg;
            // Reset pilihan selanjutnya jika paket/cabang berubah
            this.selectedDate = null;
            this.selectedTime = null;
            this.additionalPeople = 0;
        },
        setDateAndTime(date, time) {
            this.selectedDate = date;
            this.selectedTime = time;
        },
        setAdditionalPeople(count) {
            if (count >= 0) {
                this.additionalPeople = count;
            }
        },
        setCustomerDetails(details) {
            this.customerDetails = { ...this.customerDetails, ...details };
        },
        setSelectedBackground(background) {
            this.selectedBackground = background;
        },
        // Fungsi untuk mereset seluruh state booking (setelah selesai atau dibatalkan)
        resetBooking() {
            this.$reset();
        }
    },
});