<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import apiClient from '@/api/api';
import feather from 'feather-icons';
import Calendar from '@/components/common/Calendar.vue';
import RescheduleModal from '@/components/admin/RescheduleModal.vue';

// --- State Daftar (Master) ---
const bookings = ref([]);
const isLoadingList = ref(true);
const listErrorMessage = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = ref(10);

// --- State Detail ---
const selectedBooking = ref(null);
const isLoadingDetail = ref(false);
const detailErrorMessage = ref(null);

// --- State Form Edit Status ---
const editStatus = ref('');
const isUpdating = ref(false);
const updateSuccessMessage = ref(null);

// --- State Filter ---
const selectedBranchId = ref('');
const selectedStatus = ref('');
const selectedDate = ref('');

// --- State UI Dropdown ---
const isDateFilterOpen = ref(false);
const isLocationFilterOpen = ref(false);
const isStatusFilterOpen = ref(false);
const isRescheduleModalOpen = ref(false);

// --- Data Dropdown ---
const branches = ref([]);
const statuses = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PAID-DP', label: 'Paid DP' },
    { value: 'PAID-FULL', label: 'Paid Full' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'EXPIRED', label: 'Expired' }
];

// --- Fungsi Data ---
const fetchBookings = async (page = 1) => {
    isLoadingList.value = true;
    listErrorMessage.value = null;

    const params = {
        page,
        limit: limit.value,
        status: selectedStatus.value || undefined,
        branch_id: selectedBranchId.value || undefined,
        date: selectedDate.value || undefined,
        _: new Date().getTime()
    };

    try {
        const response = await apiClient.get('/admin/bookings', { params });
        bookings.value = response.data.data.data;
        totalPages.value = response.data.data.pagination.totalPages;
        currentPage.value = response.data.data.pagination.page;

        if (!bookings.value.length) {
            listErrorMessage.value = 'Tidak ada data booking yang cocok.';
        }
    } catch {
        listErrorMessage.value = 'Gagal memuat data booking.';
    } finally {
        isLoadingList.value = false;
        nextTick(() => feather.replace());
    }
};

// --- Detail Booking ---
const viewBookingDetails = async (bookingId) => {
    isLoadingDetail.value = true;
    detailErrorMessage.value = null;
    updateSuccessMessage.value = null;
    selectedBooking.value = null;

    try {
        const response = await apiClient.get(`/admin/bookings/${bookingId}`, {
            params: { _: new Date().getTime() }
        });

        if (response.data?.data) {
            selectedBooking.value = response.data.data;
            editStatus.value = selectedBooking.value.payment_status;
        } else {
            throw new Error('Data booking tidak ditemukan.');
        }
    } catch (error) {
        detailErrorMessage.value = error.message || 'Gagal memuat detail booking.';
        console.error('viewBookingDetails error:', error);
    } finally {
        isLoadingDetail.value = false;
        nextTick(() => feather.replace());
    }
};

const backToList = () => {
    selectedBooking.value = null;
    detailErrorMessage.value = null;
    updateSuccessMessage.value = null;
    nextTick(() => feather.replace());
};

// --- Update Status ---
const handleStatusUpdate = async () => {
    if (!selectedBooking.value) return;

    if (editStatus.value === selectedBooking.value.payment_status) {
        updateSuccessMessage.value = 'Status sudah sama, tidak ada yang diubah.';
        return;
    }

    isUpdating.value = true;
    updateSuccessMessage.value = null;
    detailErrorMessage.value = null;

    try {
        const response = await apiClient.put(
            `/admin/bookings/${selectedBooking.value.booking_id}/status`,
            { status: editStatus.value }
        );
        selectedBooking.value.payment_status = response.data.data.payment_status;
        updateSuccessMessage.value = 'Status booking berhasil diperbarui!';
        fetchBookings(currentPage.value);
    } catch (error) {
        detailErrorMessage.value = error.response?.data?.message || 'Gagal memperbarui status.';
    } finally {
        isUpdating.value = false;
    }
};

