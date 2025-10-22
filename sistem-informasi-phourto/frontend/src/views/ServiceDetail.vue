<script setup>
    import { ref, onMounted, computed } from 'vue';
    import feather from 'feather-icons';

    // Menerima `planName` dari URL sebagai prop
    const props = defineProps({
        planName: String
    });

    const isLoading = ref(true);

    // Data galeri statis sebagai contoh. Nanti bisa diambil dari API.
    const galleryData = {
        'basic-ramean': {
            title: 'BASIC PLAN & RAMEAN PLAN',
            images: [
                { url: 'https://placehold.co/600x400/D1C4E9/000000', label: 'PURPLE' },
                { url: 'https://placehold.co/600x400/CFD8DC/000000', label: 'LIGHT GREY' },
                { url: 'https://placehold.co/600x400/FFF9C4/000000', label: 'LIGHT CREAM' },
                { url: 'https://placehold.co/600x400/B2EBF2/000000', label: 'MINT GREY' },
                { url: 'https://placehold.co/600x400/1A237E/FFFFFF', label: 'BLUE NAVY' },
                { url: 'https://placehold.co/600x400/B71C1C/FFFFFF', label: 'MAROON' },
                { url: 'https://placehold.co/600x400/FAFAFA/000000', label: 'WHITE' },
                { url: 'https://placehold.co/600x400/FF8A65/000000', label: 'ORANGE' },
            ]
        },
        // Anda bisa menambahkan data untuk plan lain di sini
        'pas-foto': {
            title: 'PAS FOTO',
            images: [
                // ... daftar gambar untuk pas foto
            ]
        }
    };

    const currentGallery = computed(() => galleryData[props.planName]);

    onMounted(() => {
        isLoading.value = false;
        setTimeout(() => feather.replace(), 0);
    });
</script>

<template>
    <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
        <main class="container mx-auto px-4">
            <!-- Header Halaman -->
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
                    <span v-if="currentGallery"
                        class="inline-block bg-primary text-text-default px-6 py-2 border-3 border-outline shadow-solid">
                        {{ currentGallery.title }}
                    </span>
                </div>
                <div class="flex-1"></div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-16">
                <p>Loading gallery...</p>
            </div>

            <!-- Galeri Foto -->
            <div v-else-if="currentGallery" class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div v-for="(item, index) in currentGallery.images" :key="index" class="border-4 border-outline">
                    <img :src="item.url" :alt="item.label" class="w-full h-auto object-cover">
                    <p class="font-display text-center bg-white p-2 border-t-4 border-black">{{ item.label }}</p>
                </div>
            </div>

            <!-- Not Found State -->
            <div v-else class="text-center py-16">
                <h2 class="text-2xl font-bold">Galeri Tidak Ditemukan</h2>
                <p class="font-sans mt-2">Maaf, kami tidak dapat menemukan detail untuk layanan ini.</p>
                <router-link to="/"
                    class="inline-block bg-primary text-text-default font-bold mt-6 py-3 px-6 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1">
                    Kembali ke Beranda
                </router-link>
            </div>
        </main>
    </div>
</template>