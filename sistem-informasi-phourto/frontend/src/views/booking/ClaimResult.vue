<script setup>
import { onMounted } from "vue";
import feather from "feather-icons";
import TitleBadge from "../../components/common/TittleBadge.vue";
import ActionButton from "../../components/common/ActionButton.vue";

// Nanti data ini bisa diambil dari API hasil claim
const claimedPhotos = [
  new URL("@/assets/recap-pose-room1ch2.jpg", import.meta.url).href,
  new URL("@/assets/recap-pose-room1ch3.jpg", import.meta.url).href,
  new URL("@/assets/fisheye-emeraldgreen1.jpg", import.meta.url).href,
  new URL("@/assets/fisheye-elevator.jpg", import.meta.url).href,
  new URL("@/assets/pas-photo-merah.jpg", import.meta.url).href,
  new URL("@/assets/pas-photo-biru.jpg", import.meta.url).href,
];

onMounted(() => {
  feather.replace();
});
</script>

<template>
  <div class="bg-background text-text-default min-h-screen pt-10">
    <main class="container mx-auto px-4">
      <!-- Header -->
      <section class="text-center mb-10">
        <TitleBadge text="YOUR PHOTOS ARE READY!" />
        <h2 class="font-display text-2xl md:text-3xl font-bold mt-4">
          Thank you for claiming your photo session 🎉
        </h2>
        <p class="text-gray-500 mt-2">
          You can view and download your photos below.
        </p>
      </section>

      <!-- Photo Grid -->
      <section>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="(photo, index) in claimedPhotos" :key="index"
            class="border-3 border-outline rounded-lg overflow-hidden hover:opacity-90 transition">
            <img :src="photo" alt="Claimed Photo" class="w-full h-[250px] object-cover" />
          </div>
        </div>
      </section>

      <section class="text-center mt-10 space-y-4">
        <ActionButton>⬇ DOWNLOAD ALL PHOTOS</ActionButton>
        <div>
          <router-link to="/" class="text-accent underline hover:opacity-80">
            ← Back to Home
          </router-link>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.text-accent {
  color: #DC2626
}
</style>