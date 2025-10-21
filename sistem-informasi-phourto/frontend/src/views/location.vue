<script setup>
    import { ref, onMounted } from 'vue';
    import apiClient from '../api/api';
    import feather from 'feather-icons';

    const branches = ref([]);
    const isLoading = ref(true);
    const errorMessage = ref(null);

    const fetchBranches = async () => {
        try {
            const response = await apiClient.get('/branches');
            // Kita tambahkan data 'tags' secara manual di frontend untuk styling
            // Idealnya, data ini bisa datang dari backend
            branches.value = response.data.data.map(branch => ({
                ...branch,
                image: `https://placehold.co/600x400/${Math.floor(Math.random() * 16777215).toString(16)}/000000?text=${branch.name.replace(' ', '+')}`,
                tags: ['BASIC', 'FISHEYE ZOOM', 'ELEVATOR', 'SPOTLIGHT ZOOM', 'BLANK SPACE', 'Y2K YEARBOOK CONCEPT']
            }));
        } catch (error) {
            errorMessage.value = 'Gagal memuat data lokasi. Silakan coba lagi nanti.';
            console.error("Failed to fetch branches:", error);
        } finally {
            isLoading.value = false;
        }
    };

    onMounted(() => {
        fetchBranches();
        feather.replace();
    });
</script>

<template>
    <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
        <main class="container mx-auto px-4">
            <!-- Header Halaman (Bagian yang Diperbaiki) -->
            <div class="flex items-center justify-between mb-12">
                <!-- Kolom Kiri: Tombol Navigasi -->
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

                <!-- Kolom Tengah: Judul Halaman -->
                <div class="flex-1 text-center">
                    <h1 class="text-3xl font-bold">LOCATION</h1>
                </div>

                <!-- Kolom Kanan: Dibuat Kosong agar Judul Tetap di Tengah -->
                <div class="flex-1"></div>
            </div>

            <!-- Loading & Error State -->
            <div v-if="isLoading" class="text-center py-16">
                <p>Loading locations...</p>
            </div>
            <div v-if="errorMessage" class="text-center py-16 bg-primary/20 text-primary border-2 border-primary p-4">
                {{ errorMessage }}
            </div>

            <!-- Daftar Lokasi -->
            <div v-else class="space-y-12 flex flex-col items-center">
                <div v-for="branch in branches" :key="branch.id" class="max-w-md w-full">
                    <div class="border-4 border-outline">
                        <img :src="branch.image" :alt="branch.name" class="w-full h-auto object-cover">
                    </div>
                    <div class="bg-primary text-text-default p-4 border-4 border-outline border-t-0">
                        <h2 class="font-bold text-xl mb-1">{{ branch.name }}</h2>
                        <p class="font-sans text-xs mb-3">{{ branch.address }}</p>
                        <div class="flex flex-wrap gap-1.5">
                            <span v-for="tag in branch.tags" :key="tag"
                                class="bg-black text-white text-[10px] font-bold px-2 py-0.5">
                                {{ tag }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>