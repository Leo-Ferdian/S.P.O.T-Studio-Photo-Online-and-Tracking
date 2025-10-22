<script setup>
    import { ref, onMounted, computed } from 'vue';
    import apiClient from '../../api/api';
    import feather from 'feather-icons';
    import Calendar from '../../components/common/Calendar.vue'; // Impor kalender
    import { useClickOutside } from '../../composables/useClickOutside'; // Impor composable

    const bookings = ref([]);
    const isLoading = ref(true);
    const errorMessage = ref(null);

    // State untuk filter
    const selectedDate = ref('');
    const selectedLocation = ref('');
    const selectedStatus = ref('');

    // State untuk menampilkan/menyembunyikan dropdown filter
    const isDateFilterOpen = ref(false);
    const isLocationFilterOpen = ref(false);
    const isStatusFilterOpen = ref(false);

    // Fungsi untuk mengambil data booking dari API
    const fetchBookings = async () => {
        isLoading.value = true;
        errorMessage.value = null;
        try {
            // TODO: Tambahkan parameter filter ke API call
            // Contoh: /api/admin/bookings?date=...&location=...&status=...
            const response = await apiClient.get('/admin/bookings');
            bookings.value = response.data.data.data; // Mengakses data di dalam properti 'data'
        } catch (error) {
            errorMessage.value = "Gagal memuat data booking.";
            console.error("Fetch bookings error:", error);
        } finally {
            isLoading.value = false;
        }
    };

    // Fungsi untuk memformat tanggal
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Data contoh untuk filter dropdown
    const locations = ['Studio Sail', 'Studio Marpoyan', 'Studio Panam'];
    const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    onMounted(() => {
        fetchBookings();
        setTimeout(() => feather.replace(), 50);
    });
</script>

<template>
    <div class="font-display">
        <h1 class="text-3xl font-bold mb-6">Booking Management</h1>

        <!-- Filter Section -->
        <div class="bg-primary text-white p-4 border-2 border-outline shadow-solid mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Date Filter -->
                <div class="relative">
                    <button @click="isDateFilterOpen = !isDateFilterOpen"
                        class="w-full bg-white text-black font-sans p-2 border-2 border-black flex justify-between items-center">
                        <span>{{ selectedDate || 'Date' }}</span>
                        <i data-feather="chevron-down"></i>
                    </button>
                    <!-- Dropdown Kalender (Placeholder) -->
                    <div v-if="isDateFilterOpen"
                        class="absolute top-full left-0 mt-1 w-full bg-white text-black border-2 border-black p-4 z-10">
                        <p class="font-sans text-center">Kalender akan muncul di sini.</p>
                        <button class="w-full mt-4 bg-yellow-400 font-bold p-2 border-2 border-black">Apply Now</button>
                    </div>
                </div>
                <!-- Location Filter -->
                <div class="relative">
                    <button @click="isLocationFilterOpen = !isLocationFilterOpen"
                        class="w-full bg-white text-black font-sans p-2 border-2 border-black flex justify-between items-center">
                        <span>{{ selectedLocation || 'Location' }}</span>
                        <i data-feather="chevron-down"></i>
                    </button>
                    <div v-if="isLocationFilterOpen"
                        class="absolute top-full left-0 mt-1 w-full bg-white text-black border-2 border-black p-2 z-10 font-sans space-y-1">
                        <p class="text-xs px-2 text-gray-400">Select Your Near Location</p>
                        <button v-for="loc in locations" :key="loc"
                            @click="selectedLocation = loc; isLocationFilterOpen = false"
                            class="w-full text-left p-2 hover:bg-yellow-200 block">{{ loc }}</button>
                        <button class="w-full mt-2 bg-yellow-400 font-bold p-2 border-2 border-black">Apply Now</button>
                    </div>
                </div>
                <!-- Status Filter -->
                <div class="relative">
                    <button @click="isStatusFilterOpen = !isStatusFilterOpen"
                        class="w-full bg-white text-black font-sans p-2 border-2 border-black flex justify-between items-center">
                        <span>{{ selectedStatus || 'Status' }}</span>
                        <i data-feather="chevron-down"></i>
                    </button>
                    <div v-if="isStatusFilterOpen"
                        class="absolute top-full left-0 mt-1 w-full bg-white text-black border-2 border-black p-2 z-10 font-sans space-y-1">
                        <p class="text-xs px-2 text-gray-400">Select Order Status</p>
                        <div class="grid grid-cols-2 gap-2">
                            <button v-for="stat in statuses" :key="stat" @click="selectedStatus = stat"
                                :class="selectedStatus === stat ? 'bg-yellow-400' : 'bg-gray-200'"
                                class="p-2 border-2 border-black">{{ stat }}</button>
                        </div>
                        <button class="w-full mt-2 bg-yellow-400 font-bold p-2 border-2 border-black">Apply Now</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabel Booking -->
        <div class="bg-primary text-white p-4 border-2 border-outline shadow-solid overflow-x-auto">
            <div v-if="isLoading" class="text-center p-8">Loading...</div>
            <div v-else-if="errorMessage" class="text-center p-8">{{ errorMessage }}</div>
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
                        <td class="p-3">{{ booking.id }}</td>
                        <td class="p-3">{{ booking.customer_name }}</td>
                        <td class="p-3">{{ booking.package_name }}</td>
                        <td class="p-3">{{ formatDate(booking.booking_time) }}</td>
                        <td class="p-3">
                            <span class="px-2 py-1 rounded-full text-xs" :class="{
                                'bg-green-500/20 text-green-300': booking.status === 'PAID' || booking.status === 'Confirmed',
                                'bg-yellow-500/20 text-yellow-300': booking.status === 'PENDING_PAYMENT',
                                'bg-gray-500/20 text-gray-300': booking.status === 'CANCELLED' || booking.status === 'Completed'
                            }">
                                {{ booking.status }}
                            </span>
                        </td>
                        <td class="p-3">
                            <div class="flex space-x-2">
                                <button class="hover:text-yellow-400"><i data-feather="edit"></i></button>
                                <button class="hover:text-red-400"><i data-feather="trash-2"></i></button>
                                <button class="hover:text-blue-400"><i data-feather="eye"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>