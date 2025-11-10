<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookingStore } from '../../stores/booking.stores.js';
import { storeToRefs } from 'pinia';
import feather from 'feather-icons';

const route = useRoute();
const router = useRouter();
const bookingStore = useBookingStore();

// --- Data dari URL ---
const bookingCode = computed(() => route.query.code);
const customerEmail = computed(() => route.query.email);

// --- State dari Store ---
// Kita gunakan zipStatus dari store untuk menampilkan status
const { zipStatus, isLoading } = storeToRefs(bookingStore);
const isInitialLoad = ref(true); // Untuk kontrol tampilan loading awal

// Polling interval (setiap 5 detik)
const POLLING_INTERVAL = 5000;
let pollTimer = null;

// === Fungsi Utama ===

// Fungsi untuk memulai pemeriksaan status (polling)
const startPolling = (code) => {
  // Jalankan pengecekan pertama kali
  bookingStore.checkZipStatus(code);

  // Atur timer untuk polling selanjutnya
  pollTimer = setInterval(() => {
    // Hentikan polling jika status sudah FINAL
    if (zipStatus.value.status === 'READY' || zipStatus.value.status === 'FAILED') {
      clearInterval(pollTimer);
      return;
    }
    bookingStore.checkZipStatus(code);
  }, POLLING_INTERVAL);
};

// Fungsi untuk memicu pembuatan ZIP di backend
const triggerDownload = async () => {
  isInitialLoad.value = false;
  // Panggil action trigger dari store
  await bookingStore.triggerZipDownload(bookingCode.value);

  // Mulai polling setelah berhasil memicu
  if (zipStatus.value.status === 'PROCESSING') {
    startPolling(bookingCode.value);
  }
  nextTick(() => feather.replace());
};

// === Lifecycle ===
onMounted(() => {
  // 1. Guard: Pastikan kita punya kode booking dari URL
  if (!bookingCode.value || !customerEmail.value) {
    router.push('/claimphotos');
    return;
  }

  // 2. Lakukan pengecekan status awal
  // (Kita asumsikan store akan mengembalikan status ZIP yang disimpan)
  startPolling(bookingCode.value);

  isInitialLoad.value = false;
  nextTick(() => feather.replace());
});

// Hentikan polling saat keluar halaman
onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer);
  }
});
</script>

<template>
  <div class="bg-background min-h-screen text-text-default pt-24 pb-12">
    <main class="container mx-auto px-4 max-w-2xl">
      <!-- Header Navigasi -->
      <div class="flex items-center justify-between mb-12">
        <button @click="$router.back()"
          class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600">
          <i data-feather="arrow-left" class="w-6 h-6"></i>
        </button>
        <h1 class="text-3xl font-bold">Klaim Foto</h1>
        <div class="w-12"></div>
      </div>

      <!-- Kartu Hasil Klaim -->
      <div class="bg-white text-black p-6 border-4 border-outline shadow-solid space-y-6">

        <!-- Info Booking -->
        <div class="border-b-2 border-dashed border-gray-300 pb-4">
          <h2 class="text-xl font-bold">Status Galeri Anda</h2>
          <p class="text-sm text-gray-700">Kode Booking: <span class="font-bold">{{ bookingCode }}</span></p>
          <p class="text-sm text-gray-700">Email: {{ customerEmail }}</p>
        </div>

        <!-- Tampilan Status -->
        <div :class="[
          zipStatus.status === 'READY' ? 'bg-green-100 border-green-500' :
            zipStatus.status === 'PROCESSING' ? 'bg-blue-100 border-blue-500' :
              zipStatus.status === 'FAILED' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500'
        ]" class="p-4 border-2 rounded-lg text-center">

          <h3 class="font-bold text-lg mb-2">Status: {{ zipStatus.status || 'CHECKING' }}</h3>
          <p class="text-sm">{{ zipStatus.message }}</p>
        </div>

        <!-- Tombol Aksi (Trigger / Download) -->
        <div class="pt-4">

          <!-- 1. Jika SEDANG DIPROSES -->
          <button v-if="zipStatus.status === 'PROCESSING'" disabled
            class="w-full bg-gray-400 text-white font-bold py-3 border-3 border-outline shadow-solid disabled:opacity-70">
            <i data-feather="loader" class="w-5 h-5 animate-spin mr-2"></i> SEDANG DIPROSES...
          </button>

          <!-- 2. Jika SUDAH SIAP -->
          <a v-else-if="zipStatus.status === 'READY' && zipStatus.downloadUrl" :href="zipStatus.downloadUrl"
            target="_blank"
            class="w-full bg-background text-black font-bold py-3 border-3 border-outline shadow-solid hover:bg-yellow-300 block text-center">
            <i data-feather="download" class="w-5 h-5 mr-2"></i> UNDUH GALERI SEKARANG
          </a>

          <!-- 3. Jika PENDING atau GAGAL (Tampilkan tombol Trigger) -->
          <button v-else-if="zipStatus.status === 'PENDING' || zipStatus.status === 'FAILED' || isInitialLoad"
            @click="triggerDownload" :disabled="isLoading"
            class="w-full bg-primary text-white font-bold py-3 border-3 border-outline shadow-solid hover:bg-red-600 disabled:opacity-50">
            <span v-if="isLoading">MEMVERIFIKASI...</span>
            <span v-else>KLIK UNTUK MENDAPATKAN LINK UNDUH</span>
          </button>

        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Style tambahan untuk ikon yang berputar */
i[data-feather].animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Style input yang konsisten */
.form-input-setting {
  @apply w-full p-3 bg-white text-black border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-yellow-400;
}
</style>