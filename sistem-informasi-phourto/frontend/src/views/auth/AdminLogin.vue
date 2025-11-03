<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth.stores';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errorMessage = ref(null);
const isLoading = ref(false);

const handleAdminLogin = async () => {
    errorMessage.value = null;
    isLoading.value = true;

    try {
        // Store mengharapkan argumen (email, password)
        await authStore.login(email.value, password.value);

        // Cek apakah akun adalah admin
        if (authStore.isAdmin) {
            // Jika admin, router sudah di-handle oleh store
        } else {
            authStore.logout();
            errorMessage.value = 'Akses ditolak. Akun ini bukan akun admin.';
        }
    } catch (error) {
        errorMessage.value = error.message || 'Email atau password salah.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="bg-background min-h-screen flex items-center justify-center text-text-default">
        <div class="max-w-sm w-full p-8 space-y-6">
            <!-- Logo -->
            <router-link to="/" class="text-5xl font-bold relative inline-block mx-auto mb-8 text-center block">
                Phour
                <span class="text-primary text-6xl absolute -bottom-2 -right-8 transform -rotate-12">to</span>
                <span class="absolute top-0 right-0 text-[10px] leading-none font-bold w-20 text-right">
                    we'll partner<br />
                    with our<br />
                    best
                </span>
            </router-link>

            <h2 class="text-center text-3xl font-extrabold text-text-default">
                Admin Login
            </h2>

            <form @submit.prevent="handleAdminLogin" class="space-y-4">
                <div v-if="errorMessage" class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary">
                    {{ errorMessage }}
                </div>

                <div>
                    <label for="email" class="text-sm font-bold">Email</label>
                    <input v-model="email" type="email" id="email" required
                        class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all" />
                </div>

                <div>
                    <label for="password" class="text-sm font-bold">Password</label>
                    <input v-model="password" type="password" id="password" required
                        class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all" />
                </div>

                <!-- Tombol dengan state loading -->
                <button type="submit" :disabled="isLoading"
                    class="w-full bg-primary text-text-default font-bold py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="isLoading">LOADING...</span>
                    <span v-else>SIGN IN</span>
                </button>
            </form>
        </div>
    </div>
</template>
