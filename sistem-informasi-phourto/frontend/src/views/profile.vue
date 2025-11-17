<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/api'

// State
const user = ref({
  name: '',
  email: '',
  phone: '',
})

// Fetch data user
const fetchUserProfile = async () => {
  try {
    const res = await apiClient.get('/user/profile')
    user.value = res.data.data
  } catch (error) {
    console.error("Gagal memuat profile:", error)
  }
}

// Update profile
const updateProfile = async () => {
  try {
    await apiClient.put('/user/profile/update', user.value)
    alert('Profile berhasil diperbarui!')
  } catch (error) {
    console.error("Gagal update profile:", error)
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <div class="min-h-screen flex bg-background">

    <!-- SIDEBAR (copy dari dashboard) -->
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

      <!-- Header -->
      <h1 class="text-4xl font-bold text-white mb-10">Profile User</h1>

      <!-- CONTENT -->
      <div class="bg-primary text-white p-6 rounded border-3 border-outline shadow-solid max-w-xl">

        <h2 class="text-xl font-bold mb-4">Informasi Akun</h2>

        <div class="flex flex-col gap-4">

          <label class="flex flex-col">
            <span>Nama</span>
            <input v-model="user.name" type="text"
              class="px-3 py-2 text-black rounded" />
          </label>

          <label class="flex flex-col">
            <span>Email</span>
            <input v-model="user.email" type="email"
              class="px-3 py-2 text-black rounded" />
          </label>

          <label class="flex flex-col">
            <span>No. Telepon</span>
            <input v-model="user.phone" type="text"
              class="px-3 py-2 text-black rounded" />
          </label>

          <button @click="updateProfile"
            class="bg-black text-white py-3 px-6 rounded mt-4 hover:bg-gray-800">
            Simpan Perubahan
          </button>
        </div>
      </div>

    </main>
  </div>
</template>
