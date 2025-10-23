<script setup>
    import { ref, onMounted } from 'vue';
    import apiClient from '../../api/api';
    import feather from 'feather-icons';

    // State untuk form
    const packageName = ref('');
    const price = ref('');
    const selectedLocation = ref('');
    const selectedStatus = ref('Active'); // Default status
    const description = ref('');

    // State untuk data dinamis
    const locations = ref([]); // Untuk dropdown lokasi (akan berisi objek { id, name })
    const statuses = ['Active', 'Inactive']; // Opsi status

    const isLoadingLocations = ref(false);
    const errorMessage = ref(null);
    const successMessage = ref(null); // Pesan sukses setelah save

    // Fungsi untuk mengambil data lokasi (cabang) dari API
    const fetchLocations = async () => {
        isLoadingLocations.value = true;
        try {
            const response = await apiClient.get('/branches');
            // Simpan objek utuh (id dan name)
            locations.value = response.data.data.map(branch => ({ id: branch.id, name: branch.name }));
        } catch (error) {
            console.error("Failed to fetch locations:", error);
        } finally {
            isLoadingLocations.value = false;
        }
    };

    // Fungsi saat tombol Save ditekan
    const handleSubmit = async () => {
        errorMessage.value = null;
        successMessage.value = null; // Reset pesan sukses
        try {
            // Cari ID lokasi berdasarkan nama yang dipilih
            const selectedBranch = locations.value.find(loc => loc.name === selectedLocation.value);
            if (!selectedBranch) {
                throw new Error("Lokasi yang dipilih tidak valid.");
            }

            const packageData = {
                name: packageName.value,
                price: parseFloat(price.value),
                branch_id: selectedBranch.id, // Kirim ID lokasi
                // status: selectedStatus.value, // Sesuaikan dengan field di backend jika ada
                description: description.value,
            };

            // Ganti dengan API call POST /api/admin/packages
            // await apiClient.post('/admin/packages', packageData);
            console.log("Saving package:", packageData);
            successMessage.value = 'Data paket berhasil disimpan!'; // Tampilkan pesan sukses

            // Reset form setelah sukses
            packageName.value = '';
            price.value = '';
            selectedLocation.value = '';
            selectedStatus.value = 'Active';
            description.value = '';

        } catch (error) {
            errorMessage.value = error.message || "Gagal menyimpan data paket.";
            console.error("Save package error:", error);
        }
    };

    onMounted(() => {
        fetchLocations();
        // setTimeout(() => feather.replace(), 50); // Feather tidak digunakan di form ini
    });
</script>

<template>
    <div class="font-display">
        <h1 class="text-3xl font-bold mb-6">Package Management</h1>

        <!-- Form Tambah Paket -->
        <div class="bg-primary text-white p-6 border-2 border-outline shadow-solid">
            <h2 class="font-bold mb-6 text-xl">Add Package</h2>

            <form @submit.prevent="handleSubmit" class="space-y-4 font-sans">
                <!-- Pesan Sukses -->
                <div v-if="successMessage" class="bg-green-500/20 text-green-300 text-sm p-3 border-2 border-green-500">
                    {{ successMessage }}
                </div>
                <!-- Pesan Error -->
                <div v-if="errorMessage"
                    class="bg-yellow-400/20 text-yellow-200 text-sm p-3 border-2 border-yellow-400">
                    {{ errorMessage }}
                </div>

                <!-- Nama Paket -->
                <div>
                    <label for="package-name" class="font-display text-sm font-bold block mb-1">Name</label>
                    <input v-model="packageName" type="text" id="package-name" required
                        class="w-full bg-white text-black p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400">
                </div>

                <!-- Harga -->
                <div>
                    <label for="price" class="font-display text-sm font-bold block mb-1">Price</label>
                    <input v-model="price" type="number" id="price" required min="0" step="1000"
                        class="w-full bg-white text-black p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400">
                </div>

                <!-- Lokasi -->
                <div>
                    <label for="location" class="font-display text-sm font-bold block mb-1">Location</label>
                    <select v-model="selectedLocation" id="location" required
                        class="w-full bg-white text-black p-2 border-2 border-black appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400">
                        <option disabled value="">Select Location</option>
                        <option v-if="isLoadingLocations" value="" disabled>Loading locations...</option>
                        <!-- Menampilkan nama, tapi value yang disimpan adalah nama -->
                        <option v-for="loc in locations" :key="loc.id" :value="loc.name">{{ loc.name }}</option>
                    </select>
                </div>

                <!-- Status -->
                <div>
                    <label for="status" class="font-display text-sm font-bold block mb-1">Status</label>
                    <select v-model="selectedStatus" id="status" required
                        class="w-full bg-white text-black p-2 border-2 border-black appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400">
                        <option v-for="stat in statuses" :key="stat" :value="stat">{{ stat }}</option>
                    </select>
                </div>

                <!-- Deskripsi -->
                <div>
                    <label for="description" class="font-display text-sm font-bold block mb-1">Description</label>
                    <textarea v-model="description" id="description" rows="4"
                        class="w-full bg-white text-black p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"></textarea>
                </div>

                <!-- Tombol Save -->
                <div class="flex justify-end pt-4">
                    <button type="submit"
                        class="bg-background text-text-default font-bold py-2 px-8 border-3 border-outline shadow-solid hover:bg-yellow-300 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">
                        Save
                    </button>
                </div>
            </form>
        </div>

        <!-- TODO: Tambahkan tabel di sini untuk menampilkan daftar paket yang sudah ada -->
        <div class="mt-8 bg-primary text-white p-4 border-2 border-outline shadow-solid">
            <h2 class="font-bold mb-4 text-xl">Existing Packages</h2>
            <p class="font-sans text-center py-8">Tabel daftar paket akan ditampilkan di sini.</p>
        </div>

    </div>
</template>