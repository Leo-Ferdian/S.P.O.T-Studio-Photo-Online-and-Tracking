<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useAuthStore } from '../../stores/auth.stores';
import { useRouter } from 'vue-router';
import feather from 'feather-icons';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref(null);
const isLoading = ref(false);
const isPasswordVisible = ref(false);

const handleAdminLogin = async () => {
    errorMessage.value = null;
    isLoading.value = true;

    try {
        await authStore.login(email.value, password.value);

        // Cek role setelah login
        if (authStore.isAdmin) {
            const redirectPath = authStore.returnUrl || '/admin/dashboard';
            authStore.returnUrl = null;
            router.push(redirectPath);
        } else {
            authStore.logout();
            throw new Error('Akses ditolak. Akun ini bukan akun admin.');
        }

    } catch (error) {
        errorMessage.value =
            error.message || 'Email atau password yang Anda masukkan salah.';
    } finally {
        isLoading.value = false;
    }
};

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
    nextTick(() => feather.replace());
};

onMounted(() => {
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

            <form @submit.prevent="handleAdminLogin" class="space-y-4">
                <h2 class="text-2xl font-bold text-center">ADMIN LOGIN</h2>

                <!-- Error Message -->
                <div v-if="errorMessage" class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary">
                    {{ errorMessage }}
                </div>

                <!-- Email -->
                <div>
                    <label for="email" class="text-sm font-bold">Email</label>
                    <input v-model="email" type="email" id="email" required class="form-input-setting" />
                </div>

                <!-- Password -->
                <div>
                    <label for="password" class="text-sm font-bold">Password</label>

                    <div class="relative mt-1">
                        <input v-model="password" :type="isPasswordVisible ? 'text' : 'password'" id="password" required
                            class="form-input-setting" />

                        <button type="button" @click="togglePasswordVisibility"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-inverse">
                            <i v-if="isPasswordVisible" data-feather="eye-off" class="w-5 h-5"></i>
                            <i v-else data-feather="eye" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>

                <!-- Login Button -->
                <button type="submit" :disabled="isLoading"
                    class="w-full bg-primary text-text-default font-bold py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="isLoading">LOADING...</span>
                    <span v-else>SIGN IN</span>
                </button>
            </form>
        </div>

        <!-- Footer -->
        <div
            class="absolute bottom-0 left-0 right-0 bg-primary text-text-default font-bold p-4 border-t-3 border-outline text-center">
            Kembali ke
            <router-link to="/" class="hover:underline text-background">
                Halaman Utama
            </router-link>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.form-input-setting {
    @apply mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all;
}
</style>
