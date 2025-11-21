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
            <router-link to="/" class="text-4xl font-bold relative">
                Phour
                <span class="text-primary text-5xl absolute -bottom-2 -right-6 transform -rotate-12">to</span>
                <span class="absolute top-0 right-0 text-[8px] leading-none w-16 text-right">
                    we'll partner<br />with our<br />best
                </span>
            </router-link>

            <!-- Menu Navigasi (Desktop) -->
            <div class="hidden md:flex items-center space-x-3">
                <router-link to="/about"
                    class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">
                    About Us
                </router-link>
                <router-link to="/location"
                    class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">
                    Location
                </router-link>
                <router-link to="/claimphotos"
                    class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">
                    Claim Photos
                </router-link>
                <router-link to="/RiwayatBooking" class="bg-primary text-text-default px-3 py-1 border-3 border-outline shadow-solid 
                    hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 
                    transition-all duration-100 flex items-center gap-2">
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
                        class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">
                        SIGN UP
                    </router-link>
                </div>

                <!-- Jika sudah login -->
                <div v-else class="flex items-center space-x-4">
                    <router-link :to="userProfileLink" class="font-bold hover:text-primary transition-colors">
                        {{ userProfileText }}
                    </router-link>

                    <button @click="handleLogout"
                        class="bg-gray-700 text-white px-4 py-1 border-3 border-outline shadow-solid hover:bg-gray-800 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">
                        LOG OUT
                    </button>
                </div>
            </div>

        </div>
    </header>
</template>
