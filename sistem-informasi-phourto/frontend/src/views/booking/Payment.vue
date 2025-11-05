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
    currentBooking, // Data booking PENDING
    isLoading,      // Status loading global
    error             // Pesan error global
} = storeToRefs(bookingStore)

// === STATE LOKAL ===
const countdown = ref('00:00')
const qrCodeUrl = ref(null)
let countdownTimer = null

// === FUNGSI COUNTDOWN ===
const startCountdown = (expiryTimestamp) => {
    const expiryDate = new Date(expiryTimestamp).getTime();

    countdownTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = expiryDate - now;

        if (distance < 0) {
            clearInterval(countdownTimer);
            countdown.value = "KODE QR KADALUARSA";
            // TODO: Tampilkan tombol "Refresh QR"
        } else {
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            countdown.value =
                String(minutes).padStart(2, '0') + ':' +
                String(seconds).padStart(2, '0');
        }
    }, 1000);
}

// === LIFECYCLE ===
onMounted(async () => {
    // 1. Guard clause: Pastikan kita punya data booking
    if (!currentBooking.value || !currentBooking.value.booking_id) {
        console.error("Tidak ada data booking untuk diproses. Mengarahkan ke beranda.");
        router.push('/');
        return;
    }

    // 2. Cek apakah QR code sudah di-generate sebelumnya (misal: pengguna refresh)
    if (currentBooking.value.payment_qr_url && currentBooking.value.payment_deadline) {
        qrCodeUrl.value = currentBooking.value.payment_qr_url;
        startCountdown(currentBooking.value.payment_deadline);
        nextTick(() => feather.replace());
        return; // Hentikan eksekusi, tidak perlu panggil API
    }

    // 3. Jika QR code belum ada, panggil API untuk membuatnya
    try {
        const paymentData = await bookingStore.generatePaymentQR(currentBooking.value.booking_id);

        // 4. Sukses: simpan URL QR dan mulai countdown
        qrCodeUrl.value = paymentData.qr_code_url;
        startCountdown(paymentData.expires_at); // 'expires_at' dari PaymentService

    } catch (apiError) {
        console.error("Gagal men-generate QR Code DOKU:", apiError);
        // 'error' (dari store) akan otomatis ditampilkan di template
    } finally {
        nextTick(() => feather.replace());
    }
})

// Hentikan timer saat keluar halaman
onUnmounted(() => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
})

// === UTIL: Format Mata Uang ===
const formatCurrency = (value) => {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) numValue = 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(numValue)
}

// === Navigasi (Sementara) ===
// TODO: Idealnya, kita harus melakukan polling ke backend 
// untuk mengecek status pembayaran, lalu otomatis redirect
// saat status berubah menjadi PAID.
const checkPaymentStatus = () => {
    // Untuk sekarang, kita arahkan manual ke summary
    // Di alur nyata, DOKU Webhook akan mengubah status booking
    // dan kita akan redirect ke summary
    router.push('/booking/summary');
}

</script>

<template>
    <div class="bg-background min-h-screen text-text-default pt-24 pb-12">
        <main class="container mx-auto px-4 max-w-md">
            <!-- HEADER -->
            <div class="flex items-center justify-between mb-12">
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <button @click="$router.back()"
                            class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                            <i data-feather="arrow-left" class="w-6 h-6"></i>
                        </button>
                    </div>
                </div>
                <div class="flex-1 text-center">
                    <h1 class="text-3xl font-bold">Pembayaran</h1>
                </div>
                <div class="flex-1"></div>
            </div>

            <!-- KONTEN UTAMA: QRIS DOKU -->
            <div v-if="isLoading" class="text-center py-16">
                <p class="font-bold">Membuat Kode QR...</p>
                <p>Mohon tunggu sebentar.</p>
            </div>

            <div v-else-if="error"
                class="bg-red-800/50 text-white text-sm p-3 border-2 border-primary mb-4 text-center">
                <p class="font-bold">Gagal Membuat Pembayaran</p>
                <p>{{ error }}</p>
            </div>

            <div v-else-if="qrCodeUrl" class="bg-white text-black p-6 md:p-8 border-4 border-outline space-y-6">

                <div class="text-center space-y-4">
                    <h2 class="text-xl font-bold">Pindai Kode QRIS di Bawah Ini</h2>
                    <p class="text-gray-600">
                        Gunakan aplikasi E-Wallet (GoPay, OVO, ShopeePay) atau M-Banking Anda.
                    </p>

                    <!-- Tampilkan QR Code -->
                    <div class="p-4 border-2 border-outline flex justify-center">
                        <img :src="qrCodeUrl" alt="DOKU QRIS Code" class="w-64 h-64" />
                    </div>

                    <!-- Total & Countdown -->
                    <div class="space-y-2">
                        <p class="text-gray-600">Jumlah yang harus dibayar:</p>
                        <p class="text-3xl font-bold text-primary">{{ formatCurrency(currentBooking.total_price_paid) }}
                        </p>

                        <div class="bg-red-100 border-2 border-red-500 p-3">
                            <p class="text-sm font-semibold text-red-700">Kode QR akan kadaluarsa dalam:</p>
                            <p class="text-3xl font-mono font-bold text-red-700">{{ countdown }}</p>
                        </div>
                    </div>
                </div>

                <hr class="border-b-2 border-outline border-dashed" />

                <!-- Tombol Aksi -->
                <div class="pt-4 space-y-3">
                    <p class="text-xs text-center text-gray-500">
                        Setelah membayar, status pesanan Anda akan otomatis diperbarui.
                        Jika halaman tidak berpindah, klik tombol di bawah.
                    </p>
                    <button @click="checkPaymentStatus"
                        class="w-full bg-primary text-text-default font-bold text-lg py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                        Saya Sudah Membayar
                    </button>
                </div>

            </div>

        </main>
    </div>
</template>