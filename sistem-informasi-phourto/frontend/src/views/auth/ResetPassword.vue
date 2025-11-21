<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api/api';
import feather from 'feather-icons';

const route = useRoute();
const router = useRouter();

// --- State ---
const token = ref(null);
const password = ref('');
const confirmPassword = ref('');
const isPasswordVisible = ref(false); // State baru
const isConfirmPasswordVisible = ref(false); // State baru

const isLoading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

// --- Ambil Token dari URL ---
onMounted(() => {
    const urlToken = route.query.token;

    if (!urlToken) {
        errorMessage.value = 'Token reset tidak valid atau hilang. Silakan minta tautan baru.';
    }

    token.value = urlToken || null;
    nextTick(() => feather.replace());
});

// --- Handle Reset Password ---
const handlePasswordReset = async () => {
    errorMessage.value = null;
    successMessage.value = null;

    // Validasi
    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Konfirmasi password tidak cocok.';
        return;
    }

    if (password.value.length < 8) {
        errorMessage.value = 'Password minimal 8 karakter.';
        return;
    }

    isLoading.value = true;

    try {
        // --- PERBAIKAN DI SINI ---
        // Tambahkan 'confirmPassword' ke payload
        await apiClient.post('/auth/reset-password', {
            token: token.value,
            newPassword: password.value,
            confirmPassword: confirmPassword.value // <-- TAMBAHKAN BARIS INI
        });
        // -------------------------

        // Sukses!
        successMessage.value = 'Password Anda telah berhasil direset!';

        // Arahkan ke halaman login setelah 3 detik
        setTimeout(() => {
            router.push('/login');
        }, 3000);

    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Gagal mereset password. Token mungkin sudah kadaluwarsa.';
    } finally {
        isLoading.value = false;
    }
};

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value
}
const toggleConfirmPasswordVisibility = () => {
    isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value
}
</script>

<template>
    <div class="bg-background min-h-screen flex items-center justify-center text-text-default">
        <div class="max-w-lg w-full p-8 space-y-6">

            <!-- Logo -->
            <router-link to="/" class="text-5xl font-bold relative inline-block mx-auto mb-8 text-center">
                Phour
                <span class="text-primary text-6xl absolute -bottom-2 -right-8 transform -rotate-12">
                    to
                </span>
                <span class="absolute top-0 right-0 text-[10px] leading-none w-20 text-right">
                    we'll partner<br />with our<br />best
                </span>
            </router-link>

            <!-- Content -->
            <div>
                <h2 class="text-2xl font-bold text-center">Reset Password</h2>
                <p class="text-center text-sm mt-2 mb-6">
                    Masukkan password baru Anda di bawah ini.
                </p>

                <!-- Form -->
                <form v-if="token" @submit.prevent="handlePasswordReset" class="space-y-4">

                    <!-- Success -->
                    <div v-if="successMessage"
                        class="bg-green-500/20 text-green-700 text-sm p-3 border-2 border-green-500">
                        {{ successMessage }} Mengarahkan ke Login...
                    </div>

                    <!-- Error -->
                    <div v-if="errorMessage" class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary">
                        {{ errorMessage }}
                    </div>

                    <!-- Password -->
                    <div>
                        <label for="password" class="text-sm font-bold">Password Baru</label>
                        <div class="relative mt-1">
                            <input v-model="password" :type="isPasswordVisible ? 'text' : 'password'" id="password"
                                required class="form-input-setting">
                            <button type="button" @click="togglePasswordVisibility"
                                class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-inverse">
                                <span v-show="isPasswordVisible">
                                    <i data-feather="eye-off" class="w-5 h-5"></i>
                                </span>
                                <span v-show="!isPasswordVisible">
                                    <i data-feather="eye" class="w-5 h-5"></i>
                                </span>
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Min. 8 karakter, 1 huruf besar, 1 angka, 1 simbol.</p>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                        <label for="confirm-password" class="text-sm font-bold">Konfirmasi Password Baru</label>
                        <div class="relative mt-1">
                            <input v-model="confirmPassword" :type="isConfirmPasswordVisible ? 'text' : 'password'"
                                id="confirm-password" required class="form-input-setting">
                            <button type="button" @click="toggleConfirmPasswordVisibility"
                                class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-inverse">
                                <span v-show="isConfirmPasswordVisible">
                                    <i data-feather="eye-off" class="w-5 h-5"></i>
                                </span>
                                <span v-show="!isConfirmPasswordVisible">
                                    <i data-feather="eye" class="w-5 h-5"></i>
                                </span>
                            </button>
                        </div>
                    </div>

                    <!-- Button -->
                    <button type="submit" :disabled="isLoading || successMessage"
                        class="w-full bg-primary text-text-default font-bold py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isLoading ? 'MENYIMPAN...' : 'SIMPAN PASSWORD BARU' }}
                    </button>
                </form>

                <!-- No token -->
                <div v-if="!token && errorMessage"
                    class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary">
                    {{ errorMessage }}
                    <router-link to="/forgot-password" class="font-bold underline">
                        Minta tautan baru
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div
            class="absolute bottom-0 left-0 right-0 bg-primary text-text-default font-bold p-4 border-t-3 border-outline text-center">
            <router-link to="/login" class="hover:underline">
                Kembali ke Login
            </router-link>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.form-input-setting {
    @apply mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary;
}
</style>
