<script setup>
import feather from 'feather-icons';
import TittleBadge from '../components/common/TittleBadge.vue';
import ActionButton from '../components/common/ActionButton.vue';
import RoomCard from '../components/common/RoomCard.vue';
import LocationButton from '../components/common/LocationButton.vue';
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

import gsap from "gsap";
import ScrollToPlugin from "gsap/dist/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

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

// GSAP Infinite Slider (Tanpa ModifiersPlugin)
const scrollContainer = ref(null);
let tween = null;

const SPEED = 20; // px per second

const startGSAPScroll = () => {
  const el = scrollContainer.value;
  if (!el) return;

  // total scroll area
  const maxScroll = el.scrollWidth - el.clientWidth;
  if (maxScroll <= 0) return;

  // GSAP loop
  tween = gsap.to(el, {
    scrollLeft: maxScroll,
    duration: maxScroll / SPEED,
    ease: "none",
    repeat: -1,
    onUpdate() {
      // hard loop (tanpa ModifiersPlugin)
      if (el.scrollLeft >= maxScroll - 1) {
        el.scrollLeft = 0;
      }
    }
  });
};

const stopGSAPScroll = () => tween?.pause();
const resumeGSAPScroll = () => tween?.resume();

onMounted(() => {
  nextTick(() => {
    startGSAPScroll();
    feather.replace();

    const el = scrollContainer.value;

    el.addEventListener("mouseenter", stopGSAPScroll);
    el.addEventListener("mouseleave", resumeGSAPScroll);
    el.addEventListener("touchstart", stopGSAPScroll);
    el.addEventListener("touchend", resumeGSAPScroll);
  });
});

onBeforeUnmount(() => {
  tween?.kill();
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

          <div class="absolute left-0 top-0 w-8 md:w-24 h-full bg-gradient-to-r from-white/80 via-white/40 to-transparent z-10 pointer-events-none"></div>
          <div class="absolute right-0 top-0 w-8 md:w-24 h-full bg-gradient-to-l from-white/80 via-white/40 to-transparent z-10 pointer-events-none"></div>

          <div ref="scrollContainer"
            class="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 md:px-10 relative">

            <div v-for="(room, index) in rooms" :key="index"
              class="flex-none w-[75vw] sm:w-1/2 md:w-1/4 snap-center transition-all duration-300 hover:-translate-y-2">
              <RoomCard :room="room" />
            </div>

          </div>
        </div>

        <div class="text-center mt-6 md:mt-8 px-2 cursor-pointer">
          <ActionButton to="/location" size="large" class="w-full md:w-auto block md:inline-block active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:translate-y-1 hover:shadow-none transition-all">
            ⭐ BOOK YOUR PHOTO SESSION NOW! ⭐
          </ActionButton>
        </div>
      </section>

      <!--OUR SERVICE-->
      <section class="py-8 md:py-10">
        <div class="text-center mb-6 md:mb-8">
          <TittleBadge text="OUR SERVICE" class="bg-white text-black px-6 py-3 rounded-lg inline-block shadow-sm" />
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <div class="border-3 border-accent-green block rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.basic1" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>

          <div class="border-3 border-outline block rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.basic" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>

          <div class="border-3 border-accent-blue block rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.pasFotom" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>

          <div class="border-3 border-accent-blue block rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.basic2" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>

          <div class="border-3 border-accent-green block rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.emerald" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>

          <div class="border-3 border-outline block rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer active:translate-y-1 active:translate-x-1">
            <img :src="serviceImages.pasFotob" class="w-full aspect-[2/3] object-cover hover:opacity-80" />
          </div>
        </div>
      </section>

      <!-- INSPIRATION -->
      <section class="py-8 md:py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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

        <div class="grid grid-cols-2 gap-3 md:gap-4">
          <img src="@/assets/recap-pose-room1ch3-3.jpg" class="border-3 border-outline w-full aspect-[3/4] object-cover rounded-md mx-auto" />
          <img src="@/assets/recap-pose-room1ch3.jpg" class="border-3 border-outline w-full aspect-[3/4] object-cover rounded-md mx-auto" />
          <img src="@/assets/recap-pose-room1ch2.jpg" class="border-3 border-outline w-full aspect-[3/4] object-cover rounded-md mx-auto" />
          <img src="@/assets/recap-pose-room1ch2-3.jpg" class="border-3 border-outline w-full aspect-[3/4] object-cover rounded-md mx-auto" />
        </div>
      </section>

      <!-- OUR LOCATION -->
      <section class="py-8 md:py-10 mb-8">
        <div class="text-center mb-6 md:mb-8">
          <TittleBadge class="bg-white rounded-lg px-6 py-2" text="OUR LOCATION" />
        </div>

        <div class="space-y-4 max-w-2xl mx-auto px-1">
          <router-link v-for="loc in locations" :key="loc.slug" :to="`/location/${loc.slug}`" class="block transform transition active:scale-95">
            <LocationButton :location="`${loc.name}, ${loc.address}`" class="w-full" />
          </router-link>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
