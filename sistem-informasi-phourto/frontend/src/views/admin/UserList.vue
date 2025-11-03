<script setup>
import { ref, onMounted, nextTick } from 'vue'
import apiClient from '../../api/api'
import feather from 'feather-icons'

// ========================
// STATE DAFTAR PENGGUNA
// ========================
const users = ref([])
const isLoadingList = ref(true)
const listErrorMessage = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const limit = ref(10)
const searchQuery = ref('')

// ========================
// STATE DETAIL PENGGUNA
// ========================
const selectedUser = ref(null)
const isLoadingDetail = ref(false)
const detailErrorMessage = ref(null)

// ========================
// STATE FORM SETTING
// ========================
const editForm = ref({
    full_name: '',
    email: '',
    phone_number: '',
    role: ''
})
const isUpdating = ref(false)
const successMessage = ref(null)

// ========================
// FUNGSI: Ambil Daftar Pengguna
// ========================
const fetchUsers = async (page = 1) => {
    isLoadingList.value = true
    listErrorMessage.value = null

    const params = {
        page,
        limit: limit.value,
        search: searchQuery.value || undefined,
        _: new Date().getTime() // cache buster
    }

    try {
        const response = await apiClient.get('/admin/users', { params })
        users.value = response.data.data.data
        totalPages.value = response.data.data.pagination.totalPages
        currentPage.value = response.data.data.pagination.page

        if (users.value.length === 0) {
            listErrorMessage.value = 'Tidak ada pengguna yang ditemukan.'
        }
    } catch (error) {
        console.error('Fetch users error:', error)
        listErrorMessage.value = 'Gagal memuat data pengguna.'
    } finally {
        isLoadingList.value = false
        nextTick(() => feather.replace())
    }
}

// ========================
// FUNGSI: Lihat Detail Pengguna
// ========================
const viewUserDetails = async (userId) => {
    isLoadingDetail.value = true
    detailErrorMessage.value = null
    successMessage.value = null
    selectedUser.value = null

    try {
        const response = await apiClient.get(`/admin/users/${userId}`)
        selectedUser.value = response.data.data

        // Isi form edit dengan data pengguna
        editForm.value = {
            full_name: selectedUser.value.full_name,
            email: selectedUser.value.email,
            phone_number: selectedUser.value.phone_number,
            role: selectedUser.value.role
        }
    } catch (error) {
        console.error('Fetch detail error:', error)
        detailErrorMessage.value = 'Gagal memuat detail pengguna.'
    } finally {
        isLoadingDetail.value = false
        nextTick(() => feather.replace())
    }
}

// ========================
// FUNGSI: Kembali ke Daftar
// ========================
const backToList = () => {
    selectedUser.value = null
    detailErrorMessage.value = null
    successMessage.value = null
    nextTick(() => feather.replace())
}

// ========================
// FUNGSI: Update Pengaturan
// ========================
const handleSettingsUpdate = async () => {
    if (!selectedUser.value) return

    const profileDataChanged =
        editForm.value.full_name !== selectedUser.value.full_name ||
        editForm.value.email !== selectedUser.value.email ||
        editForm.value.phone_number !== selectedUser.value.phone_number

    const roleChanged = editForm.value.role !== selectedUser.value.role

    if (!profileDataChanged && !roleChanged) {
        successMessage.value = 'Tidak ada perubahan yang disimpan.'
        return
    }

    isUpdating.value = true
    successMessage.value = null
    detailErrorMessage.value = null

    try {
        const updatePromises = []

        if (profileDataChanged) {
            const profilePayload = {
                full_name: editForm.value.full_name,
                email: editForm.value.email,
                phone_number: editForm.value.phone_number
            }
            updatePromises.push(
                apiClient.put(`/admin/users/${selectedUser.value.user_id}/profile`, profilePayload)
            )
        }

        if (roleChanged) {
            updatePromises.push(
                apiClient.put(`/admin/users/${selectedUser.value.user_id}/role`, { role: editForm.value.role })
            )
        }

        await Promise.all(updatePromises)

        // Update data lokal
        Object.assign(selectedUser.value, editForm.value)
        successMessage.value = 'Data pengguna berhasil diperbarui!'
        fetchUsers(currentPage.value) // refresh daftar

    } catch (error) {
        console.error('Update settings error:', error)
        detailErrorMessage.value = error.response?.data?.message || 'Gagal memperbarui data.'
    } finally {
        isUpdating.value = false
    }
}

// ========================
// FUNGSI: Pencarian & Pagination
// ========================
const applySearch = () => fetchUsers(1)
const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
        fetchUsers(newPage)
    }
}

onMounted(() => fetchUsers())
</script>

