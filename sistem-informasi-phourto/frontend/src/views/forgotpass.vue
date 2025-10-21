<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const router = useRouter()

const handleSubmit = () => {
  if (!email.value) {
    alert('Silakan masukkan email Anda terlebih dahulu.')
    return
  }
  alert(`Tautan reset kata sandi telah dikirim ke ${email.value}`)
  router.push('/signin')
}
</script>

<template>
  <div class="bg-[#FFEB00] min-h-screen flex flex-col items-center justify-center font-[KodeMono]">
    <div
      class="bg-white border-4 border-black rounded-2xl shadow-[5px_5px_0_0_#000] px-8 py-10 text-center w-full max-w-md"
    >
      <!-- Logo -->
      <h1 class="text-4xl font-bold text-black mb-2">Phour.to</h1>

      <!-- Subtext -->
      <p class="text-sm text-black mb-8">
        Masukkan alamat email Anda untuk menerima
        <span class="text-[#D32F2F] font-semibold"> tautan reset kata sandi</span>.
      </p>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div class="text-left">
          <label class="font-bold text-sm">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Masukkan email Anda"
            class="w-full border-3 border-black py-3 px-4 rounded-md placeholder-gray-500 focus:outline-none"
          />
        </div>

        <!-- Tombol merah permanen -->
        <button
          type="submit"
          class="bg-[#D32F2F] text-white font-bold py-3 rounded-md border-3 border-black shadow-solid transition-all active:translate-x-1 active:translate-y-1"
        >
          SEND RESET LINK
        </button>
      </form>

      <!-- Back to Sign In -->
      <div class="mt-6">
        <router-link
          to="/signin"
          class="inline-block border-3 border-black px-6 py-2 rounded-md shadow-solid hover:bg-gray-200 transition-all active:translate-x-1 active:translate-y-1"
        >
          Back to Sign In
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kode+Mono:wght@400;700&display=swap');

* {
  font-family: 'Kode Mono', monospace !important;
}

.border-3 {
  border-width: 3px;
}

.shadow-solid {
  box-shadow: 4px 4px 0 0 #000;
}
</style>
