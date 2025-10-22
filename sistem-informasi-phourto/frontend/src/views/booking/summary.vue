<script setup>
import { ref, onMounted, computed } from 'vue';
import feather from 'feather-icons';

// Data statis sebagai contoh. Idealnya, ini akan datang dari state management (Pinia)
// atau sebagai props dari halaman sebelumnya.
const bookingDetails = ref({
    studio: 'Phourto Studio CH 1',
    room: 'Room 4 : Spotlight',
    date: 'Rabu, 17 September 2025',
    time: '18.30 - 19.00',
    duration: 30,
    price: 179000,
});

const additionalPerson = ref({
    count: 0,
    price: 15000,
});

const totalAddOn = computed(() => {
    return additionalPerson.value.count * additionalPerson.value.price;
});

const grandTotal = computed(() => {
    return bookingDetails.value.price + totalAddOn.value;
});

const incrementPerson = () => {
    additionalPerson.value.count++;
};

const decrementPerson = () => {
    if (additionalPerson.value.count > 0) {
        additionalPerson.value.count--;
    }
};

onMounted(() => {
    feather.replace();
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
                    <h1 class="text-3xl font-bold">SUMMARY</h1>
                </div>
                <div class="flex-1"></div>
            </div>

            <!-- Konten Utama -->
            <div class="grid md:grid-cols-2 gap-8 items-start">
                <!-- Kolom Kiri: Detail Booking -->
                <div class="space-y-4">
                    <h2 class="text-2xl font-bold">{{ bookingDetails.studio }}<br>{{ bookingDetails.room }}</h2>

                    <!-- Card Jadwal -->
                    <div class="bg-white border-3 border-outline p-4 flex justify-between items-start">
                        <div class="font-sans">
                            <p class="font-bold text-lg">{{ bookingDetails.date }}</p>
                            <p class="font-bold text-lg">{{ bookingDetails.time }}</p>
                            <p class="text-sm text-gray-600">WIB / Jakarta</p>
                        </div>
                        <button class="text-gray-500 hover:text-primary">
                            <i data-feather="edit-2" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <!-- Card Paket -->
                    <div class="bg-white border-3 border-outline p-4 flex justify-between items-start">
                        <div class="font-sans">
                            <p class="font-bold text-lg">{{ bookingDetails.duration }} Menit</p>
                            <p class="text-sm text-gray-600">{{ bookingDetails.studio }} {{ bookingDetails.room }}</p>
                            <p class="font-bold text-lg mt-2">Rp {{ bookingDetails.price.toLocaleString('id-ID') }}</p>
                        </div>
                        <button class="text-gray-500 hover:text-primary">
                            <i data-feather="edit-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>

                <!-- Kolom Kanan: Add-ons -->
                <div class="space-y-4">
                    <!-- Card Tambahan Orang -->
                    <div class="bg-primary text-white p-4 border-3 border-outline shadow-solid font-sans">
                        <h3 class="font-display font-bold text-lg">-TAMBAHAN ORANG</h3>
                        <p class="text-xs mb-3">Harga penambahan orang (include 1 cetakan/orang)</p>

                        <div class="bg-black text-white p-2 flex justify-between items-center border-2 border-white">
                            <span class="text-lg">Rp {{ additionalPerson.price.toLocaleString('id-ID') }}</span>
                            <div class="flex items-center space-x-3">
                                <button @click="decrementPerson"
                                    class="w-6 h-6 flex items-center justify-center bg-white text-black font-bold text-xl">-</button>
                                <span>{{ additionalPerson.count }}</span>
                                <button @click="incrementPerson"
                                    class="w-6 h-6 flex items-center justify-center bg-white text-black font-bold text-xl">+</button>
                            </div>
                        </div>
                    </div>

                    <!-- Anda bisa menambahkan card Add-ons lain di sini -->
                </div>
            </div>

            <!-- Tombol Verification di bawah -->
            <div class="text-center mt-12">
                <button
                    class="bg-primary text-text-default font-bold text-lg py-4 px-16 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                    Verification
                </button>
                <p class="font-sans text-center mt-4">Total: <span class="font-bold">Rp {{
                    grandTotal.toLocaleString('id-ID') }}</span></p>
            </div>

        </main>
    </div>
</template>