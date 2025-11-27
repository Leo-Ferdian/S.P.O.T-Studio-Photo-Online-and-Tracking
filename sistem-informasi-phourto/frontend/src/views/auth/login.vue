<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth.stores';
import feather from 'feather-icons';
import { useRoute, useRouter } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref(null);
const successMessage = ref(null);
const isLoading = ref(false);
const isPasswordVisible = ref(false);

const handleLogin = async () => {
    errorMessage.value = null;
    successMessage.value = null;
    isLoading.value = true;

    try {
        await authStore.login(email.value, password.value);

        if (authStore.isAdmin) {
            authStore.logout();
            throw new Error('Akun Admin harus login via /admin/login.');
        }

        // --- Navigasi manual setelah login ---
        const redirectPath = authStore.returnUrl || '/Home';
        authStore.returnUrl = null;
        router.push(redirectPath);
    } catch (error) {
        errorMessage.value =
            error.message || 'Email atau password yang Anda masukkan salah.';
    } finally {
        isLoading.value = false;
    }
};

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
};

onMounted(() => {
    if (route.query.registered === 'true') {
        successMessage.value = 'Registrasi berhasil! Silakan cek email Anda untuk OTP.';
    }
    if (route.query.verified === 'true') {
        successMessage.value = 'Verifikasi berhasil! Silakan login.';
    }
    nextTick(() => feather.replace());
});
</script>

<template>
    <!-- Menggunakan Flex Column agar footer responsive (sticky footer pattern) -->
    <div class="bg-background min-h-screen flex flex-col text-text-default font-sans">

        <!-- Bagian Tengah (Form) -->
        <!-- flex-grow akan mengisi ruang kosong, memastikan footer terdorong ke bawah -->
        <div class="flex-grow flex items-center justify-center p-4 md:p-0">
            <div class="max-w-lg w-full space-y-6 my-8 md:my-0">

                <!-- Logo -->
                <div class="text-center">
                    <router-link to="/" class="inline-block">
                        <!-- Responsive: h-[100px] di mobile, h-[150px] di desktop -->
                        <img src="@/assets/logo-phourto.png" alt="Phourto Logo"
                            class="h-[100px] md:h-[150px] w-auto object-contain transition-all duration-300" />
                    </router-link>
                </div>

                <!-- Form Login -->
                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div v-if="successMessage"
                        class="bg-green-500/20 text-green-700 text-sm p-3 border-2 border-green-500 rounded-sm font-bold">
                        {{ successMessage }}
                    </div>

                    <div v-if="errorMessage"
                        class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary rounded-sm font-bold">
                        {{ errorMessage }}
                    </div>

                    <!-- Input Email -->
                    <div>
                        <label for="email" class="text-sm font-bold block mb-1">Email</label>
                        <input v-model="email" type="email" id="email" required class="form-input-setting"
                            placeholder="Masukkan email Anda" />
                    </div>

                    <!-- Input Password -->
                    <div>
                        <label for="password" class="text-sm font-bold block mb-1">Password</label>
                        <div class="relative">
                            <input v-model="password" :type="isPasswordVisible ? 'text' : 'password'" id="password"
                                required class="form-input-setting pr-10" placeholder="Masukkan password Anda" />
                            <button type="button" @click="togglePasswordVisibility"
                                class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-inverse hover:text-gray-200 transition-colors">
                                <span v-show="!isPasswordVisible">
                                    <i data-feather="eye-off" class="w-5 h-5"></i>
                                </span>
                                <span v-show="isPasswordVisible">
                                    <i data-feather="eye" class="w-5 h-5"></i>
                                </span>
                            </button>
                        </div>
                        <router-link to="/forgot-password"
                            class="block text-right text-xs mt-1 hover:underline hover:text-primary font-bold transition-colors">
                            Forgot Password?
                        </router-link>
                    </div>

                    <!-- Tombol Sign In -->
                    <button type="submit" :disabled="isLoading"
                        class="w-full bg-primary text-text-default font-bold py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="isLoading">LOADING...</span>
                        <span v-else>SIGN IN</span>
                    </button>
                </form>

                <!-- Garis Pemisah -->
                <div class="relative text-center my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t-3 border-outline"></div>
                    </div>
                    <div class="relative inline-block px-4 bg-background font-bold text-gray-500">Phour.to</div>
                </div>

        

                <!-- Catatan Privasi -->
                <p class="text-xs text-center pt-2 leading-relaxed text-gray-600">
                    Dengan melakukan pendaftaran, kamu telah menyetujui
                    <a href="#" class="text-primary hover:underline font-bold">Kebijakan Privasi</a>
                    dan
                    <a href="#" class="text-primary hover:underline font-bold">Ketentuan Lainnya</a>.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <!-- Tidak menggunakan absolute agar tidak tertutup keyboard di mobile -->
        <div class="bg-primary text-text-default font-bold p-4 border-t-3 border-outline text-center w-full">
            Don't have an account?
            <router-link to="/register"
                class="hover:underline text-yellow-300 underline decoration-2 underline-offset-2 ml-1">
                Register
            </router-link>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.form-input-setting {
    /* Placeholder color disesuaikan agar terlihat di background merah */
    @apply w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all;
}
</style>