<script setup>
import { ref, onMounted, computed } from 'vue'; // 'reactive' sudah tidak dipakai
import feather from 'feather-icons';
import { useBookingStore } from '../stores/booking.stores.js';

const props = defineProps({
    branchName: String
});

const bookingStore = useBookingStore();
const isLoading = ref(true);

// State untuk accordion: menyimpan ID paket yang sedang terbuka
const activePackageId = ref(null);

const selectPlan = (pkg, plan) => {
    const branchInfo = {
        id: currentBranchData.value?.id || props.branchName,
        name: currentBranchData.value?.name,
        slug: props.branchName
    };

    const combinedPackageData = {
        ...pkg,
        ...plan,
        planType: plan.planName,
        id: pkg.id
    };

    delete combinedPackageData.plans;
    delete combinedPackageData.planId;

    bookingStore.setBranchAndPackage(branchInfo, combinedPackageData);
};

// Fungsi untuk buka/tutup accordion
const togglePlanSection = (pkgId) => {
    if (activePackageId.value === pkgId) {
        activePackageId.value = null; // Tutup jika diklik lagi
    } else {
        activePackageId.value = pkgId; // Buka yang baru
    }
};

// --- PERUBAHAN DATA: Menggunakan format new URL() untuk gambar ---
const allBranchesData = {
    'studio-sail': {
        name: "STUDIO SAIL",
        packages: [
            {
                id: 1,
                room: 'ROOM 1: BASIC',
                image: new URL('@/assets/basicsail.jpg', import.meta.url).href,
                duration: 30,
                plans: [
                    { planId: 'basic', planName: 'Basic Plan', price: 125000, capacity: 'For 1-2 Person', inclusions: ['All Soft file', '1 Photo Print Basic Frame'] },
                    { planId: 'ramean', planName: 'Ramean Plan', price: 215000, capacity: 'For 5 Person', inclusions: ['All Soft file', '3 Photo Print Special & Basic Frame'] }
                ]
            },
            {
                id: 2,
                room: 'ROOM 2: FISHEYE',
                image: new URL('@/assets/fisheyesail.jpg', import.meta.url).href,
                duration: 30,
                plans: [
                    { planId: 'fisheye-std', planName: 'Fisheye Plan', price: 65000, capacity: '1-6 Person', inclusions: ['What You Get:','All Soft File', '1 Photo Print/Person'] }
                ]
            },
            {
                id: 3,
                room: 'ROOM 3: ELEVATOR',
                image: new URL('@/assets/elevatorsail.jpg', import.meta.url).href,
                duration: 30,
                plans: [
                    { planId: 'elevator-std', planName: "Let's Film But Make It Fun", price: 65000, capacity: '1-6 Person', inclusions: ['All Soft File', 'price 65.000/Person','1 Photo With Printed/Person'] }
                ]
            },
            {
                id: 4,
                room: 'ROOM 4: SPOTLIGHT ZOOM',
                image: new URL('@/assets/spotlight.jpg', import.meta.url).href,
                duration: 30,
                plans: [
                    { planId: 'spotlight-std', planName: 'For Those who Love Vintage Photos!', price: 85000, capacity: '1-6 Person', inclusions: ['Body Composition, Old Money, Full Body.', 'All Soft File', '2 Photo Print/Strip'] }
                ]
            },
            {
                id: 10,
                room: 'ROOM 4: BLANK SPACE',
                image: new URL('@/assets/blank.jpg', import.meta.url).href, // Asumsi pakai blank.jpg
                duration: 60,
                plans: [
                    { planId: 'blank-sail-std', planName: 'Vintage Photos Package', price: 815000, capacity: '1-15 Person', inclusions: ['What You Get:', 'All Soft File', '5 Photo Prints (A5 & 4R)'] }
                ]
            },
            {
                id: 11,
                room: 'CH 1 Y2K YEARBOOK',
                image: new URL('@/assets/y2ksail.jpg', import.meta.url).href, // Asumsi nama file
                duration: 30,
                plans: [
                    { planId: 'y2k-basic', planName: 'Y2K Yearbook Basic', price: 129000, capacity: 'For 2 Person', inclusions: ['All Soft file', '2 Photo Print basic frame'] },
                    { planId: 'y2k-ramean', planName: 'Y2K Yearbook Ramean', price: 299000, capacity: 'For 5 Person', inclusions: ['All Soft file', '5 Photo Print basic frame'] }
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
                image: new URL('@/assets/basicpanam.jpg', import.meta.url).href,
                duration: 30,
                plans: [
                    { planId: 'basic', planName: 'Basic Plan', price: 125000, capacity: 'For 1-2 Person', inclusions: ['All Soft file', '1 Photo Print basic frame'] },
                    { planId: 'ramean', planName: 'Ramean Plan', price: 215000, capacity: 'For 5 Person', inclusions: ['All Soft file', '3 Photo Print Special & basic frame'] }
                ]
            },
            {
                id: 6,
                room: 'ROOM 2: BLUE PURPLE ROOM',
                image: new URL('@/assets/bluepurplee.jpg', import.meta.url).href,
                duration: 30,
                plans: [
                    { planId: 'neon-std', planName: 'Fisheye Concept', price: 110000, capacity: '1-2 Person', inclusions: ['All Soft File', '2 Photo Print/Paket'] }
                ]
            },
            {
                id: 7,
                room: 'ROOM 3: BLANK SPACE',
                image: new URL('@/assets/blank.jpg', import.meta.url).href,
                duration: 60,
                plans: [
                    { planId: 'blank-panam-std', planName: 'Blank Space', price: 815000, capacity: 'For 15 Person', inclusions: ['All Soft File', '5 Photo Prints (A5 & 4R)'] }
                ]
            },
            {
                id: 12,
                room: 'Y2K YEARBOOK CONCEPT',
                image: new URL('@/assets/y2kpanam.jpg', import.meta.url).href, // Asumsi nama file
                duration: 30,
                plans: [
                    { planId: 'y2k-basic-blue', planName: 'Y2K Basic (Blue)', price: 129000, capacity: 'For 2 Person', inclusions: ['All Soft file', '2 Photo Print basic frame (Blue)'] },
                    { planId: 'y2k-ramean-blue', planName: 'Y2K Ramean (Blue)', price: 299000, capacity: 'For 5 Person', inclusions: ['All Soft file', '5 Photo Print basic frame (Blue)'] },
                    { planId: 'y2k-basic-pink', planName: 'Y2K Basic (Pink)', price: 129000, capacity: 'For 2 Person', inclusions: ['All Soft file', '2 Photo Print basic frame (Pink)'] },
                    { planId: 'y2k-ramean-pink', planName: 'Y2K Ramean (Pink)', price: 299000, capacity: 'For 5 Person', inclusions: ['All Soft file', '5 Photo Print basic frame (Pink)'] }
                ]
            },
    
            {
                id: 13, 
                room: 'ROOM 4: SPOTLIGHT ZOOM',
                image: new URL('@/assets/spotlight.jpg', import.meta.url).href,
                duration: 30,
                plans: [
                    { planId: 'spotlight-std', planName: 'For Those who Love Vintage Photos!', price:175000, capacity: '1-2 Person', inclusions: ['Body Composition, Old Money, Full Body.', 'All Soft File', '1 4R Photo Print/Person'] }
                ]
            }
            // --- AKHIR PENAMBAHAN ---
        ]
    },
    'studio-marpoyan': {
        name: "STUDIO MARPOYAN",
        packages: [
            {
                id: 8,
                room: 'ROOM 1: BASIC',
                image: new URL('@/assets/basicmarpoyan.jpg', import.meta.url).href,
                duration: 30,
                plans: [
                    { planId: 'basic', planName: 'Basic Plan', price: 125000, capacity: 'For 1-2 Person', inclusions: ['All Soft file', '2 Photo Print basic frame'] },
                    { planId: 'ramean', planName: 'Ramean Plan', price: 215000, capacity: 'For 5 Person', inclusions: ['All Soft file', '3 Photo Print Special & basic frame'] }
                ]
            },
            {
                id: 9,
                room: 'Y2K YEARBOOK CONCEPT',
                image: new URL('@/assets/y2kmarpoyan.jpg', import.meta.url).href,
                duration: 30,
                plans: [
                    { planId: 'y2k-marpoyan-std', planName: 'Fisheye Photos', price: 85000, capacity: 'Max 1-6 Person', inclusions: ['All Soft File', '2 Photo Print/Strip'] }
                ]
            },
        ]
    }
};
// --- AKHIR PERUBAHAN DATA ---

const currentBranchData = computed(() => allBranchesData[props.branchName]);

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
                        <button @click="$router.back()" class="p-2 bg-primary text-white border-3 border-outline shadow-solid">
                            <i data-feather="arrow-left" class="w-6 h-6"></i>
                        </button>
                        <button @click="$router.push('/')" class="p-2 bg-primary text-white border-3 border-outline shadow-solid">
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
                <router-link to="/" class="bg-primary text-white px-6 py-3 block w-max mx-auto mt-6 border-3 border-outline shadow-solid">
                    Kembali ke Beranda
                </router-link>
            </div>

            <div v-else class="grid md:grid-cols-2 gap-8 md:items-start">
                <div 
                    v-for="pkg in currentBranchData.packages" 
                    :key="pkg.id"
                    class="bg-white border-4 border-outline p-4 space-y-3 flex flex-col"
                >
                    <p class="font-bold text-center bg-background border-2 border-outline py-1">{{ pkg.room }}</p>

                    <img :src="pkg.image" :alt="pkg.room" class="w-full h-auto border-2 border-outline" />

                    <div class="space-y-3 mt-auto">
                        <div class="bg-primary text-white p-2 font-sans text-sm flex items-center">
                            <i data-feather="clock" class="w-4 h-4 mr-1.5"></i>{{ pkg.duration }} Minutes
                        </div>

                        <button
                            @click="togglePlanSection(pkg.id)" class="w-full bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid"
                        >
                            {{ activePackageId === pkg.id ? 'Tutup Plan' : 'Pilih Room' }}
                        </button>

                        <transition name="collapse">
                            <div 
                                v-if="activePackageId === pkg.id"
                                class="grid"
                            >
                                <div class="overflow-hidden">
                                    <div class="space-y-3 p-3 border-2 border-outline bg-white">
                                        <p class="text-center font-bold border-b pb-1">Pilih Plan</p>

                                        <div
                                            v-for="plan in pkg.plans"
                                            :key="plan.planId"
                                            class="border p-3 space-y-2"
                                        >
                                            <div class="flex justify-between font-bold">
                                                <span>{{ plan.planName }}</span>
                                                <span>Rp. {{ plan.price.toLocaleString('id-ID') }}</span>
                                            </div>

                                            <p class="text-sm font-semibold">{{ plan.capacity }}</p>

                                            <ul class="text-sm list-disc ml-4">
                                                <li v-for="(item, i) in plan.inclusions" :key="i">{{ item }}</li>
                                            </ul>

                                            <router-link
                                                :to="`/booking/${props.branchName}/${pkg.id}?plan=${plan.planId}`"
                                                @click="selectPlan(pkg, plan)"
                                                class="block text-center bg-background font-bold py-2 border-2 border-outline shadow"
                                            >
                                                Booking Room
                                            </router-link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </transition>

                    </div>
                </div>
            </div>

        </main>
    </div>
</template>

<style>
/* CSS Transisi (tidak berubah) */
.collapse-enter-active,
.collapse-leave-active {
  transition: grid-template-rows 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.collapse-enter-from,
.collapse-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  grid-template-rows: 1fr;
  opacity: 1;
}
</style>