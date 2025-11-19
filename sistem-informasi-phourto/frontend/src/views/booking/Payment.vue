<script setup>
import { onMounted, ref } from 'vue'
import { useBookingStore } from '../../stores/booking.stores'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const bookingStore = useBookingStore()
const router = useRouter()
const { currentBooking, isLoading, error } = storeToRefs(bookingStore)

// State untuk Link Pembayaran
const paymentLink = ref(null)

onMounted(async () => {
    // 1. Cek apakah ada data booking
    if (!currentBooking.value) {
        alert("Data booking tidak ditemukan. Kembali ke beranda.");
        router.push('/');
        return;
    }

    // 2. Cek apakah link sudah ada di state (cache)
    if (currentBooking.value.payment_link) {
        paymentLink.value = currentBooking.value.payment_link;
        redirectToDoku(paymentLink.value);
        return;
    }

    // 3. Jika belum, panggil API Backend
    try {
        const data = await bookingStore.generatePaymentQR(currentBooking.value.booking_id);
        
        if (data && data.payment_url) {
            paymentLink.value = data.payment_url;
            redirectToDoku(data.payment_url);
        } else {
            throw new Error("Link pembayaran tidak diterima dari server.");
        }

    } catch (err) {
        console.error("Gagal mendapatkan link pembayaran:", err);
        // Error akan otomatis muncul di template lewat state 'error' store
    }
})

// Fungsi Redirect Aman
const redirectToDoku = (url) => {
    console.log("Mengalihkan ke DOKU:", url);
    // Beri jeda sedikit agar user sadar sedang dialihkan
    setTimeout(() => {
        window.location.href = url;
    }, 1500);
}
</script>

<template>
    <div class="bg-background min-h-screen pt-24 pb-12 flex items-center justify-center">
        <main class="container mx-auto px-4 max-w-md text-center">
            
            <!-- HEADER -->
            <h1 class="text-3xl font-bold mb-2">Pembayaran</h1>
            <p class="text-gray-600 mb-8" v-if="currentBooking">
                ID Pesanan: {{ currentBooking.booking_id }}
            </p>

            <!-- LOADING STATE -->
            <div v-if="isLoading" class="py-12 bg-white border-4 border-outline shadow-solid p-6">
                <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
                <p class="text-xl font-bold">Menghubungkan ke DOKU...</p>
                <p class="text-sm text-gray-500">Jangan tutup halaman ini.</p>
            </div>

            <!-- ERROR STATE -->
            <div v-else-if="error" class="bg-red-100 border-4 border-red-500 p-6 shadow-solid text-red-800">
                <h3 class="font-bold text-lg mb-2">Gagal Memproses</h3>
                <p>{{ error }}</p>
                <button @click="$router.back()" 
                    class="mt-6 bg-white text-red-600 px-4 py-2 border-2 border-red-600 font-bold shadow hover:bg-red-50">
                    Kembali / Coba Lagi
                </button>
            </div>

            <!-- SUCCESS / REDIRECT STATE -->
            <div v-else-if="paymentLink" class="bg-white border-4 border-outline shadow-solid p-8">
                <h3 class="font-bold text-xl mb-4 text-green-600">Pesanan Dibuat!</h3>
                <p class="mb-6">Anda akan dialihkan otomatis ke halaman pembayaran DOKU yang aman.</p>
                
                <a :href="paymentLink" 
                    class="block w-full bg-primary text-white font-bold text-lg py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:translate-y-1 transition-all">
                    Bayar Sekarang (Klik Manual)
                </a>
                
                <p class="text-xs text-gray-400 mt-4">
                    Jika popup terblokir, silakan klik tombol di atas.
                </p>
            </div>

        </main>
    </div>
</template>