<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.stores'

const authStore = useAuthStore()
const name = ref('')
const email = ref('')
const phoneNumber = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref(null)

const handleRegister = async () => {
    errorMessage.value = null
    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Konfirmasi password tidak cocok.'
        return
    }

    try {
        await authStore.register({
            full_name: name.value,
            email: email.value,
            whatsapp_number: phoneNumber.value,
            password: password.value,
        })
    } catch (error) {
        errorMessage.value =
            error.response?.data?.message ||
            'Gagal mendaftar. Pastikan email belum terdaftar.'
    }
}
</script>

<template>
    <!-- Layout utama dengan flex-col untuk memisahkan main dan footer -->
    <div class="bg-background min-h-screen flex flex-col font-display text-text-default">
        <!-- Konten utama yang akan di-center secara vertikal dan horizontal -->
        <main class="flex-grow flex items-center justify-center p-4">
            <div class="max-w-lg w-full space-y-6">
                <!-- Logo -->
                <router-link to="/" class="font-display text-5xl font-bold relative inline-block mx-auto mb-8 text-center block">
                    Phour<span class="text-primary text-6xl absolute -bottom-2 -right-8 transform -rotate-12">to</span>
                    <span class="absolute top-0 right-0 text-[10px] leading-none font-sans font-bold w-20 text-right">we'll partner<br />with our<br />best</span>
                </router-link>

                <form @submit.prevent="handleRegister" class="space-y-4">
                    <div v-if="errorMessage" class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary">
                        {{ errorMessage }}
                    </div>

                    <!-- Name Input -->
                    <div>
                        <label for="name" class="text-sm font-bold">Name</label>
                        <input v-model="name" type="text" id="name" required class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all" />
                    </div>

                    <!-- Email Input -->
                    <div>
                        <label for="email" class="text-sm font-bold">Email</label>
                        <input v-model="email" type="email" id="email" required class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all" />
                    </div>

                    <!-- Phone Number Input -->
                    <div>
                        <label for="phone" class="text-sm font-bold">Phone Number</label>
                        <input v-model="phoneNumber" type="tel" id="phone" required class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all" />
                    </div>

                    <!-- Password Input -->
                    <div>
                        <label for="password" class="text-sm font-bold">Password</label>
                        <input v-model="password" type="password" id="password" required class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all" />
                    </div>

                    <!-- Confirm Password Input -->
                    <div>
                        <label for="confirm-password" class="text-sm font-bold">Confirm Password</label>
                        <input v-model="confirmPassword" type="password" id="confirm-password" required class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all" />
                    </div>

                    <p class="text-xs text-center !mt-6">
                        Dengan melakukan pendaftaran, kamu telah menyetujui
                        <a href="#" class="text-primary hover:underline">Kebijakan Privasi</a> dan
                        <a href="#" class="hover:underline">Ketentuan Lainnya</a>
                    </p>

                    <button type="submit" class="w-full bg-primary text-white font-bold py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">
                        SUBMIT
                    </button>
                </form>
            </div>
        </main>

        <!-- Footer yang dipisahkan -->
        <footer class="bg-primary text-white font-bold p-4 border-t-3 border-outline text-center">
            Already have an account?
            <router-link to="/login" class="hover:underline text-background">Login</router-link>
        </footer>
    </div>
</template>