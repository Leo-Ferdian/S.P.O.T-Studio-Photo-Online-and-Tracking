<script setup>
import { ref, onMounted } from 'vue';
import feather from 'feather-icons';
import TittleBadge from '../components/common/TittleBadge.vue';
import ActionButton from '../components/common/ActionButton.vue';
import RoomCard from '../components/common/RoomCard.vue';
import LocationButton from '../components/common/LocationButton.vue';

// Data ruangan
const rooms = [
  { name: 'EMERALDGREEN', image: new URL('@/assets/fisheye-emeraldgreen1.jpg', import.meta.url).href },
  { name: 'RAMEAN PLAN', image: new URL('@/assets/recap-pose-room1ch2-2.jpg', import.meta.url).href },
  { name: 'ELEVATOR', image: new URL('@/assets/fisheye-elevator.jpg', import.meta.url).href },
  { name: 'BLUEPURPLE', image: new URL('@/assets/fisheye-bluepurple1.jpg', import.meta.url).href },
  { name: 'FLOWER STUDIO', image: new URL('@/assets/recap-pose-flowerstudio1.jpg', import.meta.url).href },
  { name: 'BASIC PLAN', image: new URL('@/assets/recap-pose-room1ch1.jpg', import.meta.url).href },
];

// Lokasi studio
const locations = [
  { name: "STUDIO SAIL", address: "Jl. Soekarno Hatta, Pekanbaru", slug: "studio-sail" },
  { name: "STUDIO PANAM", address: "Jl. Bangau Sakti, Pekanbaru", slug: "studio-panam" },
  { name: "STUDIO MARPOYAN", address: "Jl. Kaharudin Nst, Pekanbaru", slug: "studio-marpoyan" }
];

// Gambar service
const serviceImages = {
  basic1: new URL('@/assets/recap-pose-room1ch1.jpg', import.meta.url).href,
  basic: new URL('@/assets/recap-pose-room1ch2-3.jpg', import.meta.url).href,
  basic2: new URL('@/assets/recap-pose-room1ch2-2.jpg', import.meta.url).href,
  emerald: new URL('@/assets/fisheye-emeraldgreen3.jpg', import.meta.url).href,
  pasFotom: new URL('@/assets/pas-photo-merah.jpg', import.meta.url).href,
  pasFotob: new URL('@/assets/pas-photo-biru.jpg', import.meta.url).href,
};

// Scroll otomatis
const scrollContainer = ref(null);
let autoScroll;

const startAutoScroll = () => {
  stopAutoScroll();
  autoScroll = setInterval(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollBy({ left: 1, behavior: 'smooth' });
      if (
        scrollContainer.value.scrollLeft + scrollContainer.value.clientWidth >=
        scrollContainer.value.scrollWidth
      ) {
        scrollContainer.value.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }
  }, 30);
};

const stopAutoScroll = () => {
  if (autoScroll) clearInterval(autoScroll);
};

const scrollLeft = () => {
  scrollContainer.value.scrollBy({ left: -300, behavior: 'smooth' });
};

const scrollRight = () => {
  scrollContainer.value.scrollBy({ left: 300, behavior: 'smooth' });
};

onMounted(() => {
  feather.replace();
  startAutoScroll();
});
</script>

