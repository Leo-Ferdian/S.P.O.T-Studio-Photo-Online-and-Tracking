<script setup>
import { onMounted } from 'vue';
import feather from 'feather-icons';

// Data ini bisa diganti dengan data dari API nanti
const rooms = [
    { name: 'RECAP POSE', image: 'https://placehold.co/400x500/000000/FFFFFF?text=Recap+Pose' },
    { name: 'TWIVOR', image: 'https://placehold.co/400x500/cccccc/000000?text=Twivor' },
    { name: 'KALA', image: 'https://placehold.co/400x500/999999/FFFFFF?text=Kala' },
    { name: 'FLOWER STUDIO', image: 'https://placehold.co/400x500/eeeeee/000000?text=Flower' },
];

// Pastikan ikon di-render setelah komponen dimuat
onMounted(() => {
    feather.replace();
});
</script>

<template>
    <div class="bg-background text-text-default pt-20">
        <!-- Navbar -->
        <div class="fixed top-0 left-0 right-0 z-50 bg-background border-b-3 border-outline">
            <div class="container mx-auto flex justify-between items-center p-4">
                <h1 class="text-2xl">Phour.to</h1>

                <div class="hidden md:flex items-center space-x-2">
                    <a href="#" class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">About Us</a>
                    <a href="#" class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">Service</a>
                    <a href="#" class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">Our Rooms</a>
                    <a href="#" class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">Claim Photos</a>
                </div>

                <div class="flex items-center space-x-4">
                    <a href="#" class="font-bold">LOG IN</a>
                    <a href="#" class="bg-primary text-text-default px-4 py-1 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100">SIGN UP</a>
                </div>
            </div>
        </div>

        <!-- Main -->
        <main class="container mx-auto px-4 pt-16">
            <!-- Hero -->
            <section class="text-center py-10">
                <h2 class="text-2xl md:text-3xl">SELF PORTRAIT STUDIO AND SPACE PEKANBARU</h2>
            </section>

            <!-- Our Rooms -->
            <section class="py-10">
                <div class="text-center mb-8">
                    <span class="inline-block bg-primary text-text-default px-6 py-2 border-3 border-outline shadow-solid">OUR ROOMS</span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div v-for="room in rooms" :key="room.name" class="border-3 border-outline">
                        <img :src="room.image" :alt="room.name" class="w-full h-auto object-cover" />
                        <p class="text-center bg-white p-2 border-t-3 border-outline">{{ room.name }}</p>
                    </div>
                </div>

                <div class="text-center mt-8">
                    <button class="bg-primary text-text-default text-xl px-8 py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">⭐ BOOK YOUR PHOTO SESSION NOW! ⭐</button>
                </div>
            </section>

            <!-- Our Service -->
            <section class="py-10">
                <div class="text-center mb-8">
                    <span class="title-badge">OUR SERVICE</span>
                </div>

                <div class="grid grid-cols-3 gap-6">
                    <div class="border-3 border-accent-green">
                        <img src="https://placehold.co/400x500/dddddd/000000?text=Group" alt="Service 1" class="w-full h-auto" />
                    </div>
                    <div class="border-3 border-outline">
                        <img src="https://placehold.co/400x245/aaaaaa/000000?text=Recap" alt="Service 2" class="w-full h-auto mb-6" />
                        <img src="https://placehold.co/400x245/bbbbbb/000000?text=Recap" alt="Service 3" class="w-full h-auto" />
                    </div>
                    <div class="border-3 border-accent-blue">
                        <img src="https://placehold.co/400x500/eeeeee/000000?text=Pas+Foto" alt="Service 4" class="w-full h-auto" />
                    </div>
                </div>
            </section>

            <!-- Inspiration -->
            <section class="py-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 class="text-3xl leading-tight">EXPRESS YOUR STYLE WITH US AT PHOUR.TO</h3>
                    <p class="mt-4 mb-6"> Available premium room for your best pose with friends, family, loved-one or even pet. </p>
                    <a href="#" class="inline-block bg-white text-text-default font-bold py-3 px-6 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">Find Your Inspiration Here 👉</a>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <img src="https://placehold.co/300x400/cccccc/000000?text=Pose1" alt="Inspiration 1" class="border-3 border-outline" />
                    <img src="https://placehold.co/300x400/dddddd/000000?text=Pose2" alt="Inspiration 2" class="border-3 border-outline" />
                    <img src="https://placehold.co/300x400/eeeeee/000000?text=Pose3" alt="Inspiration 3" class="border-3 border-outline" />
                    <img src="https://placehold.co/300x400/fafafa/000000?text=Pose4" alt="Inspiration 4" class="border-3 border-outline" />
                </div>
            </section>

            <!-- Location -->
            <section class="py-10">
                <div class="text-center mb-8">
                    <span class="title-badge">OUR LOCATION</span>
                </div>

                <div class="space-y-4 max-w-2xl mx-auto">
                    <button class="w-full flex items-center space-x-4 bg-primary text-text-default text-left p-4 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">
                        <i data-feather="map-pin" class="w-6 h-6"></i>
                        <span>STUDIO SKA, Jl. Soekarno Hatta, Pekanbaru</span>
                    </button>
                    <button class="w-full flex items-center space-x-4 bg-primary text-text-default text-left p-4 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">
                        <i data-feather="map-pin" class="w-6 h-6"></i>
                        <span>STUDIO PEKANBARU, Jl. Durian, Pekanbaru</span>
                    </button>
                    <button class="w-full flex items-center space-x-4 bg-primary text-text-default text-left p-4 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">
                        <i data-feather="map-pin" class="w-6 h-6"></i>
                        <span>STUDIO MARPOYAN, Jl. Kaharudin Nst, Pekanbaru</span>
                    </button>
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="bg-outline text-text-inverse mt-16 p-8">
            <div class="container mx-auto grid md:grid-cols-3 items-center">
                <div>
                    <h2 class="text-3xl">Phour.to</h2>
                </div>

                <div class="grid grid-cols-3 gap-8 text-center my-8 md:my-0">
                    <div>
                        <h4 class="font-bold mb-2">Our Profile</h4>
                        <ul class="space-y-1 text-sm text-gray-400">
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Hasil Jepretan</a></li>
                            <li><a href="#">Location Partner</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-bold mb-2">Our Service</h4>
                        <ul class="space-y-1 text-sm text-gray-400">
                            <li><a href="#">Paket Sesi</a></li>
                            <li><a href="#">Event</a></li>
                            <li><a href="#">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-bold mb-2">Claim Photos</h4>
                        <ul class="space-y-1 text-sm text-gray-400">
                            <li><a href="#">Ambil Fotomu</a></li>
                            <li><a href="#">Social Media</a></li>
                        </ul>
                    </div>
                </div>

                <div class="flex justify-center md:justify-end space-x-4">
                    <a href="#"><i data-feather="instagram" class="w-6 h-6"></i></a>
                    <a href="#"><i data-feather="message-circle" class="w-6 h-6"></i></a>
                </div>
            </div>
        </footer>
    </div>
</template>

<!-- <style scoped>
/* Utility compositions moved inline into the template to avoid using @apply in PostCSS. */
</style> -->
