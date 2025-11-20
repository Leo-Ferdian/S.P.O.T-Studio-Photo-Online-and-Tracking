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
const bookingInfo = ref(null); // Info tambahan
const errorMessage = ref(null);

// --- Format Tanggal ---
const formattedDate = computed(() => {
  if (!bookingInfo.value?.start_time) return '-';
  const date = new Date(bookingInfo.value.start_time);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date) + ' WIB';
});

const downloadAll = () => {
  if (!bookingCode || !email) return;
  const url = bookingStore.getZipDownloadUrl(bookingCode, email);
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
    // Fetch data (returns { booking, photos })
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
    <main class="container mx-auto px-4 max-w-2xl">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <button @click="$router.push('/claimphotos')"
          class="p-2 bg-primary text-white border-3 border-outline shadow-solid hover:translate-y-1 hover:shadow-none transition-all">
          <i data-feather="arrow-left" class="w-6 h-6"></i>
        </button>
        <h1 class="text-3xl font-bold text-center flex-1">Download Foto</h1>
        <div class="w-10"></div>
      </div>

      <!-- Card Utama -->
      <div
        class="bg-white border-4 border-outline shadow-solid p-6 md:p-8 rounded-lg text-center space-y-6 relative z-10">

        <!-- 1. Detail Booking (DIPERBARUI) -->
        <div class="border-b-2 border-gray-200 pb-6">
          <div class="flex flex-col gap-1 mb-4">
            <p class="text-gray-500 text-xs uppercase tracking-widest">Kode Booking</p>
            <p class="text-3xl font-black text-primary tracking-wide">{{ bookingCode }}</p>
          </div>

          <!-- Grid Info Detail (Jika Data Ada) -->
          <div v-if="bookingInfo"
            class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-lg border-2 border-gray-100">
            <!-- Paket -->
            <div class="flex items-start gap-3">
              <div class="bg-white p-2 rounded border border-gray-200">
                <i data-feather="package" class="w-4 h-4 text-primary"></i>
              </div>
              <div>
                <p class="text-xs text-gray-400">Paket</p>
                <p class="font-bold text-sm text-gray-800 leading-tight">{{ bookingInfo.package_name }}</p>
              </div>
            </div>

            <!-- Cabang -->
            <div class="flex items-start gap-3">
              <div class="bg-white p-2 rounded border border-gray-200">
                <i data-feather="map-pin" class="w-4 h-4 text-primary"></i>
              </div>
              <div>
                <p class="text-xs text-gray-400">Lokasi</p>
                <p class="font-bold text-sm text-gray-800 leading-tight">{{ bookingInfo.branch_name }}</p>
              </div>
            </div>

            <!-- Waktu (Full Width di Mobile) -->
            <div class="md:col-span-2 flex items-start gap-3">
              <div class="bg-white p-2 rounded border border-gray-200">
                <i data-feather="calendar" class="w-4 h-4 text-primary"></i>
              </div>
              <div>
                <p class="text-xs text-gray-400">Waktu Sesi</p>
                <p class="font-bold text-sm text-gray-800 leading-tight">{{ formattedDate }}</p>
              </div>
            </div>
          </div>

          <!-- Fallback Email jika data detail blm load -->
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
        <div v-else-if="errorMessage" class="bg-red-100 border-2 border-red-500 text-red-700 p-4 rounded">
          <p class="font-bold flex items-center justify-center gap-2">
            <i data-feather="alert-circle" class="w-5 h-5"></i> Gagal
          </p>
          <p class="mt-2 text-sm">{{ errorMessage }}</p>
          <button @click="refreshPage" class="mt-4 text-xs underline hover:text-red-900">Coba Lagi</button>
        </div>

        <!-- STATE: SUKSES -->
        <div v-else class="pt-2 pb-4">

          <!-- GRID FOTO -->
          <div v-if="photos.length > 0" class="mb-8">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-left">
              <div v-for="(photo, index) in photos" :key="index"
                class="group relative aspect-square bg-gray-100 border-2 border-outline rounded-lg overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">

                <img :src="photo.photo_url" class="w-full h-full object-cover" loading="lazy" />

                <a :href="photo.photo_url" download target="_blank"
                  class="absolute bottom-1 right-1 bg-white border-2 border-outline p-1.5 rounded-full hover:bg-yellow-400 transition-colors opacity-0 group-hover:opacity-100">
                  <i data-feather="download" class="w-3 h-3"></i>
                </a>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-2 text-right italic">Total: {{ photos.length }} Foto</p>
          </div>

          <!-- Tombol Download -->
          <div class="border-t-2 border-gray-100 pt-6">
            <p class="text-sm font-bold text-gray-700 mb-3">Simpan semua kenangan?</p>
            <button @click="downloadAll"
              class="block w-full bg-primary text-white font-bold py-4 text-xl border-3 border-outline shadow-solid hover:bg-red-700 transition-all hover:translate-y-1 hover:shadow-none">
              <span class="flex items-center justify-center gap-3">
                <i data-feather="download" class="w-6 h-6"></i>
                DOWNLOAD SEMUA (.ZIP)
              </span>
            </button>
          </div>

        </div>

      </div>

      <!-- Bantuan -->
      <div class="text-center mt-8 text-sm text-gray-500">
        <p>Mengalami kendala? Hubungi <a href="#" class="text-primary underline font-bold">Admin WhatsApp</a></p>
      </div>

    </main>
  </div>
</template>