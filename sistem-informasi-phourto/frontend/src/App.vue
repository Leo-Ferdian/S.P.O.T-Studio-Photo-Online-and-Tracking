<script setup>
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// PERBAIKAN: Pisahkan logika untuk Header dan Footer

// 1. Tampilkan Header utama HANYA jika bukan halaman dengan header kustom
const showMainHeader = computed(() => {
  const pagesWithCustomHeader = [
    'Login',
    'Register',
    'Location',
    'ServiceDetail',
    'AboutUs',
    'BranchDetail',
    'ForgotPassword',
    'claimphotos',
    'BookingConfirmation',
    'BookingAppointment',
    'BookingSummary',
    'framecatalog',
    'BookingSuccess',
    'Payment',
    // Halaman Admin
    'AdminDashboard',
    'AdminBookings',
    'AdminUsers',
    'AdminUserDetail',
    'AdminPackages',
    'AdminGallery',
    'AdminLogin'];
  return !pagesWithCustomHeader.includes(route.name);
});

// 2. Tampilkan Footer HANYA jika bukan halaman full-screen (auth)
const showMainFooter = computed(() => {
  const fullScreenPages = ['Login',
    'Register',
    'ForgotPassword',
    'BookingSuccess',
    // Halaman Admin
    'AdminDashboard',
    'AdminBookings',
    'AdminUsers',
    'AdminPackages',
    'AdminGallery',
    'AdminLogin'];
  return !fullScreenPages.includes(route.name);
});

// Tambahan: Cek apakah halaman adalah halaman auth
const isAuthRoute = computed(() => {
  // Tambahkan 'AdminLogin' ke daftar
  const authPages = ['Login', 'Register', 'ForgotPassword', 'AdminLogin'];
  return authPages.includes(route.name);
});


</script>

<template>
  <div class="min-h-screen font-sans">
    <!-- Header utama hanya akan tampil jika `showMainHeader` bernilai true -->
    <AppHeader v-if="showMainHeader" />

    <!-- Padding atas pada main hanya ditambahkan jika header utama tampil -->
    <main :class="{ 'pt-20': showMainHeader }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer akan tampil jika `showMainFooter` bernilai true -->
    <AppFooter v-if="showMainFooter" />
  </div>
</template>

<style>
/* ... (style transisi fade Anda tetap sama) ... */
</style>