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
  <!-- Tambahkan overflow-x-hidden agar halaman tidak goyang ke samping -->
  <div class="bg-background text-text-default pt-6 md:pt-10 overflow-x-hidden">
    <main class="container mx-auto px-4">

      <!-- HERO -->
      <section class="text-center mb-6 md:mb-10">
        <h2 class="font-display text-xl md:text-3xl font-bold leading-relaxed px-2">
          SELF PORTRAIT STUDIO AND SPACE PEKANBARU
        </h2>
      </section>

      <!-- OUR ROOMS -->
      <section class="py-5 relative">
        <div class="relative -mx-4 md:mx-0">
          <!-- Gradient Overlay -->
          <div
            class="absolute left-0 top-0 w-8 md:w-24 h-full bg-gradient-to-r from-white/80 via-white/40 to-transparent z-10 pointer-events-none">
          </div>
          <div
            class="absolute right-0 top-0 w-8 md:w-24 h-full bg-gradient-to-l from-white/80 via-white/40 to-transparent z-10 pointer-events-none">
          </div>

          <!-- Scroll Container -->
          <!-- Update: w-[75vw] untuk mobile agar card terlihat besar -->
          <div ref="scrollContainer"
            class="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-4 md:px-10 relative snap-x snap-mandatory"
            @mouseenter="stopAutoScroll" @mouseleave="startAutoScroll" @touchstart="stopAutoScroll">
            <div v-for="(room, index) in [...rooms, ...rooms]" :key="index"
              class="flex-none w-[75vw] sm:w-1/2 md:w-1/4 snap-center transition-all duration-300 hover:-translate-y-2">
              <RoomCard :room="room" />
            </div>
          </div>

          <!-- Navigation Buttons: Hidden di Mobile (Swipe Only), Block di Desktop -->
          <button @click="scrollLeft"
            class="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 text-6xl font-bold text-gray-500 hover:text-black transition z-20">&lt;</button>
          <button @click="scrollRight"
            class="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-6xl font-bold text-gray-500 hover:text-black transition z-20">&gt;</button>
        </div>

        <div class="text-center mt-6 md:mt-8 px-2">
          <!-- Tombol Full Width di Mobile -->
          <ActionButton to="/location" size="large" class="w-full md:w-auto block md:inline-block">
            ⭐ BOOK YOUR PHOTO SESSION NOW! ⭐
          </ActionButton>
        </div>
      </section>

      <!--OUR SERVICE-->
      <section class="py-8 md:py-10">
        <div class="text-center mb-6 md:mb-8">
          <TittleBadge text="OUR SERVICE" class="bg-white text-black px-6 py-3 rounded-lg inline-block shadow-sm" />
        </div>

        <!-- Grid gap diperkecil di mobile -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">

          <!-- Service Items -->
          <div
            class="border-3 border-accent-green block rounded-lg overflow-hidden 
                transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.basic1" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>

          <div
            class="border-3 border-outline block rounded-lg overflow-hidden 
                transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.basic" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>

          <div
            class="border-3 border-accent-blue block rounded-lg overflow-hidden 
                transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.pasFotom" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>

          <div
            class="border-3 border-accent-blue block rounded-lg overflow-hidden 
                transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.basic2" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>

          <div
            class="border-3 border-accent-green block rounded-lg overflow-hidden 
                transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.emerald" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>

          <div
            class="border-3 border-outline block rounded-lg overflow-hidden 
                transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.pasFotob" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>
        </div>
      </section>


      <!-- INSPIRATION -->
      <section class="py-8 md:py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <!-- Text Section -->
        <div class="text-center md:text-left">
          <h3 class="font-display text-2xl md:text-3xl leading-tight">EXPRESS YOUR STYLE WITH US AT PHOUR.TO</h3>
          <p class="font-sans mt-4 mb-6 text-sm md:text-base px-2 md:px-0">
            Available premium room for your best pose with friends, family,
            loved-one or even pet.
          </p>

          <a href="#"
            class="w-full md:w-auto inline-block bg-white text-text-default font-bold py-3 px-6 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 duration-100 hover:translate-y-1 hover:shadow-none transition-all">
            Find Your Inspiration Here 👉
          </a>
        </div>

        <!-- Image Grid -->
        <div class="grid grid-cols-2 gap-3 md:gap-4">
          <!-- 
             UPDATE PENTING:
             Mengganti fixed width w-[300px] dengan w-full aspect-[3/4].
             Ini membuat gambar responsif mengikuti lebar kolom grid.
          -->
          <img src="@/assets/recap-pose-room1ch3-3.jpg"
            class="border-3 border-outline w-full aspect-[3/4] object-cover rounded-md mx-auto" />

          <!-- mt-4 di mobile untuk efek staggered yang lebih kecil -->
          <img src="@/assets/recap-pose-room1ch3.jpg"
            class="border-3 border-outline w-full aspect-[3/4] object-cover rounded-md mx-auto" />

          <img src="@/assets/recap-pose-room1ch2.jpg"
            class="border-3 border-outline w-full aspect-[3/4] object-cover rounded-md mx-auto" />

          <img src="@/assets/recap-pose-room1ch2-3.jpg"
            class="border-3 border-outline w-full aspect-[3/4] object-cover rounded-md mx-auto" />
        </div>
      </section>

      <!-- OUR LOCATION -->
      <section class="py-8 md:py-10 mb-8">
        <div class="text-center mb-6 md:mb-8">
          <TittleBadge class="bg-white rounded-lg px-6 py-2" text="OUR LOCATION" />
        </div>

        <div class="space-y-4 max-w-2xl mx-auto px-1">
          <router-link v-for="loc in locations" :key="loc.slug" :to="`/location/${loc.slug}`"
            class="block transform transition active:scale-95">
            <!-- Lokasi Full Width di Mobile -->
            <LocationButton :location="`${loc.name}, ${loc.address}`" class="w-full" />
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