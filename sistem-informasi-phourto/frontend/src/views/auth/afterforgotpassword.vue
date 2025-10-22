<script setup>
import { onMounted } from 'vue';
import feather from 'feather-icons';

onMounted(() => {
  feather.replace();
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-yellow-400 text-center font-mono">
    <!-- Logo -->
    <h1 class="text-5xl font-bold text-pink-600 mb-6">
      Ph<span class="text-red-600">0</span>ur<span class="text-pink-700">to</span>
    </h1>

    <!-- Header -->
    <h2 class="text-lg font-semibold mb-8">CHECK YOUR EMAIL</h2>

    <!-- Icon Amplop -->
    <div class="bg-white rounded-full p-6 mb-6 shadow-lg">
      <i data-feather="mail" class="w-16 h-16 text-red-500"></i>
    </div>

    <!-- Pesan -->
    <p class="max-w-md text-sm mb-12">
      Kami telah mengirimkan tautan untuk mengatur ulang kata sandi ke <br />
      <span class="font-bold">abcdefg@gmail.com</span>
    </p>

    <!-- Tombol Back -->
    <button
      @click="$router.push('/auth/signin')"
      class="bg-red-600 text-black text-sm px-8 py-3 font-semibold hover:bg-red-700 transition-all rounded-none"
    >
      Back To Sign In
    </button>
  </div>
</template>

<style scoped>
.bg-yellow-400 {
  background-color: #ffd700; /* warna kuning seperti di gambar */
}
.text-pink-600 {
  color: #e82a6d;
}
.text-pink-700 {
  color: #c0185a;
}
.bg-red-600 {
  background-color: #e31b23;
}
.hover\:bg-red-700:hover {
  background-color: #c91820;
}
</style>
