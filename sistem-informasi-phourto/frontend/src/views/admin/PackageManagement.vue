<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import apiClient from '@/api/api';
import feather from 'feather-icons';

// --- State Tampilan ---
const currentView = ref('list');
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

// --- State Data Global ---
const branches = ref([]);
const rooms = ref([]);
const packages = ref([]);
const filterBranchName = ref('');

const backToList = () => {
    currentView.value = 'list';
    nextTick(() => feather.replace());
};

watch(filterBranchName, () => {
    nextTick(() => feather.replace());
});

// --- State Form (Add & Edit) ---
const form = ref({
    id: null,
    name: '',
    price: 0,
    branch_id: '',
    room_id: '',
    status: 'Active',
    description: '',
    duration: '60 Menit',
    duration_in_minutes: 60,
    capacity: 2,
    inclusions: 'All files',
    price_type: 'per_package'
});

// --- Computed Properties ---
const packagesByBranch = computed(() => {
    return packages.value.reduce((acc, pkg) => {
        const branchName = pkg.branch_name || 'Uncategorized';
        if (!acc[branchName]) acc[branchName] = [];
        acc[branchName].push(pkg);
        return acc;
    }, {});
});

const filteredPackagesByBranch = computed(() => {
    if (!filterBranchName.value) return packagesByBranch.value;
    const filteredGroups = {};
    if (packagesByBranch.value[filterBranchName.value]) {
        filteredGroups[filterBranchName.value] = packagesByBranch.value[filterBranchName.value];
    }
    return filteredGroups;
});

const availableRooms = computed(() => {
    if (!form.value.branch_id) return [];
    return rooms.value.filter(room => room.branch_id === form.value.branch_id);
});

watch(() => form.value.branch_id, () => {
    form.value.room_id = '';
});

// --- Functions ---
const fetchBranches = async () => {
    try {
        const response = await apiClient.get('/branches', {
            params: { _: new Date().getTime(), limit: 999 }
        });
        const branchList = response.data.data.data || response.data.data;
        branches.value = branchList.map(branch => ({
            id: branch.branch_id,
            name: branch.branch_name
        }));
    } catch (error) {
        console.error("Failed to fetch branches:", error);
    }
};

const fetchPackages = async () => {
    isLoading.value = true;
    try {
        const response = await apiClient.get('/admin/packages', {
            params: { limit: 999, _: new Date().getTime() }
        });
        packages.value = response.data.data.data;
    } catch (error) {
        console.error("Failed to fetch packages:", error);
        errorMessage.value = "Gagal memuat daftar paket.";
    } finally {
        isLoading.value = false;
        nextTick(() => feather.replace());
    }
};

const fetchRooms = async () => {
    try {
        const response = await apiClient.get('/admin/rooms', {
            params: { _: new Date().getTime() }
        });
        rooms.value = response.data.data;
    } catch (error) {
        console.error("Failed to fetch rooms:", error);
    }
};

// --- PERBAIKAN UTAMA DI SINI: handleSubmit ---
const handleSubmit = async () => {
    errorMessage.value = null;
    successMessage.value = null;
    isSaving.value = true;

    try {
        if (!form.value.room_id) throw new Error("Ruangan harus dipilih.");

        // 1. Siapkan data paket (flat object)
        const rawPackageData = {
            room_id: form.value.room_id,
            package_name: form.value.name,
            capacity: parseInt(form.value.capacity), // Kirim sebagai ANGKA
            duration: form.value.duration,
            inclusions: form.value.inclusions,
            price: parseFloat(form.value.price),
            price_type: form.value.price_type,
            duration_in_minutes: parseInt(form.value.duration_in_minutes)
        };

        // 2. Bungkus dalam struktur yang diharapkan validator backend
        // Backend mengharapkan: { packageData: {...}, addons: [...] }
        const payload = {
            packageData: rawPackageData,
            addons: [] // Array kosong untuk saat ini
        };

        if (currentView.value === 'add') {
            await apiClient.post('/admin/packages', payload);
            successMessage.value = 'Data paket baru berhasil disimpan!';
        } else {
            await apiClient.put(`/admin/packages/${form.value.id}`, payload);
            successMessage.value = 'Data paket berhasil diperbarui!';
        }

        // Reset form
        form.value = {
            id: null, name: '', price: 0, branch_id: '', room_id: '',
            status: 'Active', description: '', duration: '60 Menit',
            duration_in_minutes: 60, capacity: 2, inclusions: 'All files',
            price_type: 'per_session'
        };

        await fetchPackages();
        currentView.value = 'list';
    } catch (error) {
        // Tampilkan pesan error detail dari backend jika ada
        const backendMsg = error.response?.data?.message;
        const validationErrors = error.response?.data?.errors;

        if (validationErrors && validationErrors.length > 0) {
            // Ambil pesan error pertama dari array validasi
            errorMessage.value = validationErrors[0].msg;
        } else {
            errorMessage.value = backendMsg || "Gagal menyimpan data paket.";
        }

        console.error("Save package error:", error);
    } finally {
        isSaving.value = false;
    }
};

