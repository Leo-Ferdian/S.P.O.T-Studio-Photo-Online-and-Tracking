<template>
    <div>
        <h1 class="text-3xl font-display font-bold mb-6">Dashboard</h1>
        <!-- Statistik Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
                class="bg-primary text-white p-6 border-2 border-outline shadow-solid flex justify-between items-center">
                <div>
                    <p class="font-sans">Total Bookings</p>
                    <p class="text-4xl font-display font-bold">23</p>
                </div>
                <div class="bg-blue-500 p-3 rounded-lg"><i data-feather="calendar" class="w-8 h-8"></i></div>
            </div>
            <div
                class="bg-primary text-white p-6 border-2 border-outline shadow-solid flex justify-between items-center">
                <div>
                    <p class="font-sans">New Users</p>
                    <p class="text-4xl font-display font-bold">15</p>
                </div>
                <div class="bg-orange-500 p-3 rounded-lg"><i data-feather="users" class="w-8 h-8"></i></div>
            </div>
            <div
                class="bg-primary text-white p-6 border-2 border-outline shadow-solid flex justify-between items-center">
                <div>
                    <p class="font-sans">Total Revenue</p>
                    <p class="text-4xl font-display font-bold">Rp 500.000,00</p>
                </div>
                <div class="bg-green-500 p-3 rounded-lg"><i data-feather="bar-chart-2" class="w-8 h-8"></i></div>
            </div>
        </div>
        <!-- Chart -->
        <div class="bg-primary text-white p-6 border-2 border-outline shadow-solid mb-6">
            <h2 class="font-display font-bold mb-4">Monthly Revenue</h2>
            <!-- Placeholder for chart -->
            <div class="h-64 bg-red-600 flex items-center justify-center">Chart will be here</div>
        </div>
        <!-- Recent Bookings Table -->
        <div class="bg-primary text-white p-6 border-2 border-outline shadow-solid">
            <h2 class="font-display font-bold mb-4">Recent Bookings</h2>
            <table class="w-full font-sans text-left">
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
                    <tr>
                        <td class="p-2">Amanda</td>
                        <td class="p-2">Studio Sail</td>
                        <td class="p-2">01.10.2025</td>
                        <td class="p-2">Spotlight Room</td>
                        <td class="p-2 text-green-400">Delivered</td>
                    </tr>
                    <!-- ... more rows -->
                </tbody>
            </table>
        </div>
    </div>
</template>