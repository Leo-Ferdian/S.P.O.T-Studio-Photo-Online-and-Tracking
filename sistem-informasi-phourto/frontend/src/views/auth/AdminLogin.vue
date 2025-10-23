<script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '../../stores/auth.stores';
    import { useRouter } from 'vue-router'; // Impor useRouter

    const authStore = useAuthStore();
    const router = useRouter(); // Gunakan useRouter
    const email = ref('');
    const password = ref('');
    const errorMessage = ref(null);

    const handleAdminLogin = async () => {
        errorMessage.value = null;
        try {
            // Panggil action login yang sama, tapi cek role setelahnya
            await authStore.login({ email: email.value, password: password.value });

            // Setelah login berhasil, cek role
            if (authStore.isAdmin) {
                // Jika admin, store sudah mengarahkan ke /admin/dashboard
                // Tidak perlu redirect manual di sini
            } else {
                // Jika BUKAN admin, logout paksa dan tampilkan error
                authStore.logout(); // Logout paksa
                errorMessage.value = 'Akses ditolak. Akun ini bukan akun admin.';
            }

        } catch (error) {
            errorMessage.value = 'Email atau password salah.';
        }
    };
</script>

<template>
    <div class="bg-background min-h-screen flex items-center justify-center font-display text-text-default">
        <div class="max-w-sm w-full p-8 space-y-6">
            <!-- Logo -->
            <router-link to="/"
                class="font-display text-5xl font-bold relative inline-block mx-auto mb-8 text-center block">
                Phour<span class="text-primary text-6xl absolute -bottom-2 -right-8 transform -rotate-12">to</span>
                <span class="absolute top-0 right-0 text-[10px] leading-none font-sans font-bold w-20 text-right">we'll
                    partner<br>with our<br>best</span>
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
                        class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all">
                </div>

                <div>
                    <label for="password" class="text-sm font-bold">Password</label>
                    <input v-model="password" type="password" id="password" required
                        class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all">
                </div>

                <button type="submit"
                    class="w-full bg-primary text-text-default font-bold py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">
                    SIGN IN
                </button>
            </form>
        </div>
    </div>
</template>