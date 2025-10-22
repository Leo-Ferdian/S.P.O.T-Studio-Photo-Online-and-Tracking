<script setup>
import { ref, onMounted, computed } from 'vue';
import feather from 'feather-icons';

// Menerima `branchName` (slug dari URL) sebagai prop
const props = defineProps({
    branchName: String
});

const isLoading = ref(true);
const errorMessage = ref(null);

// ==================== PERUBAHAN UTAMA DI SINI ====================
// Kita buat database statis untuk semua cabang di frontend
// Nantinya, ini akan digantikan oleh satu panggilan API: GET /api/branches/${props.branchName}
const allBranchesData = {
    'studio-sail': {
        name: "STUDIO SAIL",
        packages: [
            {
                id: 1,
                room: 'ROOM 1: BASIC',
                image: 'https://placehold.co/600x400/FFF9C4/000000?text=Basic+Sail',
                duration: 30,
                price: 125000,
                planType: 'Ramean Plan',
                inclusions: [
                    'For 5 Person (Max 10)',
                    '(Rp15.000/pax)',
                    '2 Photo Print Special'
                ]
            },
            {
                id: 2,
                room: 'ROOM 2: FISHEYE ZOOM',
                image: 'https://placehold.co/600x400/CFD8DC/000000?text=Fisheye+Sail',
                duration: 30,
                price: 85000,
                capacity: '1-6 Person',
                inclusions: [
                    'What You Get:',
                    'All Soft File',
                    '2 Photo Print/Strip'
                ]
            },
            {
                id: 3,
                room: 'ROOM 3: ELEVATOR',
                image: 'https://placehold.co/600x400/D1C4E9/000000?text=Elevator+Sail',
                duration: 20,
                price: 115000,
                planType: "Let's Film But Make It Fun",
                inclusions: [
                    '1-7 Person',
                    'All Soft File',
                    '2 Photo With Printed Special Frame'
                ]
            },
            {
                id: 4,
                room: 'ROOM 4: SPOTLIGHT ZOOM',
                image: 'https://placehold.co/600x400/B2EBF2/000000?text=Spotlight+Sail',
                duration: 30,
                price: 85000,
                planType: 'For Those of You who Love Vintage Photos!',
                capacity: '1-6 Person',
                inclusions: [
                    'Body Compotion, Old Money, Full Body.',
                    'What You Get:',
                    'All Soft File',
                    '2 Photo Print/Strip'
                ]
            },
        ]
    },
    'studio-panam': {
        name: "STUDIO PANAM",
        packages: [
            {
                id: 5,
                room: 'ROOM 1: BASIC',
                image: 'https://placehold.co/600x400/FFCDD2/000000?text=Basic+Panam',
                duration: 30,
                price: 125000,
                planType: 'Ramean Plan',
                inclusions: [
                    'For 5 Person',
                    'All Soft File',
                    '2 Photo Print/Strip'
                ]
            },
            {
                id: 6,
                room: 'ROOM 2: BLUE PURPLE NEON',
                image: 'https://placehold.co/600x400/C5CAE9/000000?text=Neon+Panam',
                duration: 30,
                price: 135000,
                planType: 'Fisheye Photo With Different Concept',
                inclusions: [
                    '1-10 Person',
                    'All Soft File',
                    '2 Photo Print/Strip'
                ]
            },
            {
                id: 7,
                room: 'ROOM 5: BLANK SPACE',
                image: 'https://placehold.co/600x400/E1BEE7/000000?text=Blank+Panam',
                duration: 30,
                price: 125000,
                planType: 'Ramean Plan',
                inclusions: [
                    'For 5 Person',
                    'All Soft File',
                    '2 Photo Print Special'
                ]
            },
            // Tambahkan paket lain untuk Panam di sini...
        ]
    },
    'studio-marpoyan': {
        name: "STUDIO MARPOYAN",
        packages: [
            {
                id: 8,
                room: 'ROOM 1: BASIC',
                image: 'https://placehold.co/600x400/DCEDC8/000000?text=Basic+Marpoyan',
                duration: 30,
                price: 125000,
                planType: 'Basic Plan',
                inclusions: [
                    '1-7 Person',
                    'What You Get:',
                    'All Soft File',
                    '2 Photo Print/Strip'
                ]
            },
            {
                id: 9,
                room: 'Y2K YEARBOOK CONCEPT',
                image: 'https://placehold.co/600x400/BBDEFB/000000?text=Y2K+Marpoyan',
                duration: 30,
                price: 85000,
                planType: 'For Those of You who like Fisheye Photos!',
                inclusions: [
                    'Maximal 1-6 Person',
                    'What You Get:',
                    'All Soft File',
                    '2 Photo Print/Strip'
                ]
            },
        ]
    }
};

// Computed property untuk mengambil data cabang yang sedang aktif berdasarkan URL
const currentBranchData = computed(() => allBranchesData[props.branchName]);
// ==================== AKHIR PERUBAHAN ====================


onMounted(() => {
    isLoading.value = false;
    setTimeout(() => feather.replace(), 0);
});
</script>

<template>
    <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
        <main class="container mx-auto px-4">
            <div class="flex items-center justify-between mb-12">
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <button @click="$router.back()"
                            class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                            <i data-feather="arrow-left" class="w-6 h-6"></i>
                        </button>
                        <button @click="$router.push('/')"
                            class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                            <i data-feather="home" class="w-6 h-6"></i>
                        </button>
                    </div>
                </div>
                <div class="flex-1 text-center">
                    <h1 v-if="currentBranchData" class="text-3xl font-bold">{{ currentBranchData.name }}</h1>
                </div>
                <div class="flex-1"></div>
            </div>

            <div v-if="isLoading" class="text-center py-16">
                <p>Loading...</p>
            </div>
            <div v-else-if="!currentBranchData" class="text-center py-16">
                <h2 class="text-2xl font-bold">Studio Tidak Ditemukan</h2>
                <p class="font-sans mt-2">Maaf, kami tidak dapat menemukan detail untuk lokasi ini.</p>
                <router-link to="/"
                    class="inline-block bg-primary text-text-default font-bold mt-6 py-3 px-6 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1">
                    Kembali ke Beranda
                </router-link>
            </div>

            <div v-else class="grid md:grid-cols-2 gap-8">
                <div v-for="pkg in currentBranchData.packages" :key="pkg.id"
                    class="bg-white border-4 border-outline p-4 space-y-3">
                    <p class="font-bold text-center bg-background border-2 border-outline py-1">{{ pkg.room }}</p>
                    <img :src="pkg.image" :alt="pkg.room" class="w-full h-auto object-cover border-2 border-outline">

                    <div class="bg-primary text-white p-4 font-sans text-xs space-y-3">
                        <div class="flex justify-between items-center text-sm">
                            <span class="flex items-center"><i data-feather="clock" class="w-4 h-4 mr-1.5"></i> {{
                                pkg.duration }} Minutes</span>
                            <span class="font-bold">Rp. {{ pkg.price.toLocaleString('id-ID') }}</span>
                        </div>
                        <hr class="border-black" />
                        <p v-if="pkg.planType" class="font-bold text-center text-sm">{{ pkg.planType }}</p>
                        <p v-if="pkg.capacity" class="font-bold text-center">{{ pkg.capacity }}</p>
                        <ul class="space-y-1">
                            <li v-for="(item, index) in pkg.inclusions" :key="index">{{ item }}</li>
                        </ul>
                    </div>
                    <button
                        class="w-full bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">
                        Booking Room
                    </button>
                </div>
            </div>
        </main>
    </div>
</template>