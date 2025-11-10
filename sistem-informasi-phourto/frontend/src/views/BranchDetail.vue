<script setup>
import { ref, onMounted } from 'vue';
import feather from 'feather-icons';
import { useBookingStore } from '../stores/booking.stores.js';
import apiClient from '../api/api';

// --- Props ---
const props = defineProps({
    branchName: String, // contoh: 'studio-sail'
});

// --- State & Store ---
const bookingStore = useBookingStore();
const isLoading = ref(true);
const errorMessage = ref(null);
const branchDisplayData = ref(null);
const branchInfo = ref({
    id: null,
    name: null,
    slug: props.branchName,
});

// --- Accordion State ---
const activePackageId = ref(null);
const togglePlanSection = (pkgId) => {
    activePackageId.value = activePackageId.value === pkgId ? null : pkgId;
};

// --- Select Plan ---
const selectPlan = (plan) => {
    bookingStore.setBranchAndPackage(branchInfo.value, plan._apiData);
};

// --- Lookup Tables ---
const slugToIdLookup = {
    'studio-sail': 'c4e3d584-9123-49e9-b644-413db743ca33',
    'studio-panam': 'f5534e4c-13d5-436a-9624-3705ef1fc989',
    'studio-marpoyan': 'f0bce5e9-4842-42cf-ad97-979c2d57cd32',
};

const roomIdToImageLookup = {
    // Marpoyan
    'aef50ffd-3d8b-449e-a8a8-ec2decc57c2b': new URL('@/assets/basicmarpoyan.jpg', import.meta.url).href,
    '0a88cc8f-0046-4a48-a099-0a92be7cda50': new URL('@/assets/y2kmarpoyan.jpg', import.meta.url).href,
    // Panam
    '58877723-d72a-4635-aa98-162b893538dc': new URL('@/assets/basicpanam.jpg', import.meta.url).href,
    '799146e4-0931-4552-8184-767ad23d4cb7': new URL('@/assets/bluepurplee.jpg', import.meta.url).href,
    '90e90302-fc2e-49e4-99c3-cde40550b528': new URL('@/assets/blank.jpg', import.meta.url).href,
    // Sail
    '9f13d4a6-0dea-495e-9da6-f1cc1cf0a1dd': new URL('@/assets/basicsail.jpg', import.meta.url).href,
    'e81944df-c94b-422e-b132-82529f369e2a': new URL('@/assets/fisheyesail.jpg', import.meta.url).href,
    'b3f136c7-03f8-41e7-81cf-65dc21302033': new URL('@/assets/elevatorsail.jpg', import.meta.url).href,
    '4ba0837f-60e8-4ca2-800d-d9ce8e195bc8': new URL('@/assets/blank.jpg', import.meta.url).href,
};

// --- Helper Functions ---
const getRoomImage = (roomId) => {
    return roomIdToImageLookup[roomId] || new URL('@/assets/blank.jpg', import.meta.url).href;
};

const parseInclusions = (inclusionsStr) => {
    if (!inclusionsStr) return [];
    return inclusionsStr
        .split('\n')
        .map((item) => item.replace(/^- /, '').trim())
        .filter((item) => item.length > 0);
};

// --- Lifecycle ---
onMounted(async () => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
        const slug = props.branchName ? props.branchName.toLowerCase().trim() : null;
        const targetBranchId = slugToIdLookup[slug];

        if (!targetBranchId) throw new Error(`Cabang "${slug}" tidak ditemukan.`);

        const response = await apiClient.get('/packages/catalog');
        const allPackages = response.data.data.data;
        const branchPackages = allPackages.filter((pkg) => pkg.branch_id === targetBranchId);

        if (branchPackages.length === 0) {
            branchInfo.value.name = props.branchName.replace('-', ' ').toUpperCase();
            branchDisplayData.value = { name: branchInfo.value.name, packages: [] };
            console.warn('Tidak ada paket ditemukan untuk studio ini.');
        } else {
            const roomsMap = new Map();

            for (const pkg of branchPackages) {
                if (!branchInfo.value.id) {
                    branchInfo.value.id = pkg.branch_id;
                    branchInfo.value.name = pkg.branch_name;
                }

                const templatePlan = {
                    planId: pkg.package_id,
                    planName: pkg.package_name,
                    price: parseFloat(pkg.price),
                    capacity: pkg.capacity,
                    inclusions: parseInclusions(pkg.inclusions),
                    duration: pkg.duration_in_minutes,
                    durationText: pkg.duration,
                    _apiData: pkg,
                };

                if (!roomsMap.has(pkg.room_id)) {
                    roomsMap.set(pkg.room_id, {
                        id: pkg.room_id,
                        room: pkg.room_name_display,
                        image: getRoomImage(pkg.room_id),
                        duration: pkg.duration_in_minutes,
                        plans: [],
                    });
                }

                roomsMap.get(pkg.room_id).plans.push(templatePlan);
            }

            branchDisplayData.value = {
                name: branchInfo.value.name,
                packages: Array.from(roomsMap.values()),
            };
        }
    } catch (error) {
        console.error('Gagal mengambil detail cabang:', error);
        errorMessage.value = error.message || 'Gagal memuat data paket.';
        branchDisplayData.value = null;
    } finally {
        isLoading.value = false;
        setTimeout(() => feather.replace(), 50);
    }
});
</script>