<template>
    <div>
        <!-- ===================== -->
        <!-- DAFTAR PENGGUNA -->
        <!-- ===================== -->
        <div v-if="!selectedUser">
            <h1 class="text-3xl font-bold mb-6">Users Management</h1>

            <!-- SEARCH -->
            <div
                class="bg-primary text-white p-4 border-3 border-outline shadow-solid mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                    <label for="search-query" class="text-sm font-bold block mb-1">Search by Name or Email</label>
                    <input v-model="searchQuery" @keyup.enter="applySearch" type="text" id="search-query"
                        class="w-full bg-white text-black p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div class="flex items-end">
                    <button @click="applySearch"
                        class="w-full bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">
                        Search
                    </button>
                </div>
            </div>

            <!-- TABEL -->
            <div class="bg-primary text-white p-4 border-3 border-outline shadow-solid overflow-x-auto rounded-lg">
                <h2 class="font-bold text-xl mb-4">User List</h2>

                <div v-if="isLoadingList" class="text-center p-8">
                    <p>Loading data pengguna...</p>
                </div>

                <div v-else-if="listErrorMessage" class="text-center p-8 bg-red-800/50 rounded-lg">
                    <p>{{ listErrorMessage }}</p>
                </div>

                <table v-else class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b-2 border-red-400">
                            <th class="p-3">User ID</th>
                            <th class="p-3">Full Name</th>
                            <th class="p-3">Email</th>
                            <th class="p-3">Phone</th>
                            <th class="p-3">Role</th>
                            <th class="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.user_id"
                            class="border-b border-red-800 hover:bg-red-700/50">
                            <td class="p-3">{{ user.user_id.split('-')[0] }}...</td>
                            <td class="p-3">{{ user.full_name }}</td>
                            <td class="p-3">{{ user.email }}</td>
                            <td class="p-3">{{ user.phone_number || '-' }}</td>
                            <td class="p-3">{{ user.role }}</td>
                            <td class="p-3">
                                <button @click="viewUserDetails(user.user_id)" class="hover:text-blue-400"
                                    title="View Details">
                                    <i data-feather="eye" class="w-4 h-4"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- PAGINATION -->
                <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-6">
                    <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="pagination-btn">
                        &lt; Prev
                    </button>
                    <span class="text-white">Page {{ currentPage }} of {{ totalPages }}</span>
                    <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                        class="pagination-btn">
                        Next &gt;
                    </button>
                </div>
            </div>
        </div>

        <!-- ===================== -->
        <!-- DETAIL PENGGUNA -->
        <!-- ===================== -->
        <div v-else>
            <button @click="backToList"
                class="inline-flex items-center gap-2 font-bold mb-6 hover:text-primary transition-colors">
                <i data-feather="arrow-left" class="w-5 h-5"></i>
                Back to User List
            </button>

            <div v-if="isLoadingDetail">...</div>
            <div v-else-if="!selectedUser && detailErrorMessage">...</div>

            <div v-else-if="selectedUser" class="grid grid-cols-1 gap-6">
                <div class="bg-primary text-white p-4 border-3 border-outline shadow-solid max-w-lg mx-auto w-full">
                    <h2 class="font-bold mb-4 text-xl">Setting for {{ selectedUser.full_name }}</h2>

                    <form @submit.prevent="handleSettingsUpdate" class="space-y-4">
                        <div>
                            <label for="full_name" class="font-bold text-sm">Full Name</label>
                            <input v-model="editForm.full_name" type="text" id="full_name" class="form-input-setting"
                                required />
                        </div>
                        <div>
                            <label for="email" class="font-bold text-sm">Email</label>
                            <input v-model="editForm.email" type="email" id="email" class="form-input-setting"
                                required />
                        </div>
                        <div>
                            <label for="phone_number" class="font-bold text-sm">Phone Number</label>
                            <input v-model="editForm.phone_number" type="tel" id="phone_number"
                                class="form-input-setting" required />
                        </div>

                        <hr class="border-red-400/50 my-4" />

                        <div>
                            <label for="role-select" class="font-bold text-sm">User Role</label>
                            <select v-model="editForm.role" id="role-select" class="form-input-setting">
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div v-if="successMessage" class="mt-4 text-center p-3 bg-green-500/30 text-green-300">
                            {{ successMessage }}
                        </div>
                        <div v-if="detailErrorMessage" class="mt-4 text-center p-3 bg-red-800/50 text-white">
                            {{ detailErrorMessage }}
                        </div>

                        <button type="submit" :disabled="isUpdating"
                            class="w-full mt-4 bg-background text-text-default font-bold py-2 border-3 border-outline shadow-solid hover:bg-yellow-300 disabled:opacity-50">
                            <span v-if="isUpdating">SAVING...</span>
                            <span v-else>Save Changes</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.pagination-btn {
    @apply bg-white text-black px-4 py-1 border-2 border-black rounded shadow-solid;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
    @apply hover:enabled:bg-yellow-400;
}

.form-input-setting {
    @apply w-full bg-white text-black p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400;
}
</style>
