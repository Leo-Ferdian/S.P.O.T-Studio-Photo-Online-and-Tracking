<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.stores.js'

const authStore = useAuthStore()

// Fungsi untuk menangani logout
const handleLogout = () => {
    authStore.logout()
}

// --- PENYESUAIAN ---
// Computed property untuk link profil
const userProfileLink = computed(() => {
    if (authStore.isAdmin) return '/adminDashboard'
    if (authStore.isCustomer) return '/profile' // sesuaikan dengan route kamu
    return '/'
})

// // Computed property untuk teks tombol profil
// const userProfileText = computed(() => {
//     return authStore.isAdmin ? 'DASHBOARD' : 'PROFIL SAYA'
// })
</script>

<template>
    <header class="bg-background fixed top-0 left-0 right-0 z-50 border-b-3 border-outline">
        <div class="container mx-auto flex justify-between items-center px-4 h-20">

            <!-- Logo -->
            <router-link to="/" class="inline-block">
                <img src="@/assets/logo-phourto.png" alt="Phourto Logo" class="h-[100px] w-auto" />
            </router-link>



            <!-- Menu Navigasi (Desktop) -->
            <div class="hidden md:flex items-center space-x-3">
                <router-link to="/about"
                    class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 duration-100 hover:translate-y-1 hover:shadow-none transition-all">
                    About Us
                </router-link>
                <router-link to="/location"
                    class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 duration-100 hover:translate-y-1 hover:shadow-none transition-all">
                    Location
                </router-link>
                <router-link to="/claimphotos"
                    class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 duration-100 hover:translate-y-1 hover:shadow-none transition-all">
                    Claim Photos
                </router-link>
                <router-link to="/RiwayatBooking" class="bg-primary text-text-default px-3 py-1 border-3 border-outline shadow-solid 
                    hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 
                    duration-100 flex items-center gap-2 hover:translate-y-1 hover:shadow-none transition-all">
                    Booking History
                </router-link>
            </div>

            <!-- Area Auth -->
            <div class="flex items-center space-x-4">
                <!-- Jika belum login -->
                <div v-if="!authStore.isLoggedIn" class="flex items-center space-x-4">
                    <router-link to="/login" class="font-bold hover:text-primary transition-colors">
                        LOG IN
                    </router-link>
                    <router-link to="/register"
                        class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 duration-100 hover:translate-y-1 hover:shadow-none transition-all">
                        SIGN UP
                    </router-link>
                </div>

                <!-- Jika sudah login -->
                <div v-else class="flex items-center space-x-4">
                    <router-link :to="userProfileLink" class="font-bold hover:text-primary transition-colors">
                        {{ userProfileText }}
                    </router-link>

                    <button @click="handleLogout"
                        class="bg-gray-700 text-white px-4 py-1 border-3 border-outline shadow-solid hover:bg-gray-800 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 duration-100 hover:translate-y-1 hover:shadow-none transition-all">
                        LOG OUT
                    </button>
                </div>
            </div>

        </div>
    </header>
</template>
