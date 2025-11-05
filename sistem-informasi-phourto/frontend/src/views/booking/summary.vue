<script setup>
import { onMounted, computed, ref, nextTick, onUnmounted } from 'vue'
import { useBookingStore } from '../../stores/booking.stores'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import feather from 'feather-icons'

// === STORE & ROUTER ===
const bookingStore = useBookingStore()
const router = useRouter()

// === DATA DARI STORE ===
const {
    currentBooking,
    selectedBranch,
    selectedPackage
} = storeToRefs(bookingStore)

// === STATE LOKAL UNTUK COUNTDOWN ===
const countdown = ref('01:00:00')
const showCountdown = ref(false) // <-- PERBAIKAN: State untuk menampilkan/menyembunyikan timer
let countdownTimer = null

// === PENTING: GUARD CLAUSE & SETUP COUNTDOWN ===
onMounted(() => {
    if (!currentBooking.value) {
        console.warn("Tidak ada data booking saat ini. Mengarahkan ke beranda.");
        router.push('/');
        return;
    }

    // 2. Setup Countdown Timer
    const expiryTimestamp = currentBooking.value.expires_at
    if (expiryTimestamp) {
        startCountdown(expiryTimestamp)
        showCountdown.value = true // <-- Tampilkan timer
    } else {
        // BUG 1 DITANGANI: 'expires_at' tidak ada
        console.warn("Booking tidak memiliki 'expires_at'. Countdown tidak akan dimulai.");
        showCountdown.value = false // <-- Sembunyikan timer
        countdown.value = "N/A";
    }

    // 3. Tampilkan ikon
    nextTick(() => feather.replace())
})

onUnmounted(() => {
    if (countdownTimer) {
        clearInterval(countdownTimer)
    }
})

// === FUNGSI COUNTDOWN ===
const startCountdown = (expiryTimestamp) => {
    // ... (Fungsi ini tidak berubah, sudah benar)
    const expiryDate = new Date(expiryTimestamp).getTime();
    countdownTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = expiryDate - now;
        if (distance < 0) {
            clearInterval(countdownTimer);
            countdown.value = "WAKTU HABIS";
        } else {
            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            countdown.value =
                String(hours).padStart(2, '0') + ':' +
                String(minutes).padStart(2, '0') + ':' +
                String(seconds).padStart(2, '0');
        }
    }, 1000);
}


