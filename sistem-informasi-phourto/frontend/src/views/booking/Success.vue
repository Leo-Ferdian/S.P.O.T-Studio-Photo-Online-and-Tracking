<script setup>
    import { onMounted } from 'vue';
    import { useBookingStore } from '../../stores/booking.stores.js';
    import { useAuthStore } from '../../stores/auth.stores';

    const bookingStore = useBookingStore();
    const authStore = useAuthStore();

    // Reset state booking setelah halaman ini ditampilkan
    onMounted(() => {
        // bookingStore.resetBooking(); // Aktifkan ini jika ingin state direset otomatis
    });
</script>

<template>
    <div class="bg-background min-h-screen flex items-center justify-center font-display text-text-default relative">

        <div class="max-w-xl w-full p-8 space-y-8 text-center">
            <!-- Logo -->
            <div class="text-center">
                    <router-link to="/" class="inline-block">
                        <!-- Responsive: h-[100px] di mobile, h-[150px] di desktop -->
                        <img src="@/assets/logo-phourto.png" alt="Phourto Logo"
                            class="h-[100px] md:h-[150px] w-auto object-contain transition-all duration-300" />
                    </router-link>
                </div>

            <!-- Pesan Verifikasi -->
            <div class="bg-primary text-white p-10 border-4 border-outline shadow-solid max-w-md mx-auto">
                <h2 class="text-xl font-bold leading-tight">
                    Kami Akan Mengirimkan Kode verifikasi melalui email
                </h2>
            </div>

            <!-- Informasi Tambahan (Opsional) -->
            <p class="font-sans text-sm text-gray-700 pt-4">
                Silakan periksa inbox (dan folder spam) email Anda <span v-if="authStore.user" class="font-bold">{{
                    authStore.user.email }}</span> untuk detail pesanan dan kode unik Anda.
            </p>
            <p class="font-sans text-sm text-gray-700">
                Tunjukkan kode unik tersebut saat Anda tiba di studio.
            </p>

            <!-- Tombol Kembali ke Home (Opsional) -->
            <div class="pb-12">
                <router-link to="/"
                    class="inline-block bg-primary text-text-default font-bold py-3 px-8 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 hover:translate-y-1 hover:shadow-none transition-all">
                    Kembali ke Beranda
                </router-link>
            </div>

        </div>

        <!-- Footer Link (Tetap ada seperti halaman auth lainnya) -->
        <div
            class="absolute bottom-0 left-0 right-0 bg-primary text-text-default font-bold p-4 border-t-3 border-outline text-center font-sans">
            Terima kasih telah memesan!
        </div>
    </div>
</template>