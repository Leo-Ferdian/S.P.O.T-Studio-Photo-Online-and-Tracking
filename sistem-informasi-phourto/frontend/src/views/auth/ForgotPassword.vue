<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth.stores';
import feather from 'feather-icons';

const authStore = useAuthStore();
const email = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);

// Mengontrol tampilan mana yang aktif: 'input', 'check_email', 'success', 'fail'
const currentStep = ref('input');

const handleRequestReset = async () => {
  errorMessage.value = null;
  isLoading.value = true;
  try {
    await authStore.requestPasswordReset(email.value);
    // Jika berhasil, pindah ke tahap "Check Your Email"
    currentStep.value = 'check_email';
  } catch (error) {
    errorMessage.value = 'Email tidak ditemukan atau terjadi kesalahan.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  feather.replace();
});
</script>

<template>
  <div class="bg-background min-h-screen flex items-center justify-center font-display text-text-default">
    <div class="max-w-lg w-full p-8 space-y-6">
      <!-- Logo -->
      <router-link to="/Home" class="font-display text-5xl font-bold relative inline-block mx-auto mb-8">
        Phour<span class="text-primary text-6xl absolute -bottom-2 -right-8 transform -rotate-12">to</span>
        <span class="absolute top-0 right-0 text-[10px] leading-none font-sans font-bold w-20 text-right">we'll
          partner<br>with our<br>best</span>
      </router-link>

      <!-- Tahap 1: Input Email -->
      <div v-if="currentStep === 'input'">
        <h2 class="text-2xl font-bold text-center">FORGOT PASSWORD</h2>
        <p class="text-center text-sm font-sans mt-2 mb-6">Masukkan alamat email Anda dan kami akan mengirimkan tautan
          untuk mereset kata sandi Anda.</p>
        <form @submit.prevent="handleRequestReset" class="space-y-4">
          <div v-if="errorMessage" class="bg-primary/20 text-primary text-sm p-3 border-2 border-primary">
            {{ errorMessage }}
          </div>
          <div>
            <label for="email" class="text-sm font-bold">Email</label>
            <input v-model="email" type="email" id="email" required
              class="mt-1 w-full p-3 bg-primary text-text-inverse border-3 border-outline shadow-solid placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary">
          </div>
          <button type="submit" :disabled="isLoading"
            class="w-full bg-primary text-text-default font-bold py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isLoading ? 'MENGIRIM...' : 'SEND' }}
          </button>
        </form>
      </div>

      <!-- Tahap 2: Check Your Email -->
      <div v-if="currentStep === 'check_email'" class="text-center space-y-4">
        <h2 class="text-2xl font-bold">CHECK YOUR EMAIL</h2>
        <div class="flex justify-center">
          <div class="bg-primary rounded-full p-4 border-3 border-outline shadow-solid">
            <i data-feather="mail" class="w-12 h-12 text-text-inverse"></i>
          </div>
        </div>
        <p class="font-sans text-sm">
          Kami telah mengirimkan tautan untuk mengatur ulang kata sandi ke <span class="font-bold">{{ email }}</span>
        </p>
      </div>

      <!-- Contoh Tampilan Success (dari desain) -->
      <div v-if="currentStep === 'success'" class="text-center space-y-4">
        <h2 class="text-2xl font-bold">SUCCESS!</h2>
        <p class="font-sans text-sm">
          Kamu telah berhasil masuk menggunakan akun Google kamu.
        </p>
        <router-link to="/Home"
          class="inline-block bg-primary text-text-default font-bold mt-4 py-3 px-6 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1">
          BACK TO HOME PAGE
        </router-link>
      </div>

    </div>
    <!-- Footer Link -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-primary text-text-default font-bold p-4 border-t-3 border-outline text-center">
      Back To
      <router-link to="/login" class="hover:underline text-yellow-300 underline decoration-2 underline-offset-2 ml-1">
        Login
      </router-link>
    </div>
  </div>
</template>
