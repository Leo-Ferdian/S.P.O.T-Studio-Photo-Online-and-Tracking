<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookingStore } from '@/stores/booking.stores';
import feather from 'feather-icons';

const route = useRoute();
const router = useRouter();
const bookingStore = useBookingStore();

const bookingCode = route.query.code;
const email = route.query.email;

const isLoading = ref(true);
const photos = ref([]);
const bookingInfo = ref(null);
const errorMessage = ref(null);
const isDownloading = ref(false);

// --- Format Tanggal ---
const formattedDate = computed(() => {
  if (!bookingInfo.value?.start_time) return '-';
  const date = new Date(bookingInfo.value.start_time);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date) + ' WIB';
});

// --- 1. DOWNLOAD ZIP (SEMUA) ---
const downloadAll = () => {
  if (!bookingCode || !email) return;
  const url = bookingStore.getZipDownloadUrl(bookingCode, email);
  window.open(url, '_self');
};

// --- 2. DOWNLOAD FOTO SATUAN (UPDATE: VIA PROXY BACKEND) ---
const downloadSinglePhoto = (photoUrl) => {
  if (!bookingCode || !email) return;

  // Gunakan URL dari Store yang mengarah ke Backend Proxy
  const url = bookingStore.getSinglePhotoDownloadUrl(bookingCode, email, photoUrl);

  // Memicu download langsung
  window.location.href = url;
};

const refreshPage = () => router.go(0);

onMounted(async () => {
  if (!bookingCode || !email) {
    errorMessage.value = "Data klaim tidak lengkap.";
    isLoading.value = false;
    return;
  }

  try {
    const result = await bookingStore.fetchGallery(bookingCode, email);
    photos.value = result.photos;
    bookingInfo.value = result.booking;
  } catch (error) {
    errorMessage.value = error.message || "Gagal memuat foto.";
  } finally {
    isLoading.value = false;
    nextTick(() => feather.replace());
  }
});
</script>

