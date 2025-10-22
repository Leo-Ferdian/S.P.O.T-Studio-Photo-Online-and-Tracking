<script setup>
import { useAuthStore } from '../../stores/auth.stores';
const authStore = useAuthStore();

// Fungsi untuk menangani logout
const handleLogout = () => {
    authStore.logout();
};
</script>

<template>
    <header class="bg-background fixed top-0 left-0 right-0 z-50 border-b-3 border-outline">
        <div class="container mx-auto flex justify-between items-center px-4 h-20">
            <!-- Logo Sesuai Desain -->
            <router-link to="/" class="font-display text-4xl font-bold relative">
                Phour<span class="text-primary text-5xl absolute -bottom-2 -right-6 transform -rotate-12">to</span>
                <span class="absolute top-0 right-0 text-[8px] leading-none font-sans font-bold w-16 text-right">we'll partner<br>with our<br>best</span>
            </router-link>

            <!-- Navigasi Tengah -->
            <div class="hidden md:flex items-center space-x-3">
                <router-link to="/about" class="bg-primary text-text-default font-display px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">About Us</router-link>
                <router-link to="/location" class="bg-primary text-text-default font-display px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">Location</router-link>
                <router-link to="/claim" class="bg-primary text-text-default font-display px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">Claim Photos</router-link>
                <router-link to="/frames" class="bg-primary text-text-default font-display px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">Frame Catalog</router-link>
            </div>

            <!-- Navigasi Kanan (Login/Signup atau Dashboard) -->
            <div class="flex items-center space-x-4 font-display">
                <!-- Tampilan jika PENGGUNA BELUM LOGIN -->
                <div v-if="!authStore.isLoggedIn" class="flex items-center space-x-4">
                    <router-link to="/login" class="font-bold hover:text-primary transition-colors">LOG IN</router-link>
                    <router-link to="/register" class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">SIGN UP</router-link>
                </div>
                <!-- Tampilan jika PENGGUNA SUDAH LOGIN -->
                <div v-else class="flex items-center space-x-4">
                    <router-link to="/dashboard" class="font-bold hover:text-primary transition-colors">DASHBOARD</router-link>
                    <button @click="handleLogout" class="bg-gray-700 text-white px-4 py-1 border-3 border-outline shadow-solid hover:bg-gray-800 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">LOG OUT</button>
                </div>
            </div>
        </div>
    </header>
</template>