<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/api'


// State data
const recentBooking = ref(null)
const userPhotos = ref([])

// Fetch dashboard user
const fetchUserDashboard = async () => {
    try {
        const bookingRes = await apiClient.get('/user/dashboard/recent-booking')
        const photoRes = await apiClient.get('/user/dashboard/photos')

        recentBooking.value = bookingRes.data.data
        userPhotos.value = photoRes.data.data
    } catch (error) {
        console.error('Gagal mengambil data dashboard user:', error)
    }
}

onMounted(() => {
    fetchUserDashboard()
})
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

        <!-- MAIN CONTENT -->
        <main class="flex-1 p-8">

            <!-- HEADER -->
            <div class="flex justify-between items-center mb-10">
                <h1 class="text-4xl font-bold text-[#f3f7f5]">Dashboard User</h1>
            </div>

            <!-- BUTTON ACTIONS - full grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

    <router-link
        to="/home"
        class="text-xl bg-primary text-white px-4 py-3 font-semibold border-3 border-outline 
               shadow-solid hover:bg-[#A21217] cursor-pointer w-full text-center block"
    >
        Buat Booking Baru
    </router-link>

    <router-link
        to="/RiwayatBooking"
        class="text-xl bg-primary text-white px-4 py-3 font-semibold border-3 border-outline 
               shadow-solid hover:bg-[#A21217] cursor-pointer w-full text-center block"
    >
        Lacak Riwayat Booking
    </router-link>

    <router-link
        to="/gallery"
        class="text-xl bg-primary text-white px-4 py-3 font-semibold border-3 border-outline 
               shadow-solid hover:bg-[#A21217] cursor-pointer w-full text-center block"
    >
        Lihat Hasil Foto
    </router-link>

    <router-link
        to="/profile"
        class="text-xl bg-primary text-white px-4 py-3 font-semibold border-3 border-outline 
               shadow-solid hover:bg-[#A21217] cursor-pointer w-full text-center block"
    >
        Edit Profile
    </router-link>

</div>



            <!-- RIWAYAT BOOKING TERBARU -->
            <div class="bg-primary text-white p-4 rounded mb-10 border-3 border-outline shadow-solid">
                <h2 class="font-bold text-lg mb-2 ">Riwayat Booking Terbaru</h2>

                <div v-if="recentBooking">
                    <p>Jenis Layanan: {{ recentBooking.serviceName }}</p>
                    <p>Tanggal: {{ new Date(recentBooking.date).toLocaleDateString('id-ID') }}</p>
                    <p>Status: <span class="font-bold">{{ recentBooking.status }}</span></p>
                </div>

                <p v-else class="text-gray-200">Tidak ada booking terbaru.</p>
            </div>

            <!-- HASIL FOTO ANDA -->
            <div class="bg-primary text-white p-4 rounded border-3 border-outline shadow-solid">
                <h2 class="font-bold text-lg mb-4">Hasil Foto Anda</h2>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div v-for="(photo, index) in userPhotos" :key="index">
                        <img :src="photo.url" class="rounded shadow-md border border-black" />
                    </div>

                    <p v-if="userPhotos.length === 0" class="col-span-4 text-center text-gray-200">
                        Belum ada hasil foto.
                    </p>
                </div>
            </div>

        </main>
    </div>
</template>