<template>
    <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
        <main class="container mx-auto px-4">

            <!-- Header -->
            <div class="flex items-center justify-between mb-12">
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <button @click="$router.back()"
                            class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid">
                            <i data-feather="arrow-left" class="w-6 h-6"></i>
                        </button>
                        <button @click="$router.push('/Home')"
                            class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid">
                            <i data-feather="home" class="w-6 h-6"></i>
                        </button>
                    </div>
                </div>
                <div class="flex-1 text-center">
                    <h1 v-if="branchDisplayData" class="text-3xl font-bold">
                        {{ branchDisplayData.name }}
                    </h1>
                </div>
                <div class="flex-1"></div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-16">
                <p>Loading...</p>
            </div>

            <!-- Error / Not Found -->
            <div v-else-if="!branchDisplayData || branchDisplayData.packages.length === 0" class="text-center py-16">
                <h2 class="text-2xl font-bold">Studio atau Paket Tidak Ditemukan</h2>
                <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
                <router-link to="/"
                    class="bg-primary text-white px-6 py-3 block w-max mx-auto mt-6 border-3 border-outline shadow-solid">
                    Kembali ke Beranda
                </router-link>
            </div>

            <!-- Main Content -->
            <div v-else class="grid md:grid-cols-2 gap-8 md:items-start">
                <div v-for="pkg in branchDisplayData.packages" :key="pkg.id"
                    class="bg-white border-4 border-outline p-4 space-y-3 flex flex-col">
                    <p class="font-bold text-center bg-background border-2 border-outline py-1">
                        {{ pkg.room }}
                    </p>

                    <img :src="pkg.image" :alt="pkg.room" class="w-full h-auto border-2 border-outline" />

                    <div class="space-y-3 mt-auto">
                        <div class="bg-primary text-white p-2 font-sans text-sm flex items-center">
                            <i data-feather="clock" class="w-4 h-4 mr-1.5"></i>
                            {{ pkg.duration }} Minutes
                        </div>

                        <button @click="togglePlanSection(pkg.id)"
                            class="w-full bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid">
                            {{ activePackageId === pkg.id ? 'Tutup Plan' : 'Pilih Room' }}
                        </button>

                        <transition name="collapse">
                            <div v-if="activePackageId === pkg.id" class="grid">
                                <div class="overflow-hidden">
                                    <div class="space-y-3 p-3 border-2 border-outline bg-white">
                                        <p class="text-center font-bold border-b pb-1">Pilih Plan</p>

                                        <div v-for="plan in pkg.plans" :key="plan.planId" class="border p-3 space-y-2">
                                            <div class="flex justify-between font-bold">
                                                <span>{{ plan.planName }}</span>
                                                <span>Rp. {{ plan.price.toLocaleString('id-ID') }}</span>
                                            </div>

                                            <p class="text-sm font-semibold">{{ plan.capacity }}</p>
                                            <p class="text-sm">{{ plan.durationText }}</p>

                                            <ul class="text-sm list-disc ml-4">
                                                <li v-for="(item, i) in plan.inclusions" :key="i">
                                                    {{ item }}
                                                </li>
                                            </ul>

                                            <router-link
                                                :to="`/booking/${props.branchName}/${pkg.id}?plan=${plan.planId}`"
                                                @click="selectPlan(plan)"
                                                class="block text-center bg-background font-bold py-2 border-2 border-outline shadow">
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
