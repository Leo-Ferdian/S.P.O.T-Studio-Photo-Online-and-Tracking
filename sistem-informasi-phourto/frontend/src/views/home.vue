<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S.P.O.T - Studio Photo Online and Tracking</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .fade-enter-active, .fade-leave-active {
            transition: opacity 0.5s;
        }
        .fade-enter, .fade-leave-to {
            opacity: 0;
        }
    </style>
</head>
<body class="bg-gray-900 text-white">

    <div id="app"></div>

    <!-- Vue.js and Vue Router CDN -->
    <script type="importmap">
    {
        "imports": {
            "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js",
            "vue-router": "https://unpkg.com/vue-router@4/dist/vue-router.esm-browser.js"
        }
    }
    </script>

    <script type="module">
        import { createApp } from 'vue';
        import { createRouter, createWebHashHistory } from 'vue-router';

        // --- DEFINISI KOMPONEN (VIEWS) ---

        const Home = {
            template: `
                <div class="space-y-24 md:space-y-32">
                    <!-- Hero Section -->
                    <section class="relative text-center py-20 md:py-32 px-4 overflow-hidden">
                        <div class="absolute inset-0 bg-gray-900 opacity-60 z-10"></div>
                        <img src="https://placehold.co/1920x1080/000000/FFFFFF?text=Phour.to+Studio" class="absolute inset-0 w-full h-full object-cover" alt="Suasana studio Phour.to">
                        <div class="relative z-20 max-w-3xl mx-auto">
                            <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-4">Abadikan Momen, Ciptakan Kenangan.</h1>
                            <p class="text-lg md:text-xl text-gray-300 mb-8">Pengalaman self-photo studio modern di Pekanbaru. Cepat, mudah, dan personal.</p>
                            <router-link to="/booking" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300">
                                Pesan Sesi Sekarang
                            </router-link>
                        </div>
                    </section>

                    <!-- Packages Section -->
                    <section class="px-4 md:px-8 max-w-6xl mx-auto">
                        <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">Pilihan Paket Foto</h2>
                        <div class="grid md:grid-cols-3 gap-8">
                            <!-- Package Card Placeholder -->
                            <div v-for="i in 3" :key="i" class="bg-gray-800 p-8 rounded-2xl border border-gray-700 text-center transform hover:scale-105 hover:border-indigo-500 transition-all duration-300">
                                <h3 class="text-2xl font-bold mb-4">Paket {{ i === 1 ? 'Solo' : (i === 2 ? 'Duo' : 'Grup') }}</h3>
                                <p class="text-4xl font-bold mb-4">Rp{{ 100 + (i-1)*50 }}.000</p>
                                <ul class="text-gray-400 space-y-2 mb-8">
                                    <li>{{ 15 + (i-1)*5 }} Menit Sesi Foto</li>
                                    <li>{{ i }} Cetakan Foto 4R</li>
                                    <li>Semua File Digital</li>
                                    <li>Maksimal {{ i*2 }} Orang</li>
                                </ul>
                                <router-link to="/booking" class="w-full bg-gray-700 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                                    Pilih Paket
                                </router-link>
                            </div>
                        </div>
                    </section>
                    
                    <!-- How It Works Section -->
                    <section class="px-4 md:px-8 max-w-6xl mx-auto text-center">
                        <h2 class="text-3xl md:text-4xl font-bold mb-12">Hanya 3 Langkah Mudah</h2>
                        <div class="grid md:grid-cols-3 gap-12">
                            <div class="flex flex-col items-center">
                                <div class="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">1</div>
                                <h3 class="text-xl font-semibold mb-2">Pesan & Bayar Online</h3>
                                <p class="text-gray-400">Pilih paket, cabang, dan jadwal yang kamu inginkan. Selesaikan pembayaran dengan aman.</p>
                            </div>
                            <div class="flex flex-col items-center">
                                <div class="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">2</div>
                                <h3 class="text-xl font-semibold mb-2">Lakukan Sesi Foto</h3>
                                <p class="text-gray-400">Datang ke studio, tunjukkan kode unikmu, dan mulailah sesi self-photo yang seru!</p>
                            </div>
                            <div class="flex flex-col items-center">
                                <div class="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">3</div>
                                <h3 class="text-xl font-semibold mb-2">Akses & Unduh Fotomu</h3>
                                <p class="text-gray-400">Setelah sesi selesai, foto akan langsung tersedia di galerimu untuk diunduh kapan saja.</p>
                            </div>
                        </div>
                    </section>
                </div>
            `
        };

        const Login = {
            template: `
                <div class="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-2xl border border-gray-700">
                        <div>
                            <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
                                Masuk ke Akun Anda
                            </h2>
                        </div>
                        <form class="mt-8 space-y-6" @submit.prevent="login">
                            <div class="rounded-md shadow-sm -space-y-px">
                                <div>
                                    <label for="email-address" class="sr-only">Alamat Email</label>
                                    <input id="email-address" name="email" type="email" autocomplete="email" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm rounded-t-md" placeholder="Alamat Email">
                                </div>
                                <div>
                                    <label for="password" class="sr-only">Password</label>
                                    <input id="password" name="password" type="password" autocomplete="current-password" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm rounded-b-md" placeholder="Password">
                                </div>
                            </div>

                            <div>
                                <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Masuk
                                </button>
                            </div>
                        </form>
                        <p class="mt-2 text-center text-sm text-gray-400">
                            Belum punya akun?
                            <router-link to="/register" class="font-medium text-indigo-400 hover:text-indigo-300">
                                Daftar di sini
                            </router-link>
                        </p>
                    </div>
                </div>
            `,
            methods: {
                login() {
                    // TODO: Panggil API Login
                    console.log('Login attempt...');
                }
            }
        };

        const Register = {
            template: `
                <div class="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-2xl border border-gray-700">
                        <div>
                            <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
                                Buat Akun Baru
                            </h2>
                        </div>
                        <form class="mt-8 space-y-6" @submit.prevent="register">
                            <div class="rounded-md shadow-sm space-y-4">
                                <input name="fullname" type="text" required class="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Nama Lengkap">
                                <input name="email" type="email" autocomplete="email" required class="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Alamat Email">
                                <input name="whatsapp" type="tel" required class="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Nomor WhatsApp">
                                <input name="password" type="password" autocomplete="new-password" required class="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Password">
                            </div>

                            <div>
                                <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Daftar
                                </button>
                            </div>
                        </form>
                        <p class="mt-2 text-center text-sm text-gray-400">
                            Sudah punya akun?
                            <router-link to="/login" class="font-medium text-indigo-400 hover:text-indigo-300">
                                Masuk di sini
                            </router-link>
                        </p>
                    </div>
                </div>
            `,
            methods: {
                register() {
                    // TODO: Panggil API Register
                    console.log('Register attempt...');
                }
            }
        };

        // Komponen Root Aplikasi (App.vue)
        const App = {
            template: `
                <header class="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
                    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex items-center justify-between h-16">
                            <div class="flex items-center">
                                <router-link to="/" class="text-2xl font-bold text-white">
                                    S.P.O.T
                                </router-link>
                            </div>
                            <div class="hidden md:block">
                                <div class="ml-10 flex items-baseline space-x-4">
                                    <router-link to="/" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Beranda</router-link>
                                    <router-link to="/packages" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Paket Foto</router-link>
                                    <router-link to="/branches" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Lokasi</router-link>
                                </div>
                            </div>
                            <div class="hidden md:block">
                                <div class="ml-4 flex items-center md:ml-6">
                                    <router-link to="/login" class="bg-gray-700 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                                        Masuk
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </nav>
                </header>

                <main class="pb-16">
                    <router-view v-slot="{ Component }">
                        <transition name="fade" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </router-view>
                </main>

                <footer class="bg-gray-800 border-t border-gray-700">
                    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
                        <p>&copy; ${new Date().getFullYear()} Phour.to. Dibuat dengan S.P.O.T System.</p>
                    </div>
                </footer>
            `
        };


        // --- SETUP ROUTER ---
        const routes = [
            { path: '/', component: Home },
            { path: '/login', component: Login },
            { path: '/register', component: Register },
            // TODO: Tambahkan rute lain di sini (packages, branches, booking, dashboard, dll)
        ];

        const router = createRouter({
            history: createWebHashHistory(),
            routes,
        });

        // --- INISIALISASI APLIKASI VUE ---
        const app = createApp(App);
        app.use(router);
        app.mount('#app');

    </script>
