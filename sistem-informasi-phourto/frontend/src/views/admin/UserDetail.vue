<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/api/api';
import feather from 'feather-icons';

// --- State ---
const user = ref(null);
const isLoading = ref(true);
const errorMessage = ref(null);

// Dapatkan parameter "id" dari URL
const route = useRoute();
const userId = route.params.id;

// --- Fungsi ---
const fetchUserData = async () => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
        // Memanggil endpoint detail user (beserta galeri)
        const response = await apiClient.get(`/admin/users/${userId}`);
        user.value = response.data.data;
    } catch (error) {
        errorMessage.value = 'Gagal memuat data pengguna.';
        console.error('Fetch user detail error:', error);
    } finally {
        isLoading.value = false;
        nextTick(() => feather.replace());
    }
};

onMounted(() => {
    fetchUserData();
});
</script>

<template>
    <div>
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center p-10">
            <h2 class="text-2xl font-bold">Loading User Data...</h2>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="text-center p-10 bg-red-800/50 rounded-lg text-white">
            <h2 class="text-2xl font-bold mb-2">Error</h2>
            <p>{{ errorMessage }}</p>
        </div>

        <!-- User Data -->
        <div v-else-if="user">
            <h1 class="text-3xl font-bold mb-2">User: {{ user.full_name }}</h1>
            <p class="text-lg text-gray-600 mb-6">{{ user.email }}</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Gallery Section -->
                <div class="bg-primary text-white p-4 border-3 border-outline shadow-solid rounded-lg">
                    <h2 class="font-bold mb-4 text-xl">Gallery</h2>

                    <div v-if="!user.gallery || user.gallery.length === 0" class="text-center py-10 text-white/70">
                        <i data-feather="image" class="w-16 h-16 mx-auto mb-2"></i>
                        <p>No photos found for this user.</p>
                    </div>

                    <div v-else class="grid grid-cols-3 gap-2">
                        <div v-for="image in user.gallery" :key="image.id" class="aspect-square border-2 border-white">
                            <img :src="image.url" :alt="image.id" class="w-full h-full object-cover rounded-md" />
                        </div>
                    </div>

                    <button
                        class="w-full mt-4 bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300">
                        Manage Gallery
                    </button>
                </div>

                <!-- Settings Section -->
                <div class="bg-primary text-white p-4 border-3 border-outline shadow-solid rounded-lg">
                    <h2 class="font-bold mb-4 text-xl">Setting</h2>
                    <p class="text-center py-16 text-white/70">
                        Pengaturan untuk user: {{ user.full_name }}
                    </p>

                    <button
                        class="w-full mt-4 bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
