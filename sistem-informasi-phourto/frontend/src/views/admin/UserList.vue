<script setup>
    import { ref, onMounted } from 'vue';
    import apiClient from '../../api/api';
    import feather from 'feather-icons';

    const users = ref([]);
    const isLoading = ref(true);
    const errorMessage = ref(null);

    // State untuk filter (sesuai desain)
    const selectedZone = ref('');
    const bookingCode = ref('');

    // Data contoh untuk filter Zone (jika diperlukan)
    const zones = ['Zone A', 'Zone B', 'Zone C'];

    // Fungsi untuk mengambil data pengguna dari API
    const fetchUsers = async () => {
        isLoading.value = true;
        errorMessage.value = null;
        try {
            // TODO: Tambahkan parameter filter jika backend mendukungnya
            const response = await apiClient.get('/admin/users');
            users.value = response.data.data.data; // Sesuaikan path jika perlu
        } catch (error) {
            errorMessage.value = "Gagal memuat data pengguna.";
            console.error("Fetch users error:", error);
        } finally {
            isLoading.value = false;
        }
    };

    onMounted(() => {
        fetchUsers();
        setTimeout(() => feather.replace(), 50);
    });
</script>

<template>
    <div class="font-display">
        <h1 class="text-3xl font-bold mb-6">Users Management</h1>

        <!-- Filter Section -->
        <div
            class="bg-primary text-white p-4 border-2 border-outline shadow-solid mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label for="zone" class="text-sm font-bold block mb-1">Zone</label>
                <select v-model="selectedZone" id="zone"
                    class="w-full bg-white text-black font-sans p-2 border-2 border-black appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option disabled value="">Select Zone</option>
                    <option v-for="zone in zones" :key="zone" :value="zone">{{ zone }}</option>
                </select>
            </div>
            <div>
                <label for="booking-code" class="text-sm font-bold block mb-1">Booking Code</label>
                <input v-model="bookingCode" type="text" id="booking-code"
                    class="w-full bg-white text-black font-sans p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400">
            </div>
            <div class="flex items-end">
                <button
                    class="w-full bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">
                    Save
                </button>
            </div>
        </div>

        <!-- Konten Utama (Placeholder sesuai desain Figma) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Kolom Kiri (Gallery Placeholder) -->
            <div class="bg-primary text-white p-4 border-2 border-outline shadow-solid">
                <h2 class="font-bold mb-4">Gallery</h2>
                <div class="grid grid-cols-3 gap-2">
                    <div v-for="i in 6" :key="i"
                        class="bg-white/30 aspect-square border-2 border-white flex items-center justify-center">
                        <i data-feather="image" class="w-8 h-8 text-white/50"></i>
                    </div>
                </div>
                <button
                    class="w-full mt-4 bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300">
                    Save
                </button>
            </div>

            <!-- Kolom Kanan (Setting Placeholder) -->
            <div class="bg-primary text-white p-4 border-2 border-outline shadow-solid">
                <h2 class="font-bold mb-4">Setting</h2>
                <!-- Placeholder untuk konten setting -->
                <p class="font-sans text-center py-16">Pengaturan akan muncul di sini.</p>
                <button
                    class="w-full mt-4 bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300">
                    Save
                </button>
            </div>
        </div>

        <!-- Menampilkan data user (contoh sederhana, bisa diganti tabel nanti) -->
        <div v-if="!isLoading && !errorMessage && users.length > 0"
            class="mt-6 bg-primary text-white p-4 border-2 border-outline shadow-solid font-sans">
            <h3 class="font-display font-bold mb-2">Daftar Pengguna (Data Awal):</h3>
            <ul>
                <li v-for="user in users" :key="user.id">{{ user.full_name }} - {{ user.email }}</li>
            </ul>
        </div>

    </div>
</template>