const showEditForm = async (pkg) => {
    errorMessage.value = null;
    successMessage.value = null;
    currentView.value = 'loading';

    try {
        const response = await apiClient.get(`/admin/packages/${pkg.package_id}`, {
            params: { _: new Date().getTime() }
        });
        const data = response.data.data;

        form.value = {
            id: data.package_id,
            name: data.package_name,
            price: parseFloat(data.price),
            branch_id: data.branch_id,
            room_id: data.room_id,
            status: data.status || 'Active',
            description: data.description || '',
            duration: data.duration,
            duration_in_minutes: data.duration_in_minutes,
            capacity: parseInt(data.capacity) || 1, // Konversi string ke angka
            inclusions: data.inclusions,
            price_type: data.price_type
        };

        currentView.value = 'edit';
    } catch (error) {
        errorMessage.value = "Gagal memuat detail paket.";
        currentView.value = 'list';
    }
};

const handleDelete = async (pkg) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.package_name}"?`)) return;
    try {
        await apiClient.delete(`/admin/packages/${pkg.package_id}`);
        await fetchPackages();
    } catch (error) {
        alert(error.response?.data?.message || "Gagal menghapus paket.");
    }
};

const formatCurrency = (value) => {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return 'Rp 0,00';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2
    }).format(numberValue);
};

onMounted(() => {
    fetchBranches();
    fetchPackages();
    fetchRooms();
});
</script>

