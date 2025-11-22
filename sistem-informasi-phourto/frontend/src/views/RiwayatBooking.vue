<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/api'
import feather from 'feather-icons'
// Import Store
import { useBookingStore } from '@/stores/booking.stores'

const router = useRouter()
const bookingStore = useBookingStore() // Gunakan store
const history = ref([])
const loading = ref(true)

// --- FETCH DATA ---
const fetchHistory = async () => {
  try {
    const res = await apiClient.get('/bookings/my-bookings')
    history.value = res.data?.data?.data || []
  } catch (error) {
    console.error("Gagal memuat riwayat booking:", error)
  } finally {
    loading.value = false
    nextTick(() => feather.replace())
  }
}

// --- HELPER ---
const getClaimCode = (item) => {
  if (item.unique_code) return item.unique_code;
  return `PHR-${item.booking_id ? item.booking_id.substring(0, 6).toUpperCase() : 'ERR'}`;
}

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
}

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateString));
}

const formatTime = (start) => {
  if (!start) return '-';
  return new Date(start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}

// --- NAVIGASI ---
const goToClaim = (item) => {
  router.push(`/claimphotos`);
}

// [FITUR BARU] Handle Bayar Sekarang
const handlePayNow = (item) => {
  // 1. Set 'currentBooking' di store dengan data dari item ini
  //    Kita perlu memastikan struktur datanya cocok dengan yang diharapkan Payment.vue
  //    Payment.vue butuh: booking_id, total_price_paid (atau total_price)

  const bookingDataForStore = {
    booking_id: item.booking_id,
    total_price_paid: item.total_price, // Mapping harga
    payment_status: item.payment_status,
    // Tambahkan field lain jika Payment.vue butuh (misal payment_link kalau sudah ada di DB)
    payment_link: item.payment_qr_url // Jika backend sudah simpan link di sini
  };

  // 2. Simpan ke Store (Manual Set)
  bookingStore.currentBooking = bookingDataForStore;

  // 3. Arahkan ke halaman Payment
  router.push('/booking/payment');
}

onMounted(() => {
  fetchHistory();
})
</script>

<template>
  <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
    <main class="container mx-auto px-4 max-w-5xl">

      <div class="flex-1">
          <div class="flex items-center space-x-2">
            <button @click="$router.back()"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:translate-y-1 hover:shadow-none transition-all">
              <i data-feather="arrow-left" class="w-6 h-6"></i>
            </button>
            <button @click="$router.push('/Home')"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:translate-y-1 hover:shadow-none transition-all">
              <i data-feather="home" class="w-6 h-6"></i>
            </button>
          </div>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-center flex-1 uppercase tracking-wider">
          Riwayat Sesi
        </h1>
        <div class="w-12"></div>
      

      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <i data-feather="loader" class="w-12 h-12 animate-spin text-primary mb-4"></i>
        <p class="font-bold text-xl">Memuat data...</p>
      </div>

      <div v-else-if="history.length === 0"
        class="bg-white border-4 border-outline shadow-solid p-12 text-center max-w-2xl mx-auto">
        <div class="inline-block p-4 bg-gray-100 rounded-full mb-4 border-2 border-outline">
          <i data-feather="camera-off" class="w-12 h-12 text-gray-400"></i>
        </div>
        <h2 class="text-2xl font-bold mb-2">Belum Ada Sesi</h2>
        <p class="text-gray-500 mb-6">Ayo buat kenangan baru bersama kami!</p>
        <router-link to="/location"
          class="bg-primary text-white px-6 py-3 font-bold border-3 border-outline shadow-solid hover:translate-y-1 hover:shadow-none transition-all inline-block">
          Booking Sekarang
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div v-for="item in history" :key="item.booking_id"
          class="bg-white border-4 border-outline shadow-solid overflow-hidden relative hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col">

          <div class="p-6 border-b-2 border-gray-200 text-center bg-gray-50 relative">

            <div class="flex items-center justify-center gap-2 mb-2 text-gray-500">
              <i data-feather="key" class="w-3 h-3"></i>
              <p class="text-xs uppercase tracking-widest font-bold">KODE AKSES FOTO</p>
            </div>

            <p class="text-4xl font-black text-primary tracking-wider select-all font-mono">
              {{ getClaimCode(item) }}
            </p>
            <p class="text-[10px] text-gray-400 mt-1">(Gunakan kode ini untuk download foto)</p>

            <div class="absolute top-4 right-4">
              <span v-if="item.payment_status === 'PENDING'"
                  class="bg-yellow-300 text-[10px] font-bold px-2 py-1 border-2 border-outline transform rotate-3 shadow-sm block text-black">
                  BELUM BAYAR
              </span>

              <span v-else-if="['PAID-FULL', 'COMPLETED'].includes(item.payment_status)"
                  class="bg-[#4ADE80] text-[10px] font-bold px-2 py-1 border-2 border-outline transform -rotate-2 shadow-sm block text-black">
                  SUDAH BAYAR
              </span>

              <span v-else-if="['CANCELLED', 'EXPIRED', 'FAILED'].includes(item.payment_status)"
                  class="bg-red-500 text-[10px] font-bold px-2 py-1 border-2 border-outline transform rotate-1 shadow-sm block text-white">
                  {{ item.payment_status === 'EXPIRED' ? 'KADALUARSA' : 'DIBATALKAN' }}
              </span>

              <span v-else
                  class="bg-gray-300 text-[10px] font-bold px-2 py-1 border-2 border-outline block text-gray-600">
                  {{ item.payment_status }}
              </span>
          </div>
            
          </div>

          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left flex-grow">
            <div class="flex items-start gap-3">
              <div class="bg-white p-2 rounded border border-gray-200 shrink-0">
                <i data-feather="package" class="w-4 h-4 text-primary"></i>
              </div>
              <div>
                <p class="text-xs text-gray-400">Paket</p>
                <p class="font-bold text-sm text-gray-800 leading-tight">{{ item.package_name || '-' }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="bg-white p-2 rounded border border-gray-200 shrink-0">
                <i data-feather="map-pin" class="w-4 h-4 text-primary"></i>
              </div>
              <div>
                <p class="text-xs text-gray-400">Lokasi</p>
                <p class="font-bold text-sm text-gray-800 leading-tight">{{ item.branch_name || '-' }}</p>
              </div>
            </div>

            <div class="col-span-1 sm:col-span-2 flex items-start gap-3 bg-gray-50 p-2 rounded border border-gray-100">
              <div class="bg-white p-2 rounded border border-gray-200 shrink-0">
                <i data-feather="calendar" class="w-4 h-4 text-primary"></i>
              </div>
              <div>
                <p class="text-xs text-gray-400">Jadwal Sesi</p>
                <p class="font-bold text-sm text-gray-800 leading-tight">
                  {{ formatDate(item.start_time) }} <span class="mx-1 text-gray-300">|</span> {{
                    formatTime(item.start_time) }}
                </p>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 bg-primary text-white flex justify-between items-center border-t-4 border-outline">
            <div>
                <p class="text-xs text-white/80 font-medium">Total Tagihan</p>
                <p class="text-xl font-bold">{{ formatRupiah(item.total_price) }}</p>
            </div>

            <button v-if="['PAID-FULL', 'COMPLETED'].includes(item.payment_status)" @click="goToClaim(item)"
                class="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded font-bold text-sm border-2 border-transparent hover:border-white hover:bg-primary hover:text-white transition-all shadow-md">
                <i data-feather="download-cloud" class="w-4 h-4"></i>
                <span>Ambil Foto</span>
            </button>

            <button v-else-if="item.payment_status === 'PENDING'" @click="handlePayNow(item)"
                class="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded font-bold text-sm border-2 border-black hover:bg-yellow-500 transition-all shadow-md">
                <i data-feather="credit-card" class="w-4 h-4"></i>
                <span>Bayar Sekarang</span>
            </button>

            <span v-else-if="['CANCELLED', 'EXPIRED', 'FAILED'].includes(item.payment_status)" class="text-xs font-bold text-red-200 italic">
                Transaksi Dibatalkan
            </span>
        </div>

        </div>
      </div>

    </main>
  </div>
</template>