// --- Filter ---
const fetchBranches = async () => {
    try {
        const response = await apiClient.get('/branches');
        branches.value = response.data.data;
    } catch {
        console.error('Gagal mengambil data cabang');
    }
};

const applyFilters = () => {
    closeAllFilters();
    fetchBookings(1);
};

const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
        fetchBookings(newPage);
    }
};

const handleDateSelect = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    selectedDate.value = `${year}-${month}-${day}`;
    applyFilters();
};

const formattedSelectedDate = computed(() => {
    if (!selectedDate.value) return 'Date';
    const [year, month, day] = selectedDate.value.split('-');
    return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
});

const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
};

// --- UI Control ---
const closeAllFilters = () => {
    isDateFilterOpen.value = false;
    isLocationFilterOpen.value = false;
    isStatusFilterOpen.value = false;
};

const toggleFilter = (filter) => {
    isDateFilterOpen.value = filter === 'date' ? !isDateFilterOpen.value : false;
    isLocationFilterOpen.value = filter === 'location' ? !isLocationFilterOpen.value : false;
    isStatusFilterOpen.value = filter === 'status' ? !isStatusFilterOpen.value : false;
};
const openRescheduleModal = () => {
    isRescheduleModalOpen.value = true;
};
const handleRescheduleSuccess = () => {
    isRescheduleModalOpen.value = false;
    // Muat ulang data detail untuk melihat perubahan
    viewBookingDetails(selectedBooking.value.booking_id);
};
// --- Lifecycle ---
onMounted(() => {
    fetchBookings();
    fetchBranches();
});
</script>

