<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/api'

const history = ref([])
const loading = ref(true)

const fetchHistory = async () => {
  try {
    const res = await apiClient.get('/user/booking-history')
    history.value = res.data.data
  } catch (error) {
    console.error("Gagal memuat riwayat booking:", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchHistory())
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

      <h1 class="text-4xl font-bold text-white mb-10">Riwayat Booking</h1>

      <!-- LOADING -->
      <div v-if="loading" class="text-white text-xl">
        Memuat data...
      </div>

      <!-- EMPTY -->
      <div
        v-else-if="history.length === 0"
        class="bg-primary p-12 rounded text-center text-white border-4  border-outline shadow-solid hover:bg-[#A21217] cursor-pointer w-full"
      >
        <h2 class="text-2xl mb-4">Belum Ada Riwayat Booking</h2>
        <p class="text-white">Booking yang sudah dilakukan akan muncul di sini.</p>
      </div>

      <!-- CONTENT -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        <div
          v-for="item in history"
          :key="item.id"
          class="bg-primary text-white p-6 rounded-xl border-4 border-black shadow-xl hover:scale-[1.02] transition duration-300"
        >
          <h3 class="text-2xl font-bold mb-2">{{ item.serviceName }}</h3>

          <p><span class="font-semibold">Tanggal:</span>
            {{ new Date(item.date).toLocaleDateString('id-ID') }}
          </p>

          <p><span class="font-semibold">Jam:</span> {{ item.time || "Tidak ada" }}</p>

          <p class="mt-2">
            <span class="font-semibold">Harga:</span> Rp {{ item.price?.toLocaleString() }}
          </p>

          <div class="mt-4">
            <span
              class="px-3 py-1 rounded text-black font-bold bg-yellow-300 border border-black"
              v-if="item.status === 'pending'"
            >Pending</span>

            <span
              class="px-3 py-1 rounded text-black font-bold bg-green-300 border border-black"
              v-else-if="item.status === 'completed'"
            >Selesai</span>

            <span
              class="px-3 py-1 rounded text-black font-bold bg-red-300 border border-black"
              v-else
            >{{ item.status }}</span>
          </div>

        </div>

      </div>

    </main>
  </div>
</template>
