<script setup>
import { onMounted } from "vue";
import feather from "feather-icons";

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
          <div class="flex items-center space-x-2 mt-6 ml-6">
            <button
              @click="$router.back()"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
            >
              <i data-feather="arrow-left" class="w-6 h-6"></i>
            </button>
            <button
              @click="$router.push('/')"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
            >
              <i data-feather="home" class="w-6 h-6"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Konten Utama -->
      <div
        class="bg-primary text-text-default border-4 border-outline shadow-strong max-w-3xl mx-auto p-10"
      >
        <h1 class="text-2xl md:text-3xl font-bold text-center mb-8">CLAIM PHOTOS</h1>

        <form class="space-y-6 max-w-2xl mx-auto">
          <div>
            <label for="email" class="block text-base font-semibold mb-2">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              class="w-full p-3 border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-outline"
            />
          </div>

          <div>
            <label for="phone" class="block text-base font-semibold mb-2">Phone Number</label>
            <input
              id="phone"
              type="text"
              placeholder="Enter your phone number"
              class="w-full p-3 border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-outline"
            />
          </div>

          <div class="text-center pt-6">
            <button
              type="submit"
              class="bg-white text-text-default font-bold text-lg py-3 px-8 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Warna diatur sesuai tema desain */
.bg-background {
  background-color: hwb(58 0% 0%); /* Kuning terang */
}

.bg-primary {
  background-color: #d62828; /* Merah cerah */
}

.text-text-default {
  color: #000000; /* Hitam */
}

.border-outline {
  border-color: #000000; /* Outline hitam */
}

/* Efek shadow-solid (biasa) */
.shadow-solid {
  box-shadow: 4px 4px 0 #000000;
}

/* Shadow lebih kuat untuk form utama */
.shadow-strong {
  box-shadow: 8px 8px 0 #000000;
}

/* Hilangkan semua rounded */
.rounded,
.rounded-lg,
.rounded-md,
.rounded-sm {
  border-radius: 0 !important;
}
</style>