<template>
  <div class="bg-background text-text-default pt-10">
    <main class="container mx-auto px-4">

      <!-- HERO -->
      <section class="text-center">
        <h2 class="font-display text-2xl md:text-3xl font-bold">
          SELF PORTRAIT STUDIO AND SPACE PEKANBARU
        </h2>
      </section>

      <!-- OUR ROOMS -->
      <section class="py-5 relative overflow-hidden">
        <div class="relative">
          <div
            class="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-white/80 via-white/40 to-transparent z-10 pointer-events-none">
          </div>
          <div
            class="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-white/80 via-white/40 to-transparent z-10 pointer-events-none">
          </div>

          <div ref="scrollContainer" class="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-10 relative"
            @mouseenter="stopAutoScroll" @mouseleave="startAutoScroll">
            <div v-for="(room, index) in [...rooms, ...rooms]" :key="index"
              class="flex-none w-1/2 md:w-1/4 transition-all duration-300 hover:-translate-y-2">
              <RoomCard :room="room" />
            </div>
          </div>

          <button @click="scrollLeft"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-6xl font-bold text-gray-500 hover:text-black transition z-20">&lt;</button>
          <button @click="scrollRight"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-6xl font-bold text-gray-500 hover:text-black transition z-20">&gt;</button>
        </div>

        <div class="text-center mt-8">
          <ActionButton to="/location" size="large">
            ⭐ BOOK YOUR PHOTO SESSION NOW! ⭐
          </ActionButton>
        </div>
      </section>

      <!--OUR SERVICE-->
      <section class="py-10">
        <div class="text-center mb-8">
          <TittleBadge text="OUR SERVICE" class="bg-white text-black px-6 py-3 rounded-lg" />
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">

          <!-- 1 -->
          <router-link to="/service/basic-ramean" class="border-3 border-accent-green block rounded-lg overflow-hidden 
                  transition-transform duration-300 hover:scale-105">
            <img :src="serviceImages.basic1" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </router-link>

          <!-- 2 -->
          <router-link to="/service/basic-ramean" class="border-3 border-outline block rounded-lg overflow-hidden 
                  transition-transform duration-300 hover:scale-105">
            <img :src="serviceImages.basic" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </router-link>

          <!-- 3 -->
          <router-link to="/service/pas-foto" class="border-3 border-accent-blue block rounded-lg overflow-hidden 
                  transition-transform duration-300 hover:scale-105">
            <img :src="serviceImages.pasFotom" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </router-link>

          <!-- 4 -->
          <router-link to="/service/basic-ramean" class="border-3 border-accent-blue block rounded-lg overflow-hidden 
                  transition-transform duration-300 hover:scale-105">
            <img :src="serviceImages.basic2" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </router-link>

          <!-- 5 -->
          <router-link to="/service/emerald-green" class="border-3 border-accent-green block rounded-lg overflow-hidden 
                  transition-transform duration-300 hover:scale-105">
            <img :src="serviceImages.emerald" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </router-link>


          <!-- 6 -->
          <router-link to="/service/pas-foto" class="border-3 border-outline block rounded-lg overflow-hidden 
                  transition-transform duration-300 hover:scale-105">
            <img :src="serviceImages.pasFotob" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </router-link>

        </div>
      </section>


      <!-- INSPIRATION -->
      <section class="py-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 class="font-display text-3xl leading-tight">EXPRESS YOUR STYLE WITH US AT PHOUR.TO</h3>
          <p class="font-sans mt-4 mb-6">
            Available premium room for your best pose with friends, family,
            loved-one or even pet.
          </p>

          <a href="#"
            class="inline-block bg-white text-text-default font-bold py-3 px-6 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">
            Find Your Inspiration Here 👉
          </a>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <img src="@/assets/recap-pose-room1ch3-3.jpg"
            class="border-3 border-outline w-[300px] h-[400px] object-cover mx-auto" />
          <img src="@/assets/recap-pose-room1ch3.jpg"
            class="border-3 border-outline w-[300px] h-[400px] object-cover mx-auto" />
          <img src="@/assets/recap-pose-room1ch2.jpg"
            class="border-3 border-outline w-[300px] h-[400px] object-cover mx-auto" />
          <img src="@/assets/recap-pose-room1ch2-3.jpg"
            class="border-3 border-outline w-[300px] h-[400px] object-cover mx-auto" />
        </div>
      </section>

      <!-- OUR LOCATION -->
      <section class="py-10">
        <div class="text-center mb-8">
          <TittleBadge class="bg-white rounded-lg" text="OUR LOCATION" />
        </div>

        <div class="space-y-4 max-w-2xl mx-auto">
          <router-link v-for="loc in locations" :key="loc.slug" :to="`/location/${loc.slug}`" class="block">
            <LocationButton :location="`${loc.name}, ${loc.address}`" />
          </router-link>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
