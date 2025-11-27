<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api/api';
import feather from 'feather-icons';

const route = useRoute();
const router = useRouter();

// Ambil email dari URL (?email=...)
const email = ref(route.query.email || '');
const otp = ref('');

const isLoading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

// Email dikunci jika berasal dari URL
const isEmailDisabled = computed(() => !!route.query.email);

const handleVerify = async () => {
    errorMessage.value = null;
    successMessage.value = null;
    isLoading.value = true;

    try {
        await apiClient.post('/auth/verify-otp', {
            email: email.value,
            otp: otp.value
        });

        successMessage.value = 'Verifikasi berhasil! Mengarahkan Anda ke halaman login...';

        setTimeout(() => {
            router.push({ name: 'Login', query: { verified: 'true' } });
        }, 3000);

    } catch (error) {
        errorMessage.value =
            error.response?.data?.message ||
            'Gagal memverifikasi OTP. Kode salah atau sudah kedaluwarsa.';
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    if (!email.value) {
        errorMessage.value = 'Email tidak ditemukan. Silakan masukkan email Anda.';
    }
    nextTick(() => feather.replace());
});
</script>

<template>
    <div class="bg-background min-h-screen flex items-center justify-center text-text-default">
        <div class="max-w-lg w-full p-8 space-y-6 text-center">

            <!-- Logo -->
            <router-link to="/" class="inline-block">
                        <!-- Responsive: h-[100px] di mobile, h-[150px] di desktop -->
                        <img src="@/assets/logo-phourto.png" alt="Phourto Logo"
                            class="h-[100px] md:h-[150px] w-auto object-contain transition-all duration-300" />
                    </router-link>

            <div>
                <h2 class="text-2xl font-bold text-center">Verifikasi Email Anda</h2>

                <p class="text-center text-sm mt-2 mb-6">
                    Kami telah mengirimkan kode OTP 6 digit ke
                    <span class="font-bold">{{ email || 'email Anda' }}</span>.
                </p>

                <!-- FORM UTAMA -->
                <form v-if="!successMessage" @submit.prevent="handleVerify" class="space-y-4">

                    <!-- Error -->
                    <div v-if="errorMessage" class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary">
                        {{ errorMessage }}
                    </div>

                    <!-- Email -->
                    <div>
                        <label for="email" class="text-sm font-bold">Email</label>
                        <input v-model="email" type="email" id="email" required :disabled="isEmailDisabled"
                            class="form-input-setting" :class="{ 'opacity-70': isEmailDisabled }" />
                    </div>

                    <!-- OTP -->
                    <div>
                        <label for="otp" class="text-sm font-bold">Kode OTP</label>
                        <input v-model="otp" type="text" id="otp" required placeholder="123456" maxlength="6"
                            class="form-input-setting" />
                    </div>

                    <!-- Tombol Verifikasi -->
                    <button type="submit" :disabled="isLoading" class="w-full bg-primary text-text-default font-bold py-3 border-3 border-outline shadow-solid 
                hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isLoading ? 'MEMVERIFIKASI...' : 'VERIFIKASI & AKTIFKAN' }}
                    </button>
                </form>

                <!-- Sukses -->
                <div v-if="successMessage"
                    class="bg-green-500/20 text-green-700 text-sm p-3 border-2 border-green-500 text-center">
                    {{ successMessage }}
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div
            class="absolute bottom-0 left-0 right-0 bg-primary text-text-default font-bold p-4 border-t-3 border-outline text-center">
            Back To
            <router-link to="/login"
                class="hover:underline text-yellow-300 underline decoration-2 underline-offset-2 ml-1">
                Login
            </router-link>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.form-input-setting {
    @apply mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary;
}
</style>
