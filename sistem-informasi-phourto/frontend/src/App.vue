<script setup>
import TheHeader from './components/layout/TheHeader.vue';
import TheFooter from './components/layout/TheFooter.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Komputasi untuk mengecek apakah layout utama (header/footer) harus ditampilkan
const showLayout = computed(() => {
  return !['Login', 'Register'].includes(route.name);
});
</script>

<template>
  <div class="min-h-screen font-sans">
    <TheHeader v-if="showLayout" />

    <main :class="{ 'pt-20': showLayout }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <TheFooter v-if="showLayout" />
  </div>
</template>

<style>
/* ... (style transisi fade Anda) ... */
</style>