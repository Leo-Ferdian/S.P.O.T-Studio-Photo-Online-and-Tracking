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
const isLoading = ref(false)

const handleRegister = async () => {
    errorMessage.value = null

    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Konfirmasi password tidak cocok.'
        return
    }

    isLoading.value = true

    try {
        await authStore.register({
            full_name: name.value,
            email: email.value,
            phone_number: phoneNumber.value, // pastikan sesuai dengan backend
            password: password.value,
            confirmPassword: confirmPassword.value
        })
    } catch (error) {
        errorMessage.value = error.message || 'Gagal mendaftar. Pastikan email belum terdaftar.'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="bg-background min-h-screen flex flex-col text-text-default">
        <!-- Main Content -->
        <main class="flex-grow flex items-center justify-center p-4">
            <div class="max-w-lg w-full space-y-6">

                <!-- Logo -->
                <router-link to="/" class="relative inline-block text-5xl font-bold mx-auto mb-8 block text-center">
                    Phour
                    <span class="text-primary text-6xl absolute -bottom-2 -right-8 transform -rotate-12">to</span>
                    <span class="absolute top-0 right-0 text-[10px] leading-none w-20 text-right">
                        we'll partner<br />with our<br />best
                    </span>
                </router-link>

                <!-- Register Form -->
                <form @submit.prevent="handleRegister" class="space-y-4">
                    <div v-if="errorMessage" class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary">
                        {{ errorMessage }}
                    </div>

                    <!-- Name -->
                    <div>
                        <label for="name" class="text-sm font-bold">Name</label>
                        <input v-model="name" type="text" id="name" required class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid 
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-offset-background focus:ring-primary transition-all" />
                    </div>

                    <!-- Email -->
                    <div>
                        <label for="email" class="text-sm font-bold">Email</label>
                        <input v-model="email" type="email" id="email" required class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid 
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-offset-background focus:ring-primary transition-all" />
                    </div>

                    <!-- Phone -->
                    <div>
                        <label for="phone" class="text-sm font-bold">Phone Number</label>
                        <input v-model="phoneNumber" type="tel" id="phone" required class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid 
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-offset-background focus:ring-primary transition-all" />
                    </div>

                    <!-- Password -->
                    <div>
                        <label for="password" class="text-sm font-bold">Password</label>
                        <input v-model="password" type="password" id="password" required class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid 
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-offset-background focus:ring-primary transition-all" />
                    </div>

                    <!-- Confirm Password -->
                    <div>
                        <label for="confirm-password" class="text-sm font-bold">Confirm Password</label>
                        <input v-model="confirmPassword" type="password" id="confirm-password" required class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid 
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-offset-background focus:ring-primary transition-all" />
                    </div>

                    <!-- Agreement -->
                    <p class="text-xs text-center mt-6">
                        Dengan melakukan pendaftaran, kamu telah menyetujui
                        <a href="#" class="text-primary hover:underline">Kebijakan Privasi</a> dan
                        <a href="#" class="text-primary hover:underline">Ketentuan Lainnya</a>.
                    </p>

                    <!-- Submit -->
                    <button type="submit" :disabled="isLoading" class="w-full bg-primary text-text-default font-bold py-3 border-3 border-outline shadow-solid 
                    hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 
                    transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="isLoading">LOADING...</span>
                        <span v-else>SUBMIT</span>
                    </button>
                </form>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-primary text-text-default font-bold p-4 border-t-3 border-outline text-center">
            Already have an account?
            <router-link to="/login" class="hover:underline text-background">Login</router-link>
        </footer>
    </div>
</template>
