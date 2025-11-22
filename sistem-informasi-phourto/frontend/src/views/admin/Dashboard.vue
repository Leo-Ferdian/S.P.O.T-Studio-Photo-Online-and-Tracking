<script setup>
import { ref, onMounted } from 'vue'
import feather from 'feather-icons'
import apiClient from '../../api/api' // Import instance axios

// State reaktif
const totalBookings = ref(0)
const newUsers = ref(0)
const totalRevenue = ref(0)
const recentBookings = ref([])

// Ambil data dashboard
const fetchDashboardData = async () => {
    try {
        // Pastikan endpoint sesuai dengan backend Anda
        const statsResponse = await apiClient.get('/admin/dashboard/stats');
        const bookingsResponse = await apiClient.get('/admin/bookings/recent?limit=5');

        // Isi state dengan data dari backend
        totalBookings.value = statsResponse.data.data.totalBookings
        newUsers.value = statsResponse.data.data.newUsers
        totalRevenue.value = statsResponse.data.data.totalRevenue
        recentBookings.value = bookingsResponse.data.data
    } catch (error) {
        console.error('Gagal mengambil data dashboard:', error)
    } finally {
        // Render ulang ikon Feather setelah data dimuat
        feather.replace()
    }
}

// Jalankan ketika komponen dimuat
onMounted(() => {
    fetchDashboardData()
})

// Format rupiah
const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value)
}
</script>

<template>
    <div>
        <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

        <!-- Kartu Statistik -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
                class="bg-primary text-white p-6 border-3 border-outline shadow-solid flex justify-between items-center">
                <div>
                    <p>Total Bookings</p>
                    <p class="text-4xl font-bold">{{ totalBookings }}</p>
                </div>
                <div class="bg-blue-500 p-3 rounded-lg">
                    <i data-feather="calendar" class="w-8 h-8"></i>
                </div>
            </div>

            <div
                class="bg-primary text-white p-6 border-3 border-outline shadow-solid flex justify-between items-center">
                <div>
                    <p>New Users</p>
                    <p class="text-4xl font-bold">{{ newUsers }}</p>
                </div>
                <div class="bg-orange-500 p-3 rounded-lg">
                    <i data-feather="users" class="w-8 h-8"></i>
                </div>
            </div>

            <div
                class="bg-primary text-white p-6 border-3 border-outline shadow-solid flex justify-between items-center">
                <div>
                    <p>Total Revenue</p>
                    <p class="text-4xl font-bold">{{ formatCurrency(totalRevenue) }}</p>
                </div>
                <div class="bg-green-500 p-3 rounded-lg">
                    <i data-feather="bar-chart-2" class="w-8 h-8"></i>
                </div>
            </div>
        </div>

        <!-- Placeholder Chart -->
        <div class="bg-primary text-white p-6 border-3 border-outline shadow-solid mb-6">
            <h2 class="font-bold mb-4">Monthly Revenue</h2>
            <div class="h-64 bg-red-600 flex items-center justify-center">
                Chart will be here
            </div>
        </div>

        <!-- Tabel Recent Bookings -->
        <div class="bg-primary text-white p-6 border-3 border-outline shadow-solid">
            <h2 class="font-bold mb-4">Recent Bookings</h2>
            <table class="w-full text-left">
                <thead>
                    <tr class="border-b-2 border-red-400">
                        <th class="p-2">Name</th>
                        <th class="p-2">Location</th>
                        <th class="p-2">Date</th>
                        <th class="p-2">Package</th>
                        <th class="p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="recentBookings.length === 0">
                        <td colspan="5" class="p-2 text-center text-gray-400">
                            No recent bookings.
                        </td>
                    </tr>
                    <tr v-for="booking in recentBookings" :key="booking.id">
                        <td class="p-2">{{ booking.userName }}</td>
                        <td class="p-2">{{ booking.locationName }}</td>
                        <td class="p-2">
                            {{ new Date(booking.date).toLocaleDateString('id-ID') }}
                        </td>
                        <td class="p-2">{{ booking.packageName }}</td>
                        <td class="p-2" :class="booking.status === 'Delivered' ? 'text-green-400' : 'text-yellow-400'">
                            {{ booking.status }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
