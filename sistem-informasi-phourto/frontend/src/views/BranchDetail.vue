<script setup>
import { ref, onMounted, computed } from 'vue';
import { useBookingStore } from '../stores/booking.stores.js';
import feather from 'feather-icons';

// --- Props ---
const props = defineProps({
    branchName: String,
});
// --- Store ---
const bookingStore = useBookingStore();

// --- Accordion State ---
const activePackageId = ref(null);
const togglePlanSection = (pkgId) => {
    activePackageId.value = activePackageId.value === pkgId ? null : pkgId;
};

// --- Select Plan ---
const selectPlan = (plan) => {
    console.log("Plan selected:", plan);
    
    // PERBAIKAN V1.15: Uncomment baris ini untuk menyimpan pilihan ke Pinia.
    // Kita juga gunakan 'branchDisplayData.value' (V1.14) BUKAN 'branchInfo.value' (V1.10)
    const branchData = {
        id: branchDisplayData.value.id,
        name: branchDisplayData.value.name,
        slug: branchDisplayData.value.slug
    };
    
    // Panggil action V1.11 yang ada di store (booking.stores.js)
    bookingStore.setBranchAndPackage(branchData, plan._apiData);
};

// --- Computed Properties ---
// Data  dibaca secara reaktif dari Pinia store
const branchDisplayData = computed(() => bookingStore.currentBranchDetails);
const isLoading = computed(() => bookingStore.isLoading);
const errorMessage = computed(() => bookingStore.error);

// --- Lifecycle  ---
onMounted(async () => {
    // 1. Ambil branchSlug dari prop (properti) rute
    const slug = props.branchName ? props.branchName.toLowerCase().trim() : null;
    
    if (slug) {
        // 2. Panggil 'action' (aksi) V1.14 di Pinia Store.
        //    Store (Gudang data) akan menangani SEMUA logika (fetch, filter, map)
        await bookingStore.fetchBranchDetails(slug);
    } else {
        // (Perbaikan V1.14: Set error (kesalahan) di store (gudang data))
        bookingStore.error = "Nama cabang tidak ditemukan di URL.";
    }

    // Ganti ikon (jika Anda masih menggunakan Feather)
    setTimeout(() => feather.replace(), 50);
});
</script>

<template>
   <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
    <main class="container mx-auto px-4">

        <!-- Header -->
        <div class="flex items-center justify-between mb-12">

            <!-- BAGIAN KIRI (SAMA) -->
            <div class="w-full">
                <div class="flex items-center space-x-2">
                    <button @click="$router.back()"
                        class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:translate-y-1 hover:shadow-none transition-all">
                        <i data-feather="arrow-left" class="w-6 h-6"></i>
                    </button>

                    <div class="flex-1 flex justify-end">
                        <button @click="$router.push('/Home')"
                            class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:translate-y-1 hover:shadow-none transition-all">
                            <i data-feather="home" class="w-6 h-6"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- TAMBAHAN BARU (Super Minimal): Judul di tengah -->
            <div class="absolute left-1/2 transform -translate-x-1/2">
                <h1 class="text-2xl md:text-3xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                    {{ branchDisplayData?.name }}
                </h1>
            </div>

            <div class="flex-1"></div>
        </div>

    



            <!-- Loading -->
            <div v-if="isLoading" class="text-center py-16">
                <p>Loading...</p>
            </div>

            <!-- Error -->
            <div v-else-if="errorMessage || !branchDisplayData || branchDisplayData.packages.length === 0"
                class="text-center py-16">
                <h2 class="text-2xl font-bold">Studio atau Paket Tidak Ditemukan</h2>
                <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>

                <router-link to="/"
                    class="bg-primary text-white px-6 py-3 block w-max mx-auto mt-6 border-3 border-outline shadow-solid">
                    Kembali ke Beranda
                </router-link>
            </div>

            <!-- MAIN CONTENT -->
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
                            class="w-full bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:translate-y-1 hover:shadow-none transition-all hover:bg-yellow-600">
                            {{ activePackageId === pkg.id ? "Tutup Plan" : "Pilih Room" }}
                        </button>

                        <transition name="collapse">
                            <div v-if="activePackageId === pkg.id" class="grid">
                                <div class="overflow-hidden">
                                    <div class="space-y-3 p-3 border-2 border-outline bg-white">
                                        <p class="text-center font-bold border-b pb-1">Pilih Plan</p>

                                        <div v-for="plan in pkg.plans" :key="plan.planId" class="border p-3 space-y-2">
                                            <div class="flex justify-between font-bold">
                                                <span>{{ plan.planName }}</span>
                                                <span>Rp. {{ plan.price.toLocaleString("id-ID") }}</span>
                                            </div>

                                            <p class="text-sm font-semibold">
                                                {{ plan.capacity }} Orang
                                            </p>
                                            <p class="text-sm">{{ plan.durationText }}</p>

                                            <ul class="text-sm list-disc ml-4">
                                                <li v-for="(item, i) in plan.inclusions" :key="i">
                                                    {{ item }}
                                                </li>
                                            </ul>

                                            <router-link
                                                :to="`/booking/${props.branchName}/${pkg.id}?plan=${plan.planId}`"
                                                @click="selectPlan(plan)"
                                                class="block text-center bg-background font-bold py-2 border-2 border-outline shadow-solid hover:translate-y-1 hover:shadow-none transition-all hover:bg-yellow-600">
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