<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.stores.js'

const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

// Fungsi toggle menu mobile
const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Fungsi logout (sekalian tutup menu jika di mobile)
const handleLogout = () => {
    authStore.logout()
    isMobileMenuOpen.value = false
}
</script>

<template>
    <!-- Header Wrapper -->
    <header class="bg-background fixed top-0 left-0 right-0 z-50 border-b-3 border-outline shadow-sm">
        <div class="container mx-auto flex justify-between items-center px-4 h-20">

            <!-- === LOGO === -->
            <router-link to="/" class="inline-block z-50 relative">
                <img src="@/assets/logo-phourto.png" alt="Phourto Logo"
                    class="h-[60px] md:h-[100px] w-auto object-contain" />
            </router-link>

            <!-- === DESKTOP MENU (Hidden di Mobile) === -->
            <div class="hidden md:flex items-center space-x-4">
                <!-- Tambahkan bg-primary hover:bg-red-600 secara manual ke tombol menu -->
                <router-link to="/about" class="btn-retro-desktop bg-primary hover:bg-red-600">
                    About Us
                </router-link>
                <router-link to="/location" class="btn-retro-desktop bg-primary hover:bg-red-600">
                    Location
                </router-link>
                <router-link to="/claimphotos" class="btn-retro-desktop bg-primary hover:bg-red-600">
                    Claim Photos
                </router-link>
                <router-link to="/RiwayatBooking"
                    class="btn-retro-desktop bg-primary hover:bg-red-600 flex items-center gap-2">
                    Booking History
                </router-link>
            </div>

            <!-- === DESKTOP AUTH (Hidden di Mobile) === -->
            <div class="hidden md:flex items-center space-x-6">
                <!-- Jika belum login -->
                <div v-if="!authStore.isLoggedIn" class="flex items-center space-x-4">
                    <router-link to="/login" class="font-bold text-lg hover:text-primary transition-colors">
                        LOG IN
                    </router-link>
                    <router-link to="/register" class="btn-retro-desktop bg-primary hover:bg-red-600 px-6">
                        SIGN UP
                    </router-link>
                </div>

                <!-- Jika sudah login (Hanya tombol Logout) -->
                <div v-else class="flex items-center space-x-4">
                    <!-- Tombol Logout sekarang benar-benar abu-abu karena tidak ada konflik CSS -->
                    <button @click="handleLogout" class="btn-retro-desktop bg-gray-700 hover:bg-gray-800 text-white">
                        LOG OUT
                    </button>
                </div>
            </div>

            <!-- === MOBILE HAMBURGER BUTTON === -->
            <button @click="toggleMobileMenu"
                class="md:hidden z-50 p-2 focus:outline-none transition-transform active:scale-95">
                <!-- Icon Hamburger -->
                <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-text-default"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <!-- Icon Close (X) -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-text-default" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

        </div>

        <!-- === MOBILE MENU DROPDOWN === -->
        <div v-if="isMobileMenuOpen"
            class="md:hidden absolute top-20 left-0 w-full bg-background border-b-3 border-outline shadow-xl flex flex-col p-6 overflow-y-auto max-h-[calc(100vh-80px)] z-40">

            <!-- Navigasi Mobile (Style Retro Vertikal) -->
            <div class="flex flex-col gap-3 mb-6">
                <router-link to="/about" @click="isMobileMenuOpen = false" class="btn-retro-mobile bg-primary">
                    About Us
                </router-link>

                <router-link to="/location" @click="isMobileMenuOpen = false" class="btn-retro-mobile bg-primary">
                    Location
                </router-link>

                <router-link to="/claimphotos" @click="isMobileMenuOpen = false" class="btn-retro-mobile bg-primary">
                    Claim Photos
                </router-link>

                <router-link to="/RiwayatBooking" @click="isMobileMenuOpen = false" class="btn-retro-mobile bg-primary">
                    Booking History
                </router-link>
            </div>

            <hr class="border-outline border-2 mb-6 opacity-50" />

            <!-- Auth Mobile -->
            <div v-if="!authStore.isLoggedIn" class="flex flex-col gap-4">
                <router-link to="/login" @click="isMobileMenuOpen = false" class="btn-retro-mobile bg-white">
                    LOG IN
                </router-link>

                <router-link to="/register" @click="isMobileMenuOpen = false" class="btn-retro-mobile bg-primary">
                    SIGN UP
                </router-link>
            </div>

            <div v-else>
                <!-- Logout Button Mobile -->
                <button @click="handleLogout" class="btn-retro-mobile bg-gray-700 text-white hover:bg-gray-800">
                    LOG OUT
                </button>
            </div>
        </div>
    </header>

    <div class="h-20"></div>
</template>

<style scoped>
/* === STYLE BUTTON DESKTOP === 
    Dihapus: bg-primary dan hover:bg-red-600 (dipindah ke HTML)
    Agar tombol Logout bisa diganti warnanya dengan mudah.
*/
.btn-retro-desktop {
    @apply px-5 py-1.5 border-3 border-outline shadow-solid font-bold hover:translate-y-1 hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150 uppercase tracking-wide text-sm md:text-base;
}

/* === STYLE BUTTON MOBILE === */
.btn-retro-mobile {
    @apply w-full block text-center py-2 px-4 border-3 border-outline shadow-solid font-bold text-sm uppercase tracking-wide active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-150;
}
</style>