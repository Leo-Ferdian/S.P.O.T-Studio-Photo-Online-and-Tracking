<script setup>
import { onMounted } from 'vue';
import feather from 'feather-icons';
import TittleBadge from '../components/common/TittleBadge.vue';
import ActionButton from '../components/common/ActionButton.vue';
import RoomCard from '../components/common/RoomCard.vue';
import LocationButton from '../components/common/LocationButton.vue';


// Data ini bisa diganti dengan data dari API nanti
const rooms = [
    { name: 'EMERALDGREEN', image: new URL('@/assets/fisheye-emeraldgreen1.jpg', import.meta.url).href },
    { name: 'ELEVATOR', image: new URL('@/assets/fisheye-elevator.jpg', import.meta.url).href },
    { name: 'BLUEPURPLE', image: new URL('@/assets/fisheye-bluepurple1.jpg', import.meta.url).href },
    { name: 'FLOWER STUDIO', image: new URL('@/assets/recap-pose-flowerstudio1.jpg', import.meta.url).href },
];

const locations = [
    { name: "STUDIO SAIL", address: "Jl. Soekarno Hatta, Pekanbaru", slug: "studio-sail" },
    { name: "STUDIO PANAM", address: "Jl. Bangau Sakti, Pekanbaru", slug: "studio-panam" },
    { name: "STUDIO MARPOYAN", address: "Jl. Kaharudin Nst, Pekanbaru", slug: "studio-marpoyan" }
];

// Import gambar untuk Our Service
const serviceImages = {
    basic1: new URL('@/assets/recap-pose-room1ch1.jpg', import.meta.url).href,
    basic: new URL('@/assets/recap-pose-room1ch2-3.jpg', import.meta.url).href,
    basic2: new URL('@/assets/recap-pose-room1ch2-2.jpg', import.meta.url).href,
    emerald: new URL('@/assets/fisheye-emeraldgreen3.jpg', import.meta.url).href,
    pasFotom: new URL('@/assets/pas-photo-merah.jpg', import.meta.url).href,
    pasFotob: new URL('@/assets/pas-photo-biru.jpg', import.meta.url).href
};
onMounted(() => {
    feather.replace();
});
</script>

<template>
    <div class="bg-background text-text-default pt-10">
        <!-- Navbar akan dipindahkan ke App.vue nanti -->
        <!-- ... -->

        <main class="container mx-auto px-4">
            <!-- Hero -->
            <section class="text-center"> <!-- py-10-->
                <h2 class="font-display text-2xl md:text-3xl font-bold">SELF PORTRAIT STUDIO AND SPACE PEKANBARU</h2>
            </section>

            <!-- Our Rooms -->
            <section class="py-5">
                <div class="text-center mb-8">
                    <TitleBadge text="OUR ROOMS" />
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <RoomCard v-for="room in rooms" :key="room.name" :room="room" />
                </div>
                <div class="text-center mt-8">
                    <ActionButton to="/location" size="large">
                        ⭐ BOOK YOUR PHOTO SESSION NOW! ⭐
                    </ActionButton>
                </div>
            </section>

            <!-- OUR SERVICE -->
            <section class="py-10">
                <div class="text-center mb-8">
                    <TittleBadge text="OUR SERVICE" class="bg-white text-black px-6 py-3 rounded-lg" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Basic & Ramean Plan -->
                    <router-link to="/service/basic-ramean"
                        class="border-3 border-accent-green hover:opacity-80 transition-opacity block">
                        <img :src="serviceImages.basic1" alt="Basic & Ramean Plan" class="w-full h-auto rounded-lg" />
                        <img :src="serviceImages.basic" alt="Fisheye Emerald" class="w-full h-auto rounded-lg" />
                    </router-link>

                    <router-link to="/service/basic-ramean"
                        class="border-3 border-outline hover:opacity-80 transition-opacity block">
                        <img :src="serviceImages.basic2" alt="Basic & Ramean Plan 2"
                            class="w-full h-auto mb-6 rounded-lg" />
                        <img :src="serviceImages.emerald" alt="Fisheye Emerald" class="w-full h-auto rounded-lg" />
                    </router-link>

                    <!-- Pas Foto -->
                    <router-link to="/service/pas-foto"
                        class="border-3 border-accent-blue hover:opacity-80 transition-opacity block">
                        <img :src="serviceImages.pasFotom" alt="Pas Foto" class="w-full h-auto rounded-lg" />
                        <img :src="serviceImages.pasFotob" alt="Pas Foto" class="w-full h-auto rounded-lg" />
                    </router-link>

                </div>
            </section>


            <!-- Inspiration -->
            <section class="py-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 class="font-display text-3xl leading-tight">EXPRESS YOUR STYLE WITH US AT PHOUR.TO</h3>
                    <p class="font-sans mt-4 mb-6"> Available premium room for your best pose with friends, family,
                        loved-one or even pet. </p>
                    <a href="#"
                        class="inline-block bg-white text-text-default font-bold py-3 px-6 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">Find
                        Your Inspiration Here 👉</a>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <img src="@/assets/recap-pose-room1ch3-3.jpg" alt="Inspiration 1"
                        class="border-3 border-outline w-[300px] h-[400px] object-cover mx-auto" />
                    <img src="@/assets/recap-pose-room1ch3.jpg" alt="Inspiration 2"
                        class="border-3 border-outline w-[300px] h-[400px] object-cover mx-auto" />
                    <img src="@/assets/recap-pose-room1ch2.jpg" alt="Inspiration 3"
                        class="border-3 border-outline w-[300px] h-[400px] object-cover mx-auto" />
                    <img src="@/assets/recap-pose-room1ch2-3.jpg" alt="Inspiration 4"
                        class="border-3 border-outline w-[300px] h-[400px] object-cover mx-auto" />
                </div>
            </section>

            <!-- Our Location -->
            <section class="py-10">
                <div class="text-center mb-8">
                    <TitleBadge text="OUR LOCATION" />
                </div>
                <div class="space-y-4 max-w-2xl mx-auto">
                    <!-- Loop melalui data lokasi dan buat router-link untuk setiap lokasi -->
                    <router-link v-for="loc in locations" :key="loc.slug" :to="`/location/${loc.slug}`" class="block">
                        <LocationButton :location="`${loc.name}, ${loc.address}`" />
                    </router-link>
                </div>
            </section>
        </main>

        <!-- Footer akan dipindahkan ke App.vue nanti -->
        <!-- ... -->
    </div>
</template>