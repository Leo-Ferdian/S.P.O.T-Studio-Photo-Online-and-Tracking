<script setup>
    import { ref, onMounted, nextTick } from 'vue';
    import apiClient from '../../api/api';
    import feather from 'feather-icons';

    // --- State ---
    const bookings = ref([]);
    const isLoading = ref(true);
    const errorMessage = ref(null);

    // --- State untuk Filter ---
    const selectedDate = ref('');
    const selectedLocation = ref('');
    const selectedStatus = ref('');

    // --- State untuk Dropdown Filter ---
    const isDateFilterOpen = ref(false);
    const isLocationFilterOpen = ref(false);
    const isStatusFilterOpen = ref(false);

    // --- Data Statis untuk Filter (sesuai desain) ---
    // TODO: Ganti 'locations' dengan data dinamis dari API /branches
    const locations = ['Studio Sail', 'Studio Marpoyan', 'Studio Panam'];
    const statuses = ['Pending', 'Confirmed', 'Completed']; // Sesuai dropdown, beda dari tabel

    // --- Fungsi ---

    // Mengambil data booking dari API backend
    const fetchBookings = async () => {
        isLoading.value = true;
        errorMessage.value = null;
        try {
            // Panggil API yang sudah kita uji
            const response = await apiClient.get('/admin/bookings');

            // Data booking ada di dalam response.data.data.data (karena paginasi)
            bookings.value = response.data.data.data;

            if (bookings.value.length === 0) {
                errorMessage.value = "Belum ada data booking.";
            }
        } catch (error) {
            errorMessage.value = "Gagal memuat data booking.";
            console.error("Fetch bookings error:", error);
        } finally {
            isLoading.value = false;
            // Tunggu DOM diperbarui oleh Vue, baru panggil feather.replace()
            nextTick(() => {
                feather.replace();
            });
        }
    };

    // Format tanggal agar lebih mudah dibaca
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Menutup semua dropdown filter
    const closeAllFilters = () => {
        isDateFilterOpen.value = false;
        isLocationFilterOpen.value = false;
        isStatusFilterOpen.value = false;
    };

    // Meng-handle klik pada tombol filter
    const toggleFilter = (filter) => {
        if (filter === 'date') {
            isDateFilterOpen.value = !isDateFilterOpen.value;
            isLocationFilterOpen.value = false;
            isStatusFilterOpen.value = false;
        } else if (filter === 'location') {
            isLocationFilterOpen.value = !isLocationFilterOpen.value;
            isDateFilterOpen.value = false;
            isStatusFilterOpen.value = false;
        } else if (filter === 'status') {
            isStatusFilterOpen.value = !isStatusFilterOpen.value;
            isDateFilterOpen.value = false;
            isLocationFilterOpen.value = false;
        }
    };

    // --- Lifecycle Hook ---
    onMounted(() => {
        fetchBookings(); // Panggil API saat halaman dimuat
    });
</script>

