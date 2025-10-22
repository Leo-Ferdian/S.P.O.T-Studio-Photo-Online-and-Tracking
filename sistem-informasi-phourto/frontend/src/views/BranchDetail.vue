<script setup>
    import { ref, onMounted, computed } from 'vue';
    import feather from 'feather-icons';

    // Menerima `branchName` dari URL sebagai prop
    const props = defineProps({
        branchName: String
    });

    const isLoading = ref(true);
    const errorMessage = ref(null);

    // Data statis sebagai contoh. Idealnya, ini akan menjadi satu panggilan API
    // ke backend: `GET /api/branches/nama-cabang/packages`
    const branchData = ref({
        name: "STUDIO SAIL",
        packages: [
            {
                id: 1,
                room: 'ROOM 1: BASIC',
                image: 'https://placehold.co/600x400/FFF9C4/000000?text=Basic+Room',
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
                image: 'https://placehold.co/600x400/CFD8DC/000000?text=Fisheye',
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
                image: 'https://placehold.co/600x400/D1C4E9/000000?text=Elevator',
                duration: 20,
                price: 115000,
                planType: "Let's Film But Make It Fun",
                inclusions: [
                    '1-7 Person',
                    'All Soft File',
                    '2 Photo With Printed Special Frame',
                    'What You Get:',
                    'All Soft File',
                    '2 Photo Print/Strip'
                ]
            },
            {
                id: 4,
                room: 'ROOM 4: SPOTLIGHT ZOOM',
                image: 'https://placehold.co/600x400/B2EBF2/000000?text=Spotlight',
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
    });

    onMounted(() => {
        // TODO: Ganti data statis dengan panggilan API
        // fetchBranchDetails(props.branchName);
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
                    <h1 class="text-3xl font-bold">{{ branchData.name }}</h1>
                </div>
                <div class="flex-1"></div>
            </div>

            <!-- Loading & Error State -->
            <div v-if="isLoading" class="text-center py-16">
                <p>Loading packages...</p>
            </div>
            <div v-if="errorMessage" class="text-center py-16 bg-primary/20 text-primary border-2 border-primary p-4">
                {{ errorMessage }}
            </div>

            <!-- Daftar Paket per Ruangan -->
            <div v-else class="grid md:grid-cols-2 gap-8">
                <div v-for="pkg in branchData.packages" :key="pkg.id"
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
                            <li v-for="item in pkg.inclusions">{{ item }}</li>
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