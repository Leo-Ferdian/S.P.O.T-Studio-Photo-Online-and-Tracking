<script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '../../stores/auth.stores';
    import feather from 'feather-icons';
    import { onMounted } from 'vue';

    const authStore = useAuthStore();
    const email = ref('');
    const password = ref('');
    const errorMessage = ref(null);
    const isPasswordVisible = ref(false);

    const handleLogin = async () => {
        errorMessage.value = null;
        try {
            await authStore.login({ email: email.value, password: password.value });
            // Pengalihan halaman ditangani oleh auth.stores.js
        } catch (error) {
            errorMessage.value = 'Email atau password yang Anda masukkan salah.';
        }
    };

    const togglePasswordVisibility = () => {
        isPasswordVisible.value = !isPasswordVisible.value;
        // Panggil feather.replace() lagi setelah mengubah ikon
        setTimeout(() => feather.replace(), 0);
    };

    onMounted(() => {
        feather.replace();
    });
</script>

<template>
    <div class="bg-background min-h-screen flex items-center justify-center font-display text-text-default">
        <div class="max-w-lg w-full p-8 space-y-6">
            <!-- Logo -->
            <router-link to="/" class="font-display text-5xl font-bold relative inline-block mx-auto mb-8">
                Phour<span class="text-primary text-6xl absolute -bottom-2 -right-8 transform -rotate-12">to</span>
                <span class="absolute top-0 right-0 text-[10px] leading-none font-sans font-bold w-20 text-right">we'll
                    partner<br>with our<br>best</span>
            </router-link>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <!-- Error Message -->
                <div v-if="errorMessage" class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary">
                    {{ errorMessage }}
                </div>

                <!-- Email Input -->
                <div>
                    <label for="email" class="text-sm font-bold">Email</label>
                    <input v-model="email" type="email" id="email" required
                        class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all">
                </div>

                <!-- Password Input -->
                <div>
                    <label for="password" class="text-sm font-bold">Password</label>
                    <div class="relative mt-1">
                        <input v-model="password" :type="isPasswordVisible ? 'text' : 'password'" id="password" required
                            class="w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all">
                        <button type="button" @click="togglePasswordVisibility"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-inverse">
                            <i v-if="isPasswordVisible" data-feather="eye-off"></i>
                            <i v-else data-feather="eye"></i>
                        </button>
                    </div>
                    <router-link to="/forgot-password" class="block text-right text-xs mt-1 hover:underline">
                        Forgot Password?
                    </router-link>
                </div>

                <!-- Sign In Button -->
                <button type="submit"
                    class="w-full bg-primary text-text-default font-bold py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">
                    SIGN IN
                </button>
            </form>

            <div class="relative text-center">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t-3 border-outline"></div>
                </div>
                <div class="relative inline-block px-2 bg-background">OR</div>
            </div>

            <!-- Google Button -->
            <button
                class="w-full bg-white text-text-default font-bold py-3 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100 flex items-center justify-center">
                <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                    alt="Google logo" class="h-6 mr-2">
                <!-- Google -->
            </button>

            <p class="text-xs text-center pt-4">
                Dengan melakukan pendaftaran, kamu telah menyetujui <a href="#"
                    class="text-primary hover:underline">Kebijakan Privasi</a> dan <a href="#"
                    class="text-primary hover:underline">Ketentuan Lainya</a>
            </p>

        </div>
        <!-- Footer Link -->
        <div
            class="absolute bottom-0 left-0 right-0 bg-primary text-text-default font-bold p-4 border-t-3 border-outline text-center">
            Don't have account? <router-link to="/register" class="hover:underline text-background">Register</router-link>
        </div>
    </div>
</template>