<template>
    <div>
        <!-- Loading Detail -->
        <div v-if="isLoadingDetail" class="text-center p-10">
            <h2 class="text-2xl font-bold">Loading Booking Details...</h2>
        </div>

        <!-- Detail Error -->
        <div v-else-if="detailErrorMessage && !selectedBooking"
            class="text-center p-10 bg-red-800/50 rounded-lg text-white">
            <h2 class="text-2xl font-bold">Error</h2>
            <p class="mb-4">{{ detailErrorMessage }}</p>
            <button @click="backToList" class="pagination-btn">&lt; Back to List</button>
        </div>

        <!-- Detail Booking -->
        <div v-else-if="selectedBooking" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button @click="backToList"
                class="col-span-1 md:col-span-2 inline-flex items-center gap-2 font-bold mb-0 hover:text-primary transition-colors">
                <i data-feather="arrow-left" class="w-5 h-5"></i>
                Back to Booking List
            </button>

            <!-- Booking Info -->
            <div class="bg-primary text-white p-6 border-3 border-outline shadow-solid rounded-lg space-y-4">
                <h2 class="font-bold text-xl mb-4">
                    Booking Details (ID: {{ selectedBooking.booking_id.split('-')[0] }}...)
                </h2>
                <div>
                    <p class="text-sm text-white/70">Customer</p>
                    <p class="text-lg font-bold">{{ selectedBooking.customer_name }}</p>
                    <p>{{ selectedBooking.customer_email }} | {{ selectedBooking.customer_phone }}</p>
                </div>
                <div>
                    <p class="text-sm text-white/70">Schedule</p>
                    <p class="text-lg font-bold">{{ formatDate(selectedBooking.start_time) }}</p>
                </div>
                <div>
                    <p class="text-sm text-white/70">Package</p>
                    <p class="text-lg font-bold">{{ selectedBooking.package_name }} ({{ selectedBooking.branch_name }} -
                        {{ selectedBooking.room_name_display }})</p>
                </div>
                <div>
                    <p class="text-sm text-white/70">Total Price</p>
                    <p class="text-lg font-bold">{{ formatCurrency(selectedBooking.total_price) }} (Paid: {{
                        formatCurrency(selectedBooking.amount_paid) }})</p>
                </div>
            </div>

            <!-- Manage Booking -->
            <div class="bg-primary text-white p-6 border-3 border-outline shadow-solid rounded-lg">
                <h2 class="font-bold mb-4 text-xl">Manage Booking</h2>
                <form @submit.prevent="handleStatusUpdate" class="space-y-4">
                    <div>
                        <label for="status-select" class="font-bold text-sm">Update Status</label>
                        <select v-model="editStatus" id="status-select" class="form-input-setting">
                            <option v-for="stat in statuses" :key="stat.value" :value="stat.value">{{ stat.label }}
                            </option>
                        </select>
                    </div>
                    <div v-if="updateSuccessMessage" class="mt-4 text-center p-3 bg-green-500/30 text-green-300">{{
                        updateSuccessMessage }}</div>
                    <div v-if="detailErrorMessage" class="mt-4 text-center p-3 bg-red-800/50 text-white">{{
                        detailErrorMessage }}</div>
                    <button type="submit" :disabled="isUpdating"
                        class="w-full mt-4 bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300 disabled:opacity-50">
                        <span v-if="isUpdating">SAVING...</span>
                        <span v-else>Save Changes</span>
                    </button>
                </form>
                <hr class="border-red-400/50 my-6" />
                <div>
                    <h3 class="font-bold text-lg mb-2">Reschedule</h3>
                    <p class="text-sm text-white/70 mb-4">
                        Pindahkan booking ini ke tanggal atau ruangan lain.
                    </p>
                    <button @click="openRescheduleModal"
                        class="w-full bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300">
                        Reschedule Booking
                    </button>
                </div>
                <RescheduleModal v-if="isRescheduleModalOpen && selectedBooking" :booking="selectedBooking"
                    @close="isRescheduleModalOpen = false" @success="handleRescheduleSuccess" />
            </div>
        </div>

        <!-- Booking List -->
        <div v-else>
            <h1 class="text-3xl font-bold mb-6">Booking Management</h1>
            <!-- Filter Section -->
            <div class="bg-primary text-white p-4 border-3 border-outline shadow-solid mb-6 rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Date Filter -->
                    <div class="relative">
                        <button @click="toggleFilter('date')" class="filter-btn">
                            <span>{{ formattedSelectedDate }}</span>
                            <i data-feather="chevron-down" class="w-5 h-5"></i>
                        </button>
                        <div v-if="isDateFilterOpen" class="absolute top-full left-0 mt-1 z-10">
                            <Calendar @date-selected="handleDateSelect" />
                        </div>
                    </div>

                    <!-- Location Filter -->
                    <div class="relative">
                        <button @click="toggleFilter('location')" class="filter-btn">
                            <span>{{selectedBranchId ? branches.find(b => b.branch_id ===
                                selectedBranchId)?.branch_name : 'All Locations'}}</span>
                            <i data-feather="chevron-down" class="w-5 h-5"></i>
                        </button>
                        <div v-if="isLocationFilterOpen" class="dropdown-menu">
                            <p class="dropdown-header">Select Your Near Location</p>
                            <button @click="selectedBranchId = ''; applyFilters()" class="dropdown-item font-bold">All
                                Locations</button>
                            <button v-for="loc in branches" :key="loc.branch_id"
                                @click="selectedBranchId = loc.branch_id; applyFilters()" class="dropdown-item">{{
                                    loc.branch_name }}</button>
                        </div>
                    </div>

                    <!-- Status Filter -->
                    <div class="relative">
                        <button @click="toggleFilter('status')" class="filter-btn">
                            <span>{{selectedStatus ? statuses
                                .find(s => s.value === selectedStatus)?.label : 'All Status'}}</span>
                            <i data-feather="chevron-down" class="w-5 h-5"></i>
                        </button>
                        <div v-if="isStatusFilterOpen" class="dropdown-menu">
                            <p class="dropdown-header">Select Order Status</p>
                            <div class="grid grid-cols-2 gap-2">
                                <button @click="selectedStatus = ''; applyFilters()"
                                    :class="!selectedStatus ? 'bg-yellow-400' : 'bg-gray-200'"
                                    class="dropdown-btn-grid">All Statuses</button>
                                <button v-for="stat in statuses" :key="stat.value"
                                    @click="selectedStatus = stat.value; applyFilters()"
                                    :class="selectedStatus === stat.value ? 'bg-yellow-400' : 'bg-gray-200'"
                                    class="dropdown-btn-grid">{{ stat.label }}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Table Section -->
            <div class="bg-primary text-white p-4 border-3 border-outline shadow-solid overflow-x-auto rounded-lg">
                <h2 class="font-bold text-xl mb-4">All Bookings</h2>

                <div v-if="isLoadingList" class="text-center p-8">Loading...</div>
                <div v-else-if="listErrorMessage" class="text-center p-8 bg-red-800/50 rounded-lg">{{ listErrorMessage
                }}</div>

                <table v-else class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b-2 border-red-400">
                            <th class="p-3">ID Booking</th>
                            <th class="p-3">Name</th>
                            <th class="p-3">Package</th>
                            <th class="p-3">Lokasi</th>
                            <th class="p-3">Schedule</th>
                            <th class="p-3">Status</th>
                            <th class="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="booking in bookings" :key="booking.booking_id"
                            class="border-b border-red-800 hover:bg-red-700/50">
                            <td class="p-3">{{ booking.booking_id.split('-')[0] }}...</td>
                            <td class="p-3">{{ booking.customer_name }}</td>
                            <td class="p-3">{{ booking.package_name }}</td>
                            <td class="p-3">{{ booking.branch_name }}</td>
                            <td class="p-3">{{ formatDate(booking.start_time) }}</td>
                            <td class="p-3">
                                <span class="px-2 py-1 rounded-full text-xs font-bold" :class="{
                                    'bg-green-500/30 text-green-300': ['PAID-FULL', 'DELIVERED', 'COMPLETED'].includes(booking.payment_status),
                                    'bg-blue-500/30 text-blue-300': booking.payment_status === 'PAID-DP',
                                    'bg-yellow-500/30 text-yellow-300': booking.payment_status === 'PENDING',
                                    'bg-gray-500/30 text-gray-300': ['CANCELLED', 'EXPIRED'].includes(booking.payment_status)
                                }">
                                    {{ booking.payment_status }}
                                </span>
                            </td>
                            <td class="p-3">
                                <div class="flex space-x-2">
                                    <button class="hover:text-yellow-400" title="Edit"><i data-feather="edit"
                                            class="w-4 h-4"></i></button>
                                    <button class="hover:text-red-400" title="Delete"><i data-feather="trash-2"
                                            class="w-4 h-4"></i></button>
                                    <button @click="viewBookingDetails(booking.booking_id)" class="hover:text-blue-400"
                                        title="View">
                                        <i data-feather="eye" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-6">
                    <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                        class="pagination-btn">&lt; Prev</button>
                    <span class="text-white">Page {{ currentPage }} of {{ totalPages }}</span>
                    <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                        class="pagination-btn">Next &gt;</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.filter-btn {
    @apply w-full bg-white text-black p-2 border-2 border-black flex justify-between items-center rounded;
}

.dropdown-menu {
    @apply absolute top-full left-0 mt-1 w-full bg-white text-black border-2 border-black p-2 z-10 space-y-1 rounded-lg shadow-solid;
}

.dropdown-header {
    @apply text-xs px-2 text-gray-400;
}

.dropdown-item {
    @apply w-full text-left p-2 hover:bg-yellow-200 block rounded;
}

.dropdown-btn-grid {
    @apply p-2 border-2 border-black rounded;
}

.pagination-btn {
    @apply bg-white text-black px-4 py-1 border-2 border-black rounded shadow-solid hover:enabled:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed;
}

.form-input-setting {
    @apply w-full bg-white text-black p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400;
}
</style>