</body>
</html>

<script setup>
    import { onMounted } from 'vue';
    import feather from 'feather-icons';
    import TittleBadge from '../components/common/TittleBadge.vue';
    import ActionButton from '../components/common/ActionButton.vue';
    import RoomCard from '../components/common/RoomCard.vue';
    import LocationButton from '../components/common/LocationButton.vue';

    // Data ini bisa diganti dengan data dari API nanti
    const rooms = [
        { name: 'RECAP POSE', image: 'https://placehold.co/400x500/000000/FFFFFF?text=Recap+Pose' },
        { name: 'TWIVOR', image: 'https://placehold.co/400x500/cccccc/000000?text=Twivor' },
        { name: 'KALA', image: 'https://placehold.co/400x500/999999/FFFFFF?text=Kala' },
        { name: 'FLOWER STUDIO', image: 'https://placehold.co/400x500/eeeeee/000000?text=Flower' },
    ];

    const locations = [
        { name: "STUDIO SAIL", address: "Jl. Soekarno Hatta, Pekanbaru", slug: "studio-sail" },
        { name: "STUDIO PANAM", address: "Jl. Durian, Pekanbaru", slug: "studio-panam" },
        { name: "STUDIO MARPOYAN", address: "Jl. Kaharudin Nst, Pekanbaru", slug: "studio-marpoyan" }
    ];
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
                    <ActionButton text="⭐ BOOK YOUR PHOTO SESSION NOW! ⭐" />
                </div>
            </section>

            <!-- Our Service -->
            <section class="py-10">
                <div class="text-center mb-8">
                    <TitleBadge text="OUR SERVICE" />
                </div>
                <div class="grid grid-cols-3 gap-6">
                    <!-- Link untuk Basic & Ramean Plan -->
                    <router-link to="/service/basic-ramean"
                        class="border-3 border-accent-green hover:opacity-80 transition-opacity">
                        <img src="https://placehold.co/400x500/dddddd/000000?text=Group" alt="Service 1"
                            class="w-full h-auto" />
                    </router-link>

                    <router-link to="/service/basic-ramean"
                        class="border-3 border-outline hover:opacity-80 transition-opacity">
                        <img src="https://placehold.co/400x245/aaaaaa/000000?text=Recap" alt="Service 2"
                            class="w-full h-auto mb-6" />
                        <img src="https://placehold.co/400x245/bbbbbb/000000?text=Recap" alt="Service 3"
                            class="w-full h-auto" />
                    </router-link>

                    <!-- Link untuk Pas Foto -->
                    <router-link to="/service/pas-foto"
                        class="border-3 border-accent-blue hover:opacity-80 transition-opacity">
                        <img src="https://placehold.co/400x500/eeeeee/000000?text=Pas+Foto" alt="Service 4"
                            class="w-full h-auto" />
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
                    <img src="https://placehold.co/300x400/cccccc/000000?text=Pose1" alt="Inspiration 1"
                        class="border-3 border-outline" />
                    <img src="https://placehold.co/300x400/dddddd/000000?text=Pose2" alt="Inspiration 2"
                        class="border-3 border-outline" />
                    <img src="https://placehold.co/300x400/eeeeee/000000?text=Pose3" alt="Inspiration 3"
                        class="border-3 border-outline" />
                    <img src="https://placehold.co/300x400/fafafa/000000?text=Pose4" alt="Inspiration 4"
                        class="border-3 border-outline" />
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