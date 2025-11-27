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

// Handle Bayar Sekarang
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

// --- Logika WhatsApp Link ---
const getWhatsappRescheduleLink = (booking) => {
  try {
    // Nomor Admin (Ganti dengan nomor asli studio Anda, format internasional tanpa '+')
    const adminPhone = '6282283238664';

    // Ambil data dengan fallback string kosong agar tidak error
    const id = booking.booking_id || 'Unknown ID';
    const pkg = booking.package_name || 'Paket';
    const date = formatDate(booking.start_time);

    const message = `Halo Admin S.P.O.T, saya ingin mengajukan reschedule untuk pesanan saya:
        
- ID Booking: ${id}
- Paket: ${pkg}
- Jadwal Awal: ${date}

Mohon informasinya untuk ketersediaan jadwal baru. Terima kasih.`;

    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    return url;
  } catch (error) {
    console.error("Gagal membuat link WA:", error);
    return '#';
  }
};

onMounted(() => {
  fetchHistory();
})
</script>

<template>
  <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
    <main class="container mx-auto px-4 max-w-5xl">

      <div class="flex-1">
        <div class="flex items-center justify-between mb-6">

          <!-- Back kiri -->
          <div class="flex-1">
            <button @click="$router.back()"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:translate-y-1 hover:shadow-none transition-all">
              <i data-feather="arrow-left" class="w-6 h-6"></i>
            </button>
          </div>

          <!-- Judul tengah -->
          <h1 class="text-3xl md:text-4xl font-bold text-center flex-1 uppercase tracking-wider">
            Riwayat Sesi
          </h1>

          <!-- Home kanan -->
          <div class="flex-1 flex justify-end">
            <button @click="$router.push('/Home')"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:translate-y-1 hover:shadow-none transition-all">
              <i data-feather="home" class="w-6 h-6"></i>
            </button>
          </div>

        </div>
      </div>



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
          <div v-if="['PENDING', 'PAID-DP', 'PAID-FULL'].includes(item.payment_status)"
            class="text-center pt-2 border-t border-gray-100 mt-2">
            <p class="text-[10px] text-gray-400 mb-1">Ingin ubah jadwal?</p>
            <a :href="getWhatsappRescheduleLink(item)" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center justify-center w-full px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200 transition">
              <svg class="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Hubungi Admin
            </a>
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

            <span v-else-if="['CANCELLED', 'EXPIRED', 'FAILED'].includes(item.payment_status)"
              class="text-xs font-bold text-red-200 italic">
              Transaksi Dibatalkan
            </span>
          </div>

        </div>
      </div>

    </main>
  </div>
</template>