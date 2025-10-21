<script setup>
import TheHeader from './components/layout/TheHeader.vue';
import TheFooter from './components/layout/TheFooter.vue';
import { onMounted } from 'vue';
import router from './router';
import feather from 'feather-icons';

// Render ikon saat komponen dimuat dan setelah navigasi
onMounted(() => {
  feather.replace();
});
router.afterEach(() => {
  setTimeout(() => feather.replace(), 0);
});
</script>

<template>
  <div class="bg-background text-text-default min-h-screen font-sans">
    <TheHeader />

    <main class="pt-20"> <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <TheFooter />
  </div>
</template>

<style>
/* Style global jika diperlukan, termasuk transisi fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>