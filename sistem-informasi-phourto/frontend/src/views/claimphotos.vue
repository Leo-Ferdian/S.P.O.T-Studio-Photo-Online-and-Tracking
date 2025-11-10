<script setup>
import { ref, onMounted, nextTick } from "vue";
import feather from "feather-icons";
import { useRouter } from "vue-router";

const router = useRouter();

// --- STATE ---
const bookingCode = ref("");
const email = ref("");
const errorMessage = ref(null);
const isLoading = ref(false);

// --- HANDLE CLAIM ---
const handleClaim = (e) => {
  errorMessage.value = null;
  e.preventDefault();

  // Validasi sederhana
  if (!bookingCode.value || !email.value) {
    errorMessage.value = "Email dan Kode Booking wajib diisi.";
    return;
  }

  isLoading.value = true;

  // Redirect ke halaman hasil dengan query parameters
  router.push({
    name: "ClaimResult", // pastikan nama rute sudah terdaftar
    query: { code: bookingCode.value, email: email.value },
  });
};

onMounted(() => {
  nextTick(() => feather.replace());
});
</script>

<template>
  <div class="bg-background min-h-screen text-text-default pt-12 pb-12">
    <main class="container mx-auto px-4">
      <!-- Header Halaman -->
      <div class="flex items-center justify-between mb-12">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mt-6 ml-6">
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
      </div>

      <!-- Konten Utama -->
      <div class="bg-primary text-text-default border-4 border-outline shadow-strong max-w-3xl mx-auto p-10">
        <h1 class="text-2xl md:text-3xl font-bold text-center mb-8">
          CLAIM PHOTOS
        </h1>

        <form @submit.prevent="handleClaim" class="space-y-6 max-w-2xl mx-auto">
          <!-- Pesan Error -->
          <div v-if="errorMessage" class="bg-red-800/50 text-white p-3 border-2 border-primary text-center">
            {{ errorMessage }}
          </div>

          <!-- Input Email -->
          <div>
            <label for="email" class="block text-base font-semibold mb-2">
              Email Pelanggan
            </label>
            <input v-model="email" id="email" type="email" required placeholder="Email saat memesan"
              class="w-full p-3 border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black bg-white" />
          </div>

          <!-- Input Kode Booking -->
          <div>
            <label for="booking-code" class="block text-base font-semibold mb-2">
              Kode Unik Booking
            </label>
            <input v-model="bookingCode" id="booking-code" type="text" required placeholder="PHR-XXXXXX"
              class="w-full p-3 border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black bg-white" />
          </div>

          <!-- Tombol Submit -->
          <div class="text-center pt-6">
            <button type="submit" :disabled="isLoading"
              class="bg-white text-text-default font-bold text-lg py-3 px-8 border-3 border-outline shadow-solid hover:bg-yellow-300 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50">
              <span v-if="isLoading">Processing...</span>
              <span v-else>DONE</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
.bg-background {
  background-color: #f7f500;
}

.bg-primary {
  background-color: #ff1b1b;
}

.text-text-default {
  color: #000000;
}

.border-outline {
  border-color: #000000;
}

.shadow-solid {
  box-shadow: 4px 4px 0 #000000;
}

.shadow-strong {
  box-shadow: 8px 8px 0 #000000;
}

.rounded,
.rounded-lg,
.rounded-md,
.rounded-sm {
  border-radius: 0 !important;
}
</style>
