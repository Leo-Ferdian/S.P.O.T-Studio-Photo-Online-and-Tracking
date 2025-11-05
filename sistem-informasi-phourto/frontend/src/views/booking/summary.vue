<script setup>
import { onMounted, computed, nextTick } from 'vue'
import { useBookingStore } from '../../stores/booking.stores'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import feather from 'feather-icons'

// === STORE & ROUTER ===
const bookingStore = useBookingStore()
const router = useRouter()

// =================================================================
// === PERBAIKAN DI SINI ===
// =================================================================
// Ambil SEMUA data yang mungkin kita perlukan untuk fallback
const {
    currentBooking,   // (Hasil dari 'createBooking')
    selectedBranch,   // (Fallback untuk nama cabang)
    selectedPackage   // (Fallback untuk nama paket)
} = storeToRefs(bookingStore)
// =================================================================
// === AKHIR PERBAIKAN ===
// =================================================================


// === PENTING: GUARD CLAUSE ===
onMounted(() => {
    // Jika tidak ada data booking (misal: pengguna me-refresh halaman),
    // jangan tampilkan halaman ini. Arahkan kembali ke beranda.
    if (!currentBooking.value && !selectedPackage.value) { // (Dibuat lebih aman)
        console.warn("Tidak ada data booking. Mengarahkan ke beranda.");
        router.push('/');
        return; // Hentikan eksekusi
    }

    // Jika data ada, tampilkan ikon
    nextTick(() => feather.replace())
})

// === UTIL: Format Mata Uang ===
const formatCurrency = (value) => {
    if (typeof value !== 'number') {
        value = parseFloat(value || 0); // Coba konversi string ke angka
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value)
}

// === UTIL: Format Waktu ===
const formattedDateTime = computed(() => {
    // Prioritaskan 'start_time' dari API, fallback ke 'selectedDateTime' dari store
    const timeData = currentBooking.value?.start_time || bookingStore.selectedDateTime
    if (!timeData) return 'Waktu tidak valid'

    const date = new Date(timeData)

    if (isNaN(date.getTime())) return 'Format Waktu Salah';

    return date.toLocaleString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
})

// === Navigasi ===
const goToHome = () => {
    router.push('/');
}
const goToMyBookings = () => {
    router.push('/my-bookings'); // (Pastikan rute ini ada)
}

// Helper untuk mengambil data dengan aman (avoiding crash)
const getBookingData = (key, fallback) => {
    return currentBooking.value?.[key] || fallback || 'N/A';
}

</script>

<template>
    <div class="bg-background min-h-screen text-text-default pt-24 pb-12">
        <main class="container mx-auto px-4 max-w-2xl">
            <div class="flex items-center justify-between mb-12">
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <button @click="goToHome"
                            class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                            <i data-feather="home" class="w-6 h-6"></i>
                        </button>
                    </div>
                </div>
                <div class="flex-1 text-center">
                    <h1 class="text-3xl font-bold">Pemesanan Berhasil</h1>
                </div>
                <div class="flex-1"></div>
            </div>

            <div v-if="currentBooking || selectedPackage"
                class="bg-white text-black p-6 md:p-8 border-4 border-outline space-y-6">

                <div class="text-center space-y-2">
                    <i data-feather="check-circle" class="w-16 h-16 text-green-500 mx-auto"></i>
                    <h2 class="text-2xl font-bold">
                        Terima Kasih, {{ getBookingData('customer_name', bookingStore.customerDetails.name ||
                            'Pelanggan') }}!
                    </h2>
                    <p class="text-gray-600">Pemesanan Anda telah kami terima dan berhasil dikonfirmasi.</p>
                    <p class="text-sm">
                        Kode Booking: <span class="font-mono bg-gray-100 p-1">{{ getBookingData('booking_id', 'N/A')
                        }}</span>
                    </p>
                </div>

                <hr class="border-b-2 border-outline border-dashed" />

                <div class="space-y-4">
                    <h3 class="text-xl font-bold">Detail Pesanan</h3>

                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="font-semibold">Studio:</div>
                        <div>{{ getBookingData('branch_name', selectedBranch?.name) }}</div>

                        <div class="font-semibold">Paket:</div>
                        <div>{{ getBookingData('package_name', selectedPackage?.package_name) }}</div>

                        <div class="font-semibold">Jadwal:</div>
                        <div>{{ formattedDateTime }}</div>

                        <div class="font-semibold">Status Pembayaran:</div>
                        <div class="font-bold">{{ getBookingData('payment_status', 'PENDING') }}</div>

                        <div class="font-semibold">Add-ons:</div>
                        <div>
                            <p>Background: {{getBookingData('addons', []).find(a => a.type === 'background')?.value ||
                                bookingStore.selectedBackground || 'Tidak ada'}}</p>
                            <p>Tambahan Orang: {{getBookingData('addons', []).find(a => a.type ===
                                'additional_people')?.value || bookingStore.additionalPeople || 0}}</p>
                        </div>
                    </div>

                </div>

                <hr class="border-b-2 border-outline border-dashed" />

                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold">TOTAL</span>
                    <span class="text-2xl font-bold">{{ formatCurrency(currentBooking?.total_price || grandTotal)
                    }}</span>
                </div>

                <div class="pt-4 space-y-3">
                    <p class="text-xs text-center text-gray-500">
                        Detail pesanan juga telah dikirimkan ke email Anda. Silakan cek riwayat pesanan Anda untuk
                        melihat detail.
                    </p>
                    <button @click="goToMyBookings"
                        class="w-full bg-primary text-text-default font-bold text-lg py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                        Lihat Riwayat Pesanan Saya
                    </button>
                    <button @click="goToHome"
                        class="w-full bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                        Kembali ke Beranda
                    </button>
                </div>

            </div>

            <div v-else class="text-center py-16">
                <h2 class="text-2xl font-bold">Memuat data pesanan...</h2>
                <p>Jika halaman tidak berubah, sesi Anda mungkin telah berakhir.</p>
            </div>

        </main>
    </div>
</template>