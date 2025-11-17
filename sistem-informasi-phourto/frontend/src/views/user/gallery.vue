<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/api'

const photos = ref([])
const loading = ref(true)

const fetchGallery = async () => {
  try {
    const res = await apiClient.get('/user/gallery')
    photos.value = res.data.data
  } catch (error) {
    console.error("Gagal memuat gallery:", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchGallery())
</script>

<template>
  <div class="min-h-screen flex bg-background">

    <!-- SIDEBAR -->
    <aside class="w-90 bg-primary text-white p-12 flex flex-col gap-4">
      <h2 class="text-2xl font-bold mb-4">Studio Phour To</h2>

      <nav class="text-xl flex flex-col gap-3">
        <router-link
          to="/dashboard"
          class="text-white bg-primary px-3 py-2 rounded hover:bg-[#A21217] cursor-pointer"
        >
          Dashboard
        </router-link>

        <router-link
          to="/RiwayatBooking"
          class="text-white bg-primary px-3 py-2 rounded hover:bg-[#A21217] cursor-pointer"
        >
          Riwayat Booking
        </router-link>

        <router-link
          to="/gallery"
          class="text-white bg-primary px-3 py-2 rounded hover:bg-[#A21217] cursor-pointer"
        >
          Gallery Foto
        </router-link>

        <router-link
          to="/profile"
          class="text-white bg-primary px-3 py-2 rounded hover:bg-[#A21217] cursor-pointer"
        >
          Profile
        </router-link>
      </nav>
    </aside>


    <!-- MAIN -->
    <main class="flex-1 p-8">

      <h1 class="text-4xl font-bold text-white mb-10">Gallery Foto</h1>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="text-white text-xl font-semibold"
      >
        Memuat foto...
      </div>

      <!-- EMPTY STATE -->
      <div
        v-else-if="photos.length === 0"
        class="bg-primary p-12 rounded text-center text-white border-3 border-outline shadow-solid"
      >
        <h2 class="text-2xl mb-4 font-bold">Belum Ada Foto</h2>
        <p class="text-lg">
          Foto hasil sesi Anda akan muncul di sini setelah proses selesai.
        </p>
      </div>

      <!-- GALLERY GRID -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8"
      >

        <div
          v-for="photo in photos"
          :key="photo.id"
          class="bg-white rounded-lg overflow-hidden 
                 border-3 border-black shadow-solid
                 hover:scale-105 transition-transform duration-300"
        >
          <!-- FOTO -->
          <img
            :src="photo.url"
            alt="User Gallery Photo"
            class="w-full h-60 object-cover"
          />

          <!-- FOOTER KARTU -->
          <div class="p-4 bg-primary text-white text-center">
            <p class="font-semibold text-lg">Foto Sesi</p>
            <p class="text-sm opacity-80">
              {{ photo.date ? new Date(photo.date).toLocaleDateString('id-ID') : "Tanpa tanggal" }}
            </p>
          </div>
        </div>

      </div>

    </main>
  </div>
</template>
