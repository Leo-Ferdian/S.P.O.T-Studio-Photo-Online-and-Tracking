<script setup>
import { onMounted } from 'vue';
import feather from 'feather-icons';

onMounted(() => {
  feather.replace();
});
</script>

<template>
  <div class="bg-background min-h-screen font-display text-text-default pt-12 pb-12">
    <main class="container mx-auto px-4">
      <!-- Header Halaman -->
      <div class="flex items-center justify-between mb-12">
        <!-- Kolom Kiri: Tombol Navigasi -->
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <button @click="$router.back()"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
              <i data-feather="arrow-left" class="w-6 h-6"></i>
            </button>
            <button @click="$router.push('/Home')"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
              <i data-feather="home" class="w-6 h-6"></i>
            </button>
          </div>
        </div>
        <!-- Kolom Tengah (kosong) -->
        <div class="flex-1 text-center hidden md:block"></div>

      </div>

      <!-- Konten Utama -->
      <div class="grid md:grid-cols-2 gap-12 justify-items-start px-40 items-center">

        <div class="space-y-6 md:justify-self-start w-full max-w-md">
          <div class="border-4 border-outline">
            <img src="@/assets/recap-pose-room1ch1-2.jpg" alt="Recap Pose" class="w-full h-auto object-cover">
          </div>
          <div class="border-4 border-outline">
            <img src="@/assets/recap-pose-room1ch3-3.jpg" alt="Fisheye Blur" class="w-full h-auto object-cover">
          </div>
        </div>

        <!-- Kolom Kanan -->
        <div class="text-center md:text-left">
          <h1 class="text-3xl md:text-4xl font-bold mb-6">ABOUT PHOUR.TO</h1>
          <div class="space-y-6 font-sans text-base leading-relaxed">
            <p>
              Phour.to merupakan self photo studio and space di Pekanbaru yang fokus menghadirkan hasil foto berkualitas
              tinggi dengan sentuhan kreatif. Kami percaya setiap momen punya cerita, dan lewat lensa kami, cerita itu
              bisa jadi lebih hidup, estetik, dan timeless.
            </p>
            <p>
              Kami siap bantu kamu mengabadikan momen dengan gaya yang profesional namun tetap fresh.
            </p>
          </div>
          <div class="mt-10 text-center">
            <button
              class="bg-white text-text-default font-bold text-lg py-4 px-8 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
              Go Grab Your Photos with Us!!!
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>