<template>
  <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
    <main class="container mx-auto px-4 max-w-3xl">

      <!-- Header & Judul -->
      <div class="flex items-center justify-between mb-12">
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <button @click="$router.back()"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">
              <i data-feather="arrow-left" class="w-6 h-6"></i>
            </button>
            <button @click="$router.push('/Home')"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">
              <i data-feather="home" class="w-6 h-6"></i>
            </button>
          </div>
        </div>
        <div class="flex-1 text-center">
          <h1 class="text-2xl md:text-3xl font-bold uppercase whitespace-nowrap">
            DOWNLOAD PHOTO
          </h1>
        </div>
        <div class="flex-1"></div>
      </div>

      <!-- Card Putih -->
      <div class="bg-white border-3 border-outline shadow-solid p-6 text-center space-y-6 relative">

        <!-- Detail Booking -->
        <div class="border-b-2 border-gray-200 pb-6">
          <div class="flex flex-col gap-1 mb-4">
            <p class="text-gray-500 text-xs uppercase tracking-widest">Kode Booking</p>
            <p class="text-3xl font-black text-primary tracking-wide">{{ bookingCode }}</p>
          </div>

          <div v-if="bookingInfo"
            class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-gray-50 p-4 border-2 border-gray-100">
            <!-- Paket -->
            <div class="flex items-start gap-3">
              <div class="bg-white p-2 border border-gray-200">
                <i data-feather="package" class="w-4 h-4 text-primary"></i>
              </div>
              <div>
                <p class="text-xs text-gray-400">Paket</p>
                <p class="font-bold text-sm text-gray-800 leading-tight">{{ bookingInfo.package_name }}</p>
              </div>
            </div>
            <!-- Cabang -->
            <div class="flex items-start gap-3">
              <div class="bg-white p-2 border border-gray-200">
                <i data-feather="map-pin" class="w-4 h-4 text-primary"></i>
              </div>
              <div>
                <p class="text-xs text-gray-400">Lokasi</p>
                <p class="font-bold text-sm text-gray-800 leading-tight">{{ bookingInfo.branch_name }}</p>
              </div>
            </div>
            <!-- Waktu -->
            <div class="md:col-span-2 flex items-start gap-3">
              <div class="bg-white p-2 border border-gray-200">
                <i data-feather="calendar" class="w-4 h-4 text-primary"></i>
              </div>
              <div>
                <p class="text-xs text-gray-400">Waktu Sesi</p>
                <p class="font-bold text-sm text-gray-800 leading-tight">{{ formattedDate }}</p>
              </div>
            </div>
          </div>

          <div v-else>
            <p class="text-gray-500 text-sm">Email</p>
            <p class="font-bold">{{ email }}</p>
          </div>
        </div>

        <!-- STATE: LOADING -->
        <div v-if="isLoading" class="py-8">
          <i data-feather="loader" class="w-12 h-12 animate-spin mx-auto text-primary mb-4"></i>
          <p>Memuat detail sesi...</p>
        </div>

        <!-- STATE: ERROR -->
        <div v-else-if="errorMessage" class="bg-red-100 border-2 border-red-500 text-red-700 p-4">
          <p class="font-bold flex items-center justify-center gap-2">
            <i data-feather="alert-circle" class="w-5 h-5"></i> Gagal
          </p>
          <p class="mt-2 text-sm">{{ errorMessage }}</p>
          <button @click="refreshPage" class="mt-4 text-xs font-bold underline hover:text-red-900">Coba Lagi</button>
        </div>

        <!-- STATE: SUKSES -->
        <div v-else class="pt-2 pb-4">

          <!-- GRID FOTO -->
          <div v-if="photos.length > 0" class="mb-8">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-left">
              <div v-for="(photo, index) in photos" :key="index"
                class="group relative aspect-square bg-gray-100 border-2 border-outline overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">

                <img :src="photo.photo_url" class="w-full h-full object-cover" loading="lazy" />

                <!-- Tombol Download Satuan -->
                <!-- Menggunakan @click yang memanggil endpoint backend proxy -->
                <button @click.prevent="downloadSinglePhoto(photo.photo_url)"
                  class="absolute bottom-2 right-2 bg-white border-2 border-outline p-1.5 hover:bg-yellow-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                  title="Download Foto Ini">
                  <i data-feather="download" class="w-3 h-3"></i>
                </button>

              </div>
            </div>
            <p class="text-xs text-gray-400 mt-2 text-right italic">Total: {{ photos.length }} Foto</p>
          </div>

          <div v-else class="py-8 text-gray-500">
            <p>Tidak ada foto ditemukan.</p>
          </div>

          <!-- Tombol Download ZIP -->
          <div class="border-t-2 border-gray-100 pt-6">
            <p class="text-sm font-bold text-gray-700 mb-3">Simpan semua kenangan?</p>
            <button @click="downloadAll" :disabled="photos.length === 0"
              class="block w-full bg-primary text-white font-bold py-4 text-xl border-3 border-outline shadow-solid hover:bg-red-700 transition-all hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="flex items-center justify-center gap-3">
                <i data-feather="download" class="w-6 h-6"></i>
                DOWNLOAD SEMUA (.ZIP)
              </span>
            </button>
          </div>

        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
.bg-background {
  background-color: #f7f500;
}

.bg-primary {
  background-color: #ff1b1b;
}

.text-text-default {
  color: #000000;
}

.border-outline {
  border-color: #000000;
}

.shadow-solid {
  box-shadow: 4px 4px 0 #000000;
}

.shadow-strong {
  box-shadow: 8px 8px 0 #000000;
}

/* Reset radius untuk style Neo-Brutalist */
.rounded,
.rounded-lg,
.rounded-md,
.rounded-sm {
  border-radius: 0 !important;
}
</style>