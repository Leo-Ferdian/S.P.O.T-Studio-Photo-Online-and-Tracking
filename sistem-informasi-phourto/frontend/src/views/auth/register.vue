<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth.stores'
import feather from 'feather-icons'

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const phoneNumber = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref(null)
const isLoading = ref(false)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

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
            phone_number: phoneNumber.value,
            password: password.value,
            confirmPassword: confirmPassword.value,
        })
        router.push({
            name: '/login',
            query: { registered: 'true' } // Kirim pesan sukses
        });

    } catch (error) {
        errorMessage.value =
            error.message || 'Gagal mendaftar. Pastikan email belum terdaftar.'
    } finally {
        isLoading.value = false
    }
}

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value
    nextTick(() => feather.replace())
}

const toggleConfirmPasswordVisibility = () => {
    isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value
    nextTick(() => feather.replace())
}

onMounted(() => {
    feather.replace()
})
</script>

<template>
    <div class="bg-background min-h-screen flex flex-col text-text-default">
        <!-- Main Content -->
        <main class="flex-grow flex items-center justify-center p-4">
            <div class="max-w-lg w-full space-y-6">
                <!-- Logo -->
                <router-link to="/Home" class="text-5xl font-bold relative inline-block mx-auto mb-8 text-center block">
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
                        <input v-model="name" type="text" id="name" required class="form-input" />
                    </div>

                    <!-- Email -->
                    <div>
                        <label for="email" class="text-sm font-bold">Email</label>
                        <input v-model="email" type="email" id="email" required class="form-input" />
                    </div>

                    <!-- Phone -->
                    <div>
                        <label for="phone" class="text-sm font-bold">Phone Number</label>
                        <input v-model="phoneNumber" type="tel" id="phone" required class="form-input" />
                    </div>

                    <!-- Password & Confirm Password -->
                    <div class="space-y-4">
                        <!-- Password -->
                        <div>
                            <label for="password" class="text-sm font-bold">Password</label>
                            <div class="relative mt-1">
                                <input v-model="password" :type="isPasswordVisible ? 'text' : 'password'" id="password"
                                    required class="form-input" />
                                <button type="button" @click="togglePasswordVisibility"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-inverse">
                                    <i v-if="isPasswordVisible" data-feather="eye-off" class="w-5 h-5"></i>
                                    <i v-else data-feather="eye" class="w-5 h-5"></i>
                                </button>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">
                                Password harus memiliki angka, simbol, huruf besar dan minimal 8 karakter.
                            </p>
                        </div>

                        <!-- Confirm Password -->
                        <div>
                            <label for="confirm-password" class="text-sm font-bold">Confirm Password</label>
                            <div class="relative mt-1">
                                <input v-model="confirmPassword" :type="isConfirmPasswordVisible ? 'text' : 'password'"
                                    id="confirm-password" required class="form-input" />
                                <!-- <button type="button" @click="toggleConfirmPasswordVisibility"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-inverse">
                                    <i v-if="isConfirmPasswordVisible" data-feather="eye-off" class="w-5 h-5"></i>
                                    <i v-else data-feather="eye" class="w-5 h-5"></i>
                                </button> -->
                            </div>
                        </div>
                    </div>

                    <!-- Agreement -->
                    <p class="text-xs text-center leading-relaxed">
                        Dengan melakukan pendaftaran, kamu telah menyetujui
                        <a href="#" class="text-primary hover:underline font-semibold">Kebijakan Privasi</a>
                        dan
                        <a href="#" class="text-primary hover:underline font-semibold">Ketentuan Lainnya</a>.
                    </p>

                    <!-- Submit -->
                    <button type="submit" :disabled="isLoading"
                        class="w-full bg-primary text-text-default font-bold py-3 border-3 border-outline shadow-solid 
                    hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed">
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

<style lang="postcss" scoped>
.form-input {
    @apply mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all;
}
</style>
