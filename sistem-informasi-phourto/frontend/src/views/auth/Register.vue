<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth.stores'
import feather from 'feather-icons'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

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
        // (Kita kirim email-nya agar halaman verify bisa menggunakannya)
        router.push({
            name: 'VerifyEmail', // Kita akan buat rute ini
            query: { email: email.value }
        });
    }
    catch (error) {
        errorMessage.value = error.message;
    } finally {
        isLoading.value = false
    }
}

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value
}

const toggleConfirmPasswordVisibility = () => {
    isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value
}

onMounted(() => {
    // nextTick memastikan Vue telah merender semua v-show
    // sebelum feather menggantinya.
    nextTick(() => {
        feather.replace()
    });
})
</script>

<template>
    <!-- Menggunakan Flex Column agar footer responsive -->
    <div class="bg-background min-h-screen flex flex-col text-text-default font-sans">

        <!-- Main Content -->
        <!-- flex-grow akan mengisi ruang kosong, memastikan footer terdorong ke bawah -->
        <main class="flex-grow flex items-center justify-center p-4 md:p-8">
            <div class="max-w-lg w-full space-y-6 my-6 md:my-0">

                <!-- Logo -->
                <div class="text-center">
                    <router-link to="/" class="inline-block">
                        <!-- Responsive Logo: h-[100px] di mobile, h-[150px] di desktop -->
                        <img src="@/assets/logo-phourto.png" alt="Phourto Logo"
                            class="h-[100px] md:h-[150px] w-auto object-contain transition-all duration-300" />
                    </router-link>
                </div>

                <!-- Register Form -->
                <form @submit.prevent="handleRegister" class="space-y-4">
                    <div v-if="errorMessage"
                        class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary rounded-sm font-bold">
                        {{ errorMessage }}
                    </div>

                    <!-- Name -->
                    <div>
                        <label for="name" class="text-sm font-bold block mb-1">Name</label>
                        <input v-model="name" type="text" id="name" required class="form-input"
                            placeholder="Nama Lengkap" />
                    </div>

                    <!-- Email -->
                    <div>
                        <label for="email" class="text-sm font-bold block mb-1">Email</label>
                        <input v-model="email" type="email" id="email" required class="form-input"
                            placeholder="alamat@email.com" />
                    </div>

                    <!-- Phone -->
                    <div>
                        <label for="phone" class="text-sm font-bold block mb-1">Phone Number</label>
                        <input v-model="phoneNumber" type="tel" id="phone" required class="form-input"
                            placeholder="Contoh: 0812..." />
                    </div>

                    <!-- Password & Confirm Password -->
                    <div class="space-y-4">
                        <!-- Password -->
                        <div>
                            <label for="password" class="text-sm font-bold block mb-1">Password</label>

                            <div class="relative">
                                <input v-model="password" :type="isPasswordVisible ? 'text' : 'password'" id="password"
                                    required class="form-input pr-10" placeholder="Password" />

                                <!-- Tombol Ikon Mata -->
                                <button type="button" @click="togglePasswordVisibility"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-inverse hover:text-gray-200 transition-colors">
                                    <span v-show="isPasswordVisible">
                                        <i data-feather="eye-off" class="w-5 h-5"></i>
                                    </span>
                                    <span v-show="!isPasswordVisible">
                                        <i data-feather="eye" class="w-5 h-5"></i>
                                    </span>
                                </button>
                            </div>

                            <!-- Pesan Bantuan (Hint) -->
                            <p class="text-xs text-gray-500 mt-1 leading-tight">
                                Min. 8 karakter, 1 huruf besar, 1 angka, 1 simbol.
                            </p>
                        </div>

                        <!-- Confirm Password -->
                        <div>
                            <label for="confirm-password" class="text-sm font-bold block mb-1">Confirm Password</label>

                            <div class="relative">
                                <input v-model="confirmPassword" :type="isConfirmPasswordVisible ? 'text' : 'password'"
                                    id="confirm-password" required class="form-input pr-10"
                                    placeholder="Ulangi Password" />

                                <!-- Tombol Ikon Mata -->
                                <button type="button" @click="toggleConfirmPasswordVisibility"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-inverse hover:text-gray-200 transition-colors">
                                    <span v-show="isConfirmPasswordVisible">
                                        <i data-feather="eye-off" class="w-5 h-5"></i>
                                    </span>
                                    <span v-show="!isConfirmPasswordVisible">
                                        <i data-feather="eye" class="w-5 h-5"></i>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Agreement -->
                    <p class="text-xs text-center leading-relaxed text-gray-600 pt-2">
                        Dengan melakukan pendaftaran, kamu telah menyetujui
                        <a href="#" class="text-primary hover:underline font-bold">Kebijakan Privasi</a>
                        dan
                        <a href="#" class="text-primary hover:underline font-bold">Ketentuan Lainnya</a>.
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
        <footer class="bg-primary text-text-default font-bold p-4 border-t-3 border-outline text-center w-full mt-auto">
            Already have an account?
            <router-link to="/login"
                class="hover:underline text-yellow-300 underline decoration-2 underline-offset-2 ml-1">Login</router-link>
        </footer>
    </div>
</template>

<style lang="postcss" scoped>
.form-input {
    /* Menambahkan placeholder-white/70 agar terlihat jelas di background merah */
    @apply w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all;
}
</style>