<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useAuthStore } from '../../stores/auth.stores';
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
    <div class="bg-background min-h-screen flex items-center justify-center text-text-default">
        <div class="max-w-lg w-full p-8 space-y-6">
            <!-- Logo -->
            <router-link to="/" class="text-5xl font-bold relative inline-block mx-auto mb-8">
                Phour
                <span class="text-primary text-6xl absolute -bottom-2 -right-8 transform -rotate-12">to</span>
                <span class="absolute top-0 right-0 text-[10px] leading-none w-20 text-right">
                    we'll partner<br />with our<br />best
                </span>
            </router-link>

            <!-- Form Login -->
            <form @submit.prevent="handleLogin" class="space-y-4">
                <div v-if="successMessage" class="bg-green-500/20 text-green-700 text-sm p-3 border-2 border-green-500">
                    {{ successMessage }}
                </div>

                <div v-if="errorMessage" class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary">
                    {{ errorMessage }}
                </div>

                <!-- Input Email -->
                <div>
                    <label for="email" class="text-sm font-bold">Email</label>
                    <input v-model="email" type="email" id="email" required class="form-input-setting" />
                </div>

                <!-- Input Password -->
                <div>
                    <label for="password" class="text-sm font-bold">Password</label>
                    <div class="relative mt-1">
                        <input v-model="password" :type="isPasswordVisible ? 'text' : 'password'" id="password" required
                            class="form-input-setting" />
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
                    <router-link to="/forgot-password" class="block text-right text-xs mt-1 hover:underline">
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
            <div class="relative text-center">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t-3 border-outline"></div>
                </div>
                <div class="relative inline-block px-2 bg-background">OR</div>
            </div>

            <!-- Tombol Google -->
            <button :disabled="isLoading"
                class="w-full bg-white text-text-default font-bold py-3 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                    alt="Google logo" class="h-6 mr-2" />
                Sign in with Google
            </button>

            <!-- Catatan Privasi -->
            <p class="text-xs text-center pt-4">
                Dengan melakukan pendaftaran, kamu telah menyetujui
                <a href="#" class="text-primary hover:underline">Kebijakan Privasi</a>
                dan
                <a href="#" class="text-primary hover:underline">Ketentuan Lainnya</a>.
            </p>
        </div>

        <!-- Footer -->
        <div
            class="absolute bottom-0 left-0 right-0 bg-primary text-text-default font-bold p-4 border-t-3 border-outline text-center">
            Don't have an account?
            <router-link to="/register" class="hover:underline text-background">
                Register
            </router-link>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.form-input-setting {
    @apply mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all;
}
</style>
