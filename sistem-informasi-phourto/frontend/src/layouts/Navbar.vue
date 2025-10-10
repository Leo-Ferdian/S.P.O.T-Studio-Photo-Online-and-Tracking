<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-semibold text-center text-gray-800 mb-6">
        Masuk ke Akun Anda
      </h2>

      <!-- Alert Error -->
      <div v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="loginUser" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Masukkan email Anda"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Masukkan password Anda"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          :disabled="loading"
        >
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>

      <p class="text-sm text-center text-gray-600 mt-6">
        Belum punya akun?
        <router-link to="/register" class="text-blue-600 hover:underline">Daftar</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()

const loginUser = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: email.value,
      password: password.value,
    })

    // Simpan token ke localStorage
    localStorage.setItem('token', response.data.token)

    // Arahkan ke halaman dashboard
    router.push('/dashboard')
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Terjadi kesalahan saat login.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
body {
  font-family: 'Inter', sans-serif;
}
</style>