// =================================================================
// === PERBAIKAN BUG NaN DI SINI ===
// =================================================================
const formatCurrency = (value) => {
    // Coba parse 'value' menjadi angka
    let numValue = parseFloat(value);

    // Jika hasilnya NaN (misal: parseFloat("Belum Lunas") atau parseFloat(null)),
    // set nilainya ke 0
    if (isNaN(numValue)) {
        numValue = 0;
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(numValue) // Gunakan numValue yang sudah aman
}
// =================================================================
// === AKHIR PERBAIKAN ===
// =================================================================


// === UTIL: Format Waktu ===
const formattedDateTime = computed(() => {
    // (Fungsi ini tidak berubah, sudah benar)
    const timeData = currentBooking.value?.start_time
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
    router.push('/my-bookings');
}

// Helper untuk mengambil data dengan aman
const getBookingData = (key, fallback) => {
    // (Fungsi ini tidak berubah, sudah benar)
    return currentBooking.value?.[key] || fallback || 'N/A';
}

</script>

<template>
    <div class="bg-background min-h-screen text-text-default pt-24 pb-12">
        <main class="container mx-auto px-4 max-w-2xl">
            <!-- HEADER (Tidak berubah) -->
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
                    <h1 class="text-3xl font-bold">Instruksi Pembayaran</h1>
                </div>
                <div class="flex-1"></div>
            </div>

            <!-- KONTEN UTAMA: Instruksi Pembayaran -->
            <div v-if="currentBooking" class="bg-white text-black p-6 md:p-8 border-4 border-outline space-y-6">

                <!-- Peringatan Waktu -->
                <div class="text-center space-y-2">
                    <i data-feather="clock" class="w-16 h-16 text-red-500 mx-auto"></i>
                    <h2 class="text-2xl font-bold">Menunggu Pembayaran</h2>
                    <p class="text-gray-600">Selesaikan pembayaran Anda untuk mengamankan slot.</p>

                    <!-- ====================================================== -->
                    <!-- === PERBAIKAN COUNTDOWN TIMER DI SINI === -->
                    <!-- ====================================================== -->
                    <!-- Tampilkan countdown HANYA JIKA 'showCountdown' (dari expires_at) true -->
                    <div v-if="showCountdown" class="bg-red-100 border-2 border-red-500 p-4">
                        <p class="text-sm font-semibold text-red-700">Batas Waktu Pembayaran:</p>
                        <p class="text-4xl font-mono font-bold text-red-700">{{ countdown }}</p>
                    </div>

                    <!-- Tampilkan pesan alternatif jika 'expires_at' tidak ada -->
                    <div v-else class="bg-yellow-100 border-2 border-yellow-500 p-4">
                        <p class="text-sm font-semibold text-yellow-700">Harap selesaikan pembayaran Anda sesuai
                            instruksi.</p>
                    </div>
                    <!-- ====================================================== -->
                    <!-- === AKHIR PERBAIKAN === -->
                    <!-- ====================================================== -->

                    <p class="text-sm pt-2">
                        Kode Booking: <span class="font-mono bg-gray-100 p-1">{{ getBookingData('booking_id', 'N/A')
                            }}</span>
                    </p>
                </div>

                <hr class="border-b-2 border-outline border-dashed" />

                <!-- Instruksi Pembayaran (Tidak berubah) -->
                <div class="space-y-4">
                    <h3 class="text-xl font-bold">Transfer ke Rekening:</h3>

                    <div class="bg-gray-100 border-3 border-outline p-4 text-center">
                        <p class="font-bold text-2xl">Bank BNI</p>
                        <p class="font-mono text-xl">1234567890</p>
                        <p class="text-sm">a/n PT Phourto Studio Indonesia</p>
                    </div>

                    <div class="text-center">
                        <p class="text-gray-600">Jumlah yang harus dibayar:</p>
                        <!-- (Ini sekarang aman dari NaN karena formatCurrency() sudah diperbaiki) -->
                        <p class="text-3xl font-bold text-primary">{{ formatCurrency(getBookingData('total_price_paid',
                            0)) }}</p>
                        <p class="text-xs text-gray-500">
                            (Status Pembayaran: {{ getBookingData('payment_status', 'PENDING') }})
                        </p>
                    </div>

                    <div class="text-xs text-gray-600 bg-yellow-100 p-3 border border-yellow-300">
                        <span class="font-bold">PENTING:</span>
                        Harap transfer dengan jumlah yang sama persis. Pesanan akan otomatis dibatalkan jika pembayaran
                        tidak diterima dalam batas waktu yang ditentukan.
                    </div>
                </div>

                <hr class="border-b-2 border-outline border-dashed" />

                <!-- Detail Pesanan (Ringkasan) (Tidak berubah) -->
                <div class="space-y-4">
                    <h3 class="text-xl font-bold">Detail Pesanan Anda</h3>

                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="font-semibold">Studio:</div>
                        <div>{{ getBookingData('branch_name', selectedBranch?.name) }}</div>

                        <div class="font-semibold">Paket:</div>
                        <div>{{ getBookingData('package_name', selectedPackage?.package_name) }}</div>

                        <div class="font-semibold">Jadwal:</div>
                        <div>{{ formattedDateTime }}</div>

                        <div class="font-semibold">Pelanggan:</div>
                        <div>{{ getBookingData('customer_name', bookingStore.customerDetails.name) }}</div>

                        <div class="font-semibold">Add-ons:</div>
                        <div>
                            <p>Background: {{getBookingData('addons', []).find(a => a.type === 'background')?.value ||
                                'Tidak ada' }}</p>
                            <p>Tambahan Orang: {{getBookingData('addons', []).find(a => a.type ===
                                'additional_people')?.value || 0 }}</p>
                        </div>
                    </div>
                </div>

                <!-- Tombol Aksi (Tidak berubah) -->
                <div class="pt-4 space-y-3">
                    <button @click="goToMyBookings"
                        class="w-full bg-primary text-text-default font-bold text-lg py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                        Lihat Riwayat Pesanan
                    </button>
                </div>

            </div>

        </main>
    </div>
</template>