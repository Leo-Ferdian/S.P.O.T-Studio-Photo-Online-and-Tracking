<script setup>
    import { ref, onMounted, computed } from 'vue';
    import feather from 'feather-icons';

    // ============================================================
    import bgungu from '../assets/bgungu.jpg';
    import bglightgrey from '../assets/bglightgrey.jpg';
    import bgcreamm from '../assets/bgcreamm.jpg';
    import bgmintgreen from '../assets/bgmintgreen.jpg';
    import bgbluenavy from '../assets/bgbluenavy.jpg';
    import bgmaroon from '../assets/bgmaroon.jpg';
    import bgwhite from '../assets/bgwhite.jpg';
    import bgorange from '../assets/bgorange.jpg';

    // Menerima `planName` dari URL sebagai prop
    const props = defineProps({
    planName: String
    });

    const isLoading = ref(true);

    // ============================================================
    //  Data galeri statis
    // ============================================================
        const galleryData = {
        'basic-ramean': {
        title: 'BASIC PLAN & RAMEAN PLAN',
        images: [
        { url: bgungu, label: 'PURPLE' },
        { url: bglightgrey, label: 'LIGHT GREY' },
        { url: bgcreamm, label: 'LIGHT CREAM' },
        { url: bgmintgreen, label: 'MINT GREEN' },
        { url: bgbluenavy, label: 'BLUE NAVY' },
        { url: bgmaroon, label: 'MAROON' },
        { url: bgwhite, label: 'WHITE' },
        { url: bgorange, label: 'ORANGE' },
        ]
    },

        
        // =============================================
        //  MODIFIKASI DI SINI: Data 'pas-foto' dilengkapi
        // =============================================
        'pas-foto': {
            title: 'PAS FOTO MENU', 
            
            images: [ 
                { url: 'https://placehold.co/300x400/D32F2F/white?text=Pas+Foto+1', label: 'PAS FOTO MERAH' },
                // ...
            ],
            
            // DATA BARU: Ini data untuk kartu detail dari gambar
            details: {
              duration: 30,
              price: 125000,
              capacity: '1-2 Person',
              capacityPrice: 'Rp 125.000 /Person',
              backgrounds: [
                'Pas Foto: Merah dan Biru',
                'Bebas: Pink dan Abu'
              ],
              addOn: {
                title: 'Add On Pas Foto:',
                price: 'Rp 25.000,00'
              },
              whatYouGet: [
                '1 Photo with Printed A4 Size',
                'Photo 2x3 (8 pcs)',
                'Photo 3x4 (2 pcs)',
                'Photo 4x6 (2 pcs)'
              ]
            }
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

            <div v-if="isLoading" class="text-center py-16">
                <p>Loading gallery...</p>
            </div>

            <div v-else-if="currentGallery && props.planName === 'pas-foto'" class="space-y-8">
                
                <div class="grid grid-cols-2  gap-6">
                    <div class="bg-primary text-white">
                        <div class="grid grid-cols-2">
                            <img src="@/assets/pas-photo-merah.jpg" alt="Pas Foto Merah" class="w-full h-auto">
                            <img src="@/assets/pas-photo-merah.jpg" alt="Pas Foto Merah" class="w-full h-auto">
                            <img src="@/assets/pas-photo-biru.jpg" alt="Pas Foto Biru" class="w-full h-auto">
                            <img src="@/assets/pas-photo-biru.jpg" alt="Pas Foto Biru" class="w-full h-auto">
                        </div>
                        <p class="w-full text-center py-3 font-bold text-xl uppercase">PAS FOTO</p>
                    </div>
                    <div class="bg-gray-700 text-white">
                        <div class="grid grid-cols-2">
                            <img src="@/assets/pas-photo-merah.jpg" alt="Pas Foto Merah" class="w-full h-auto">
                            <img src="@/assets/pas-photo-merah.jpg" alt="Pas Foto Merah" class="w-full h-auto">
                            <img src="@/assets/pas-photo-biru.jpg" alt="Pas Foto Biru" class="w-full h-auto">
                            <img src="@/assets/pas-photo-biru.jpg" alt="Pas Foto Biru" class="w-full h-auto">
                        </div>
                        <p class="w-full text-center py-3 font-bold text-xl uppercase">BACKGROUND</p>
                    </div>
                </div>

                <div class="bg-white text-black border-4 border-primary p-8">
                    <h2 class="font-bold text-2xl text-center mb-4 uppercase">Pas Foto Menu</h2>
                    <div class="flex justify-between items-center border-2 border-black/50 px-4 py-3 mb-6">
                        <span class="flex items-center text-lg">
                            <i data-feather="clock" class="w-5 h-5 mr-2"></i> {{ currentGallery.details.duration }} Minutes
                        </span>
                        <span class="flex items-center text-lg font-bold">
                            <i data-feather="tag" class="w-5 h-5 mr-2"></i> Rp. {{ currentGallery.details.price.toLocaleString('id-ID') }},00
                        </span>
                    </div>
                    <div class="grid md:grid-cols-2 gap-6 font-sans text-sm md:text-base">
                        <div class="space-y-4">
                            <div>
                                <p class="font-bold">Capacity: {{ currentGallery.details.capacity }}</p>
                                <p>{{ currentGallery.details.capacityPrice }}</p>
                            </div>
                            <div>
                                <p class="font-bold">Pilihan Background:</p>
                                <ul class="list-disc list-inside">
                                    <li v-for="(bg, index) in currentGallery.details.backgrounds" :key="index">{{ bg }}</li>
                                </ul>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <p class="font-bold">{{ currentGallery.details.addOn.title }}</p>
                                <p>{{ currentGallery.details.addOn.price }}</p>
                            </div>
                            <div>
                                <p class="font-bold">What Do You Get:</p>
                                <ul class="list-disc list-inside">
                                    <li v-for="(item, index) in currentGallery.details.whatYouGet" :key="index">{{ item }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="currentGallery" class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div v-for="(item, index) in currentGallery.images" :key="index" class="border-4 border-outline">
                    <img :src="item.url" :alt="item.label" class="w-full h-auto object-cover">
                    <p class="font-display text-center bg-white p-2 border-t-4 border-black">{{ item.label }}</p>
                </div>
            </div>

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