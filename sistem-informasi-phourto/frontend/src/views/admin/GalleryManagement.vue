<script setup>
import { ref, onMounted, nextTick } from 'vue';
import apiClient from '../../api/api';
import feather from 'feather-icons';

// -----------------------------------------------------
// STATE
// -----------------------------------------------------
const searchQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);
const resultBooking = ref(null);
const resultPhotos = ref([]);

// Upload State
const fileInput = ref(null);
const isUploading = ref(false);
const uploadMessage = ref(null);



// -----------------------------------------------------
// FUNGSI UTAMA: SEARCH
// -----------------------------------------------------
const handleSearch = async () => {
    if (!searchQuery.value) {
        errorMessage.value = 'Silakan masukkan Booking ID yang valid.';
        return;
    }

    isLoading.value = true;
    errorMessage.value = null;
    uploadMessage.value = null;
    resultBooking.value = null;
    resultPhotos.value = [];

    try {
        const response = await apiClient.get(`/admin/photos/${searchQuery.value}`, {
            params: { _: Date.now() }
        });

        resultBooking.value = response.data.data.booking;
        resultPhotos.value = response.data.data.photos;

        if (resultPhotos.value.length === 0) {
            errorMessage.value = 'Booking ditemukan, tetapi galeri ini masih kosong.';
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Data tidak ditemukan atau terjadi error.';
        console.error('Gallery search error:', error);
    } finally {
        isLoading.value = false;
        nextTick(() => feather.replace());
    }
};



// -----------------------------------------------------
// RESET SEARCH
// -----------------------------------------------------
const clearSearch = () => {
    searchQuery.value = '';
    resultBooking.value = null;
    resultPhotos.value = [];
    errorMessage.value = null;
    uploadMessage.value = null;
};



// -----------------------------------------------------
// UPLOAD HANDLING
// -----------------------------------------------------
const triggerFileInput = () => {
    if (!isUploading.value) {
        uploadMessage.value = null;
        fileInput.value.click();
    }
};

const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length) {
        handleUpload(files);
    }

    event.target.value = null; // allow re-selecting same file
};


// PROSES UPLOAD
const handleUpload = async (files) => {
    if (!resultBooking.value) {
        uploadMessage.value = { type: 'error', text: 'Booking tidak ditemukan.' };
        return;
    }

    const bookingId = resultBooking.value.booking_id;
    const formData = new FormData();

    for (const file of files) {
        formData.append('photos', file);
    }

    isUploading.value = true;
    uploadMessage.value = { type: 'info', text: 'Mengunggah file...' };

    try {
        await apiClient.post(
            `/admin/photos/upload/${bookingId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        uploadMessage.value = { type: 'success', text: 'Upload berhasil! Memuat ulang galeri...' };

        // reload gallery
        setTimeout(() => {
            handleSearch();
            uploadMessage.value = null;
        }, 1500);

    } catch (error) {
        uploadMessage.value = { type: 'error', text: error.response?.data?.message || 'Upload gagal.' };
        console.error('Upload error:', error);
    } finally {
        isUploading.value = false;
    }
};



// -----------------------------------------------------
// LIFECYCLE
// -----------------------------------------------------
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
                    <label class="text-sm font-bold block mb-1">Booking ID (UUID)</label>
                    <input v-model="searchQuery" type="text" placeholder="Tempel Booking ID di sini..."
                        class="w-full bg-white text-black p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>

                <div class="flex items-end">
                    <button type="submit" :disabled="isLoading"
                        class="w-full bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50">
                        <span v-if="isLoading">Searching...</span>
                        <span v-else>Search</span>
                    </button>
                </div>
            </form>
        </div>


        <!-- Result -->
        <div>

            <!-- Clear Button -->
            <div v-if="resultBooking" class="flex justify-between items-center mb-4">
                <button @click="clearSearch"
                    class="hover:text-primary transition-colors inline-flex items-center gap-2">
                    <i data-feather="x" class="w-5 h-5"></i>
                    Clear Search
                </button>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="bg-primary text-white p-4 text-center border-3 border-outline shadow-solid">
                Searching for gallery...
            </div>

            <!-- Error -->
            <div v-else-if="errorMessage && !resultBooking"
                class="bg-red-800/50 text-white p-4 border-3 border-outline shadow-solid text-center">
                {{ errorMessage }}
            </div>


            <!-- Gallery -->
            <div v-if="resultBooking" class="bg-primary text-white p-4 border-3 border-outline shadow-solid rounded-lg">

                <!-- Upload Button -->
                <div class="flex justify-end mb-4">
                    <input type="file" ref="fileInput" @change="handleFileSelect" multiple hidden
                        accept="image/jpeg, image/png" />

                    <button @click="triggerFileInput" :disabled="isUploading"
                        class="bg-background text-text-default font-bold py-2 px-4 border-3 border-outline shadow-solid hover:bg-yellow-300 disabled:opacity-50">
                        <span v-if="isUploading">Uploading...</span>
                        <span v-else>Upload Photos</span>
                    </button>
                </div>

                <!-- Upload Notification -->
                <div v-if="uploadMessage" class="p-3 mb-4 text-center text-sm" :class="{
                    'bg-green-500/30 text-green-300': uploadMessage.type === 'success',
                    'bg-red-800/50 text-white': uploadMessage.type === 'error',
                    'bg-blue-500/30 text-blue-300': uploadMessage.type === 'info'
                }">
                    {{ uploadMessage.text }}
                </div>

                <!-- Photos -->
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    <div v-for="photo in resultPhotos" :key="photo.photo_id"
                        class="relative aspect-square border-2 border-white group">
                        <img :src="photo.url" class="w-full h-full object-cover" />

                        <button
                            class="absolute top-1 right-1 p-1 bg-red-600/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Photo">
                            <i data-feather="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <!-- Empty Gallery -->
                    <div v-if="resultPhotos.length === 0 && errorMessage"
                        class="col-span-full text-center py-10 text-white/70">
                        <i data-feather="image" class="w-16 h-16 mx-auto mb-2"></i>
                        <p>{{ errorMessage }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