<template>
    <div>
        <!-- Form Add / Edit -->
        <div v-if="currentView === 'add' || currentView === 'edit'">
            <button @click="backToList"
                class="inline-flex items-center gap-2 font-bold mb-6 hover:text-primary transition-colors">
                <i data-feather="arrow-left" class="w-5 h-5"></i>
                Back to Package List
            </button>

            <div class="bg-primary text-white p-6 border-3 border-outline shadow-solid rounded-lg">
                <h2 class="font-bold mb-6 text-xl">
                    {{ currentView === 'add' ? 'Add New Package' : 'Edit Package' }}
                </h2>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div v-if="successMessage"
                        class="bg-green-500/20 text-green-300 text-sm p-3 border-2 border-green-500">
                        {{ successMessage }}
                    </div>
                    <div v-if="errorMessage" class="bg-red-800/50 text-white text-sm p-3 border-2 border-primary">
                        {{ errorMessage }}
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="package-name" class="text-sm font-bold block mb-1">Package Name</label>
                            <input v-model="form.name" type="text" id="package-name" required class="form-input">
                        </div>
                        <div>
                            <label for="price" class="text-sm font-bold block mb-1">Price (Rp)</label>
                            <input v-model="form.price" type="number" id="price" required min="0" step="1000"
                                class="form-input">
                        </div>
                        <div>
                            <label for="branch" class="text-sm font-bold block mb-1">Branch (Location)</label>
                            <select v-model="form.branch_id" id="branch" required class="form-input">
                                <option disabled value="">Select Branch</option>
                                <option v-for="loc in branches" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                            </select>
                        </div>
                        <div>
                            <label for="room" class="text-sm font-bold block mb-1">Room</label>
                            <select v-model="form.room_id" id="room" required :disabled="!form.branch_id"
                                class="form-input disabled:opacity-50">
                                <option disabled value="">{{ form.branch_id ? 'Select Room' : 'Select Branch First' }}
                                </option>
                                <option v-for="room in availableRooms" :key="room.room_id" :value="room.room_id">{{
                                    room.room_name_display }}</option>
                            </select>
                        </div>
                        <div>
                            <label for="duration_in_minutes" class="text-sm font-bold block mb-1">Duration (in
                                Minutes)</label>
                            <input v-model="form.duration_in_minutes" type="number" id="duration_in_minutes" required
                                min="5" class="form-input">
                        </div>
                        <div>
                            <label for="capacity" class="text-sm font-bold block mb-1">Capacity (Max Pax)</label>
                            <div class="flex items-center gap-2">
                                <input v-model="form.capacity" type="number" id="capacity" required min="1"
                                    class="form-input flex-1">
                                <span class="text-sm font-bold">Orang</span>
                            </div>
                        </div>
                        <div class="md:col-span-2">
                            <label for="duration" class="text-sm font-bold block mb-1">Duration (Display Text)</label>
                            <input v-model="form.duration" type="text" id="duration" placeholder="e.g. '20 Menit'"
                                required class="form-input">
                        </div>
                        <div class="md:col-span-2">
                            <label for="inclusions" class="text-sm font-bold block mb-1">Inclusions</label>
                            <textarea v-model="form.inclusions" id="inclusions" rows="3" class="form-input"
                                placeholder="e.g. All soft copy files..."></textarea>
                        </div>
                    </div>

                    <div class="flex justify-end pt-4 gap-4">
                        <button type="button" @click="backToList"
                            class="w-full md:w-auto bg-gray-700 text-white font-bold py-2 px-8 border-3 border-outline shadow-solid hover:bg-gray-800 active:shadow-none transition-all">
                            Cancel
                        </button>
                        <button type="submit" :disabled="isSaving"
                            class="w-full md:w-auto bg-background text-text-default font-bold py-2 px-8 border-3 border-outline shadow-solid hover:bg-yellow-300 active:shadow-none transition-all disabled:opacity-50">
                            <span v-if="isSaving">SAVING...</span>
                            <span v-else>Save Package</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Package List -->
        <div v-else>
            <h1 class="text-3xl font-bold mb-6">Package Management</h1>

            <div class="bg-primary text-white p-4 border-3 border-outline shadow-solid mb-6 rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label for="branch-filter" class="text-sm font-bold block mb-1">Filter by Branch</label>
                        <select v-model="filterBranchName" id="branch-filter" class="form-input">
                            <option value="">Show All Branches</option>
                            <option v-for="branch in branches" :key="branch.id" :value="branch.name">{{ branch.name }}
                            </option>
                        </select>
                    </div>
                    <div></div>
                    <div class="flex items-end">
                        <button @click="currentView = 'add'"
                            class="w-full bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300 transition-all">
                            + Add New Package
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h2 class="font-bold mb-4 text-xl">Existing Packages</h2>

                <div v-if="isLoading"
                    class="bg-primary text-white p-4 border-3 border-outline shadow-solid text-center">
                    Loading package list...
                </div>
                <div v-else-if="errorMessage && packages.length === 0"
                    class="bg-red-800/50 text-white p-4 border-3 border-outline shadow-solid text-center">
                    {{ errorMessage }}
                </div>

                <div v-else class="space-y-6">
                    <div v-if="Object.keys(filteredPackagesByBranch).length === 0"
                        class="bg-primary text-white p-4 border-3 border-outline shadow-solid text-center">
                        Belum ada paket yang dibuat (atau tidak ada yang cocok dengan filter).
                    </div>

                    <div v-for="(packageList, branchName) in filteredPackagesByBranch" :key="branchName">
                        <h3 class="text-2xl font-bold mb-2">{{ branchName }}</h3>
                        <div
                            class="bg-primary text-white p-4 border-3 border-outline shadow-solid overflow-x-auto rounded-lg">
                            <table class="w-full text-left text-sm">
                                <thead>
                                    <tr class="border-b-2 border-red-400">
                                        <th class="p-3">Package Name</th>
                                        <th class="p-3">Price</th>
                                        <th class="p-3">Duration (Text)</th>
                                        <th class="p-3">Capacity</th>
                                        <th class="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="pkg in packageList" :key="pkg.package_id"
                                        class="border-b border-red-800 hover:bg-red-700/50">
                                        <td class="p-3">{{ pkg.package_name }}</td>
                                        <td class="p-3">{{ formatCurrency(pkg.price) }}</td>
                                        <td class="p-3">{{ pkg.duration }}</td>
                                        <td class="p-3">{{ pkg.capacity }} Orang</td>
                                        <td class="p-3">
                                            <div class="flex space-x-2">
                                                <button @click="showEditForm(pkg)" class="hover:text-yellow-400"
                                                    title="Edit">
                                                    <i data-feather="edit" class="w-4 h-4"></i>
                                                </button>
                                                <button @click="handleDelete(pkg)" class="hover:text-red-400"
                                                    title="Delete">
                                                    <i data-feather="trash-2" class="w-4 h-4"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.form-input {
    @apply w-full bg-white text-black p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400;
}
</style>