<template>
    <div class="font-display">
        <h1 class="text-3xl font-bold mb-6">Booking Management</h1>

        <!-- Filter Section -->
        <div class="bg-primary text-white p-4 border-2 border-outline shadow-solid mb-6 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                <!-- Date Filter -->
                <div class="relative">
                    <button @click="toggleFilter('date')"
                        class="w-full bg-white text-black font-sans p-2 border-2 border-black flex justify-between items-center rounded">
                        <span>{{ selectedDate || 'Date' }}</span>
                        <i data-feather="chevron-down" class="w-5 h-5"></i>
                    </button>
                    <!-- Dropdown Kalender (Placeholder Sesuai Desain) -->
                    <div v-if="isDateFilterOpen"
                        class="absolute top-full left-0 mt-1 w-72 bg-white text-black border-2 border-black p-4 z-10 rounded-lg shadow-solid">
                        <p class="font-sans text-center">Implementasi kalender di sini</p>
                        <p class="text-xs text-center text-gray-500 my-2">You can choose multiple date</p>
                        <button @click="closeAllFilters"
                            class="w-full mt-4 bg-yellow-400 font-bold p-2 border-2 border-black rounded">Apply
                            Now</button>
                    </div>
                </div>

                <!-- Location Filter -->
                <div class="relative">
                    <button @click="toggleFilter('location')"
                        class="w-full bg-white text-black font-sans p-2 border-2 border-black flex justify-between items-center rounded">
                        <span>{{ selectedLocation || 'Location' }}</span>
                        <i data-feather="chevron-down" class="w-5 h-5"></i>
                    </button>
                    <div v-if="isLocationFilterOpen"
                        class="absolute top-full left-0 mt-1 w-full bg-white text-black border-2 border-black p-2 z-10 font-sans space-y-1 rounded-lg shadow-solid">
                        <p class="text-xs px-2 text-gray-400">Select Your Near Location</p>
                        <button v-for="loc in locations" :key="loc" @click="selectedLocation = loc; closeAllFilters()"
                            class="w-full text-left p-2 hover:bg-yellow-200 block rounded">{{ loc }}</button>
                        <button @click="closeAllFilters"
                            class="w-full mt-2 bg-yellow-400 font-bold p-2 border-2 border-black rounded">Apply
                            Now</button>
                    </div>
                </div>

                <!-- Status Filter -->
                <div class="relative">
                    <button @click="toggleFilter('status')"
                        class="w-full bg-white text-black font-sans p-2 border-2 border-black flex justify-between items-center rounded">
                        <span>{{ selectedStatus || 'Status' }}</span>
                        <i data-feather="chevron-down" class="w-5 h-5"></i>
                    </button>
                    <div v-if="isStatusFilterOpen"
                        class="absolute top-full left-0 mt-1 w-full bg-white text-black border-2 border-black p-2 z-10 font-sans space-y-1 rounded-lg shadow-solid">
                        <p class="text-xs px-2 text-gray-400">Select Order Status</p>
                        <div class="grid grid-cols-2 gap-2">
                            <button v-for="stat in statuses" :key="stat" @click="selectedStatus = stat"
                                :class="selectedStatus === stat ? 'bg-yellow-400' : 'bg-gray-200'"
                                class="p-2 border-2 border-black rounded">{{ stat }}</button>
                        </div>
                        <button @click="closeAllFilters"
                            class="w-full mt-2 bg-yellow-400 font-bold p-2 border-2 border-black rounded">Apply
                            Now</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabel Booking -->
        <div classLass="bg-primary text-white p-4 border-2 border-outline shadow-solid overflow-x-auto rounded-lg">
            <h2 class="font-display font-bold text-xl mb-4">Recent Bookings</h2>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center p-8">
                <p class="font-sans">Loading data bookings...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="errorMessage" class="text-center p-8 font-sans bg-red-800/50 rounded-lg">
                <p>{{ errorMessage }}</p>
            </div>

            <!-- Tabel Data -->
            <table v-else class="w-full font-sans text-left text-sm">
                <thead>
                    <tr class="border-b-2 border-red-400">
                        <th class="p-3">ID Booking</th>
                        <th class="p-3">Name</th>
                        <th class="p-3">Package</th>
                        <th class="p-3">Schedule</th>
                        <th class="p-3">Status</th>
                        <th class="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="booking in bookings" :key="booking.id"
                        class="border-b border-red-800 hover:bg-red-700/50">
                        <td class="p-3">PT-00{{ booking.id }}</td>
                        <td class="p-3">{{ booking.customer_name }}</td>
                        <td class="p-3">{{ booking.package_name }}</td>
                        <td class="p-3">{{ formatDate(booking.booking_time) }}</td>
                        <td class="p-3">
                            <!-- Status Label Dinamis -->
                            <span class="px-2 py-1 rounded-full text-xs font-bold" :class="{
                                'bg-green-500/30 text-green-300': booking.status === 'PAID' || booking.status === 'COMPLETED' || booking.status === 'Delivered',
                                'bg-yellow-500/30 text-yellow-300': booking.status === 'PENDING_PAYMENT' || booking.status === 'Pending',
                                'bg-gray-500/30 text-gray-300': booking.status === 'CANCELLED'
                            }">
                                {{ booking.status }}
                            </span>
                        </td>
                        <td class="p-3">
                            <div class="flex space-x-2">
                                <button class="hover:text-yellow-400" title="Edit"><i data-feather="edit"
                                        class="w-4 h-4"></i></button>
                                <button class="hover:text-red-400" title="Delete"><i data-feather="trash-2"
                                        class="w-4 h-4"></i></button>
                                <button class="hover:text-blue-400" title="View"><i data-feather="eye"
                                        class="w-4 h-4"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>