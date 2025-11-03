<script setup>
import { ref, onMounted, nextTick } from 'vue';
import apiClient from '@/api/api';
import feather from 'feather-icons';

// --- State ---
// 'searchQuery' sekarang menampung Booking ID (UUID)
const searchQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);
const resultBooking = ref(null);
const resultPhotos = ref([]);

// --- Fungsi ---
const handleSearch = async () => {
    if (!searchQuery.value) {
        errorMessage.value = 'Silakan masukkan Booking ID yang valid.';
        return;
    }

    isLoading.value = true;
    errorMessage.value = null;
    resultBooking.value = null;
    resultPhotos.value = [];

    try {
        // Panggil endpoint yang benar: /api/admin/photos/:bookingId
        const response = await apiClient.get(`/admin/photos/${searchQuery.value}`, {
            params: { _: new Date().getTime() }, // Cache buster
        });

        // Simpan hasil respons (struktur data { booking, photos })
        resultBooking.value = response.data.data.booking;
        resultPhotos.value = response.data.data.photos;

        if (resultPhotos.value.length === 0) {
            errorMessage.value = 'Booking ditemukan, tetapi belum ada foto di galeri ini.';
        }
    } catch (error) {
        const msg = error.response?.data?.message || 'Data tidak ditemukan atau terjadi error.';
        errorMessage.value = msg;
        console.error('Gallery search error:', error);
    } finally {
        isLoading.value = false;
        nextTick(() => feather.replace());
    }
};

// Reset pencarian
const clearSearch = () => {
    searchQuery.value = '';
    resultBooking.value = null;
    resultPhotos.value = [];
    errorMessage.value = null;
};

// Jalankan feather icons setelah render
onMounted(() => nextTick(() => feather.replace()));
</script>

<template>
    <div>
        <h1 class="text-3xl font-bold mb-6">Gallery Management</h1>

        <!-- Search Section -->
        <div class="bg-primary text-white p-4 border-3 border-outline shadow-solid mb-6 rounded-lg">
            <h2 class="font-bold text-xl mb-4">Find Booking Gallery</h2>

            <form @submit.prevent="handleSearch" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                    <label for="search-query" class="text-sm font-bold block mb-1">
                        Booking ID (UUID)
                    </label>
                    <input v-model="searchQuery" type="text" id="search-query"
                        placeholder="Tempel Booking ID (UUID) di sini..." class="w-full bg-white text-black p-2 border-2 border-black 
                    focus:outline-none focus:ring-2 focus:ring-yellow-400">
                </div>

                <div class="flex items-end">
                    <button type="submit" :disabled="isLoading" class="w-full bg-background text-text-default font-bold py-2 
                    border-3 border-outline shadow-solid hover:bg-yellow-300 
                    active:shadow-none active:translate-x-0.5 active:translate-y-0.5 
                    transition-all disabled:opacity-50">
                        <span v-if="isLoading">Searching...</span>
                        <span v-else>Search</span>
                    </button>
                </div>
            </form>
        </div>

        <!-- Hasil Pencarian -->
        <div>
            <div v-if="resultBooking" class="flex justify-between items-center mb-4">
                <div>
                    <h2 class="font-bold text-xl">Showing Gallery for:</h2>
                    <p class="text-lg">
                        {{ resultBooking.customer_name }} ({{ resultBooking.package_name }})
                    </p>
                </div>
                <button @click="clearSearch"
                    class="hover:text-primary transition-colors inline-flex items-center gap-2">
                    <i data-feather="x" class="w-5 h-5"></i>
                    Clear Search
                </button>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="bg-primary text-white p-4 border-3 border-outline shadow-solid text-center">
                Searching for gallery...
            </div>

            <!-- Error Message -->
            <div v-else-if="errorMessage"
                class="bg-red-800/50 text-white p-4 border-3 border-outline shadow-solid text-center">
                {{ errorMessage }}
            </div>

            <!-- Gallery -->
            <div v-if="resultBooking" class="bg-primary text-white p-4 border-3 border-outline shadow-solid rounded-lg">
                <div class="flex justify-end mb-4">
                    <button class="bg-background text-text-default font-bold py-2 px-4 
                    border-3 border-outline shadow-solid hover:bg-yellow-300">
                        Upload Photos
                    </button>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    <div v-for="photo in resultPhotos" :key="photo.photo_id"
                        class="relative aspect-square border-2 border-white group">
                        <img :src="photo.url" :alt="photo.photo_id" class="w-full h-full object-cover">
                        <button class="absolute top-1 right-1 p-1 bg-red-600/70 rounded-full text-white 
                    opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Photo">
                            <i data-feather="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <!-- Empty Gallery -->
                    <div v-if="resultPhotos.length === 0" class="col-span-full text-center py-10 text-white/70">
                        <i data-feather="image" class="w-16 h-16 mx-auto mb-2"></i>
                        <p>This gallery is empty. Use "Upload Photos" to add images.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
