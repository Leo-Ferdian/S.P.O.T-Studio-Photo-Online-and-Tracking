<script setup>
import { ref, onMounted, nextTick } from 'vue';
import apiClient from '../../api/api';
import feather from 'feather-icons';

// --- Props & Emits ---
const props = defineProps({
    booking: {
        type: Object,
        required: true
    }
});
const emit = defineEmits(['close', 'success']);

// --- State Form ---
const newStartTime = ref(props.booking.start_time.split('T')[0]); // Ambil tanggalnya saja
const newTime = ref('10:00'); // Default time
const newRoomId = ref(props.booking.room_id);
const reason = ref('');

// --- State UI ---
const isLoading = ref(false);
const errorMessage = ref(null);
const rooms = ref([]); // Untuk dropdown ruangan

// --- Fungsi ---
const fetchRooms = async () => {
    // Kita perlu API untuk mengambil *semua* ruangan dari *semua* cabang
    // Asumsi: GET /admin/all-rooms
    // Untuk saat ini, kita gunakan data dummy
    rooms.value = [
        { room_id: props.booking.room_id, room_name: `Ruangan Saat Ini (${props.booking.room_name_display})` },
        // { room_id: 'UUID-KAMAR-LAIN-1', room_name: 'Studio Panam - Kamar A' },
        // { room_id: 'UUID-KAMAR-LAIN-2', room_name: 'Studio Sail - Kamar B' },
    ];
};

const handleSubmit = async () => {
    isLoading.value = true;
    errorMessage.value = null;

    // Gabungkan tanggal dan waktu menjadi format ISO
    const combinedStartTime = `${newStartTime.value}T${newTime.value}:00.000Z`;

    const payload = {
        newStartTime: combinedStartTime,
        newRoomId: newRoomId.value,
        reason: reason.value
    };

    try {
        await apiClient.put(
            `/admin/bookings/${props.booking.booking_id}/reschedule`,
            payload
        );
        // Jika sukses, kirim event 'success' ke parent (BookingList.vue)
        emit('success');
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Gagal melakukan reschedule.';
        console.error("Reschedule error:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchRooms();
    nextTick(() => feather.replace());
});
</script>

<template>
    <div @click.self="emit('close')" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

        <div class="bg-primary text-white p-6 border-3 border-outline shadow-solid rounded-lg w-full max-w-md">

            <div class="flex justify-between items-center mb-4">
                <h2 class="font-bold text-xl">Reschedule Booking</h2>
                <button @click="emit('close')" class="hover:text-red-400">
                    <i data-feather="x" class="w-6 h-6"></i>
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">

                <div v-if="errorMessage" class="p-3 bg-red-800/50 text-white">
                    {{ errorMessage }}
                </div>

                <div>
                    <label for="reason" class="form-label">Alasan Reschedule</label>
                    <input v-model="reason" type="text" id="reason" class="form-input" required>
                </div>

                <div>
                    <label for="room" class="form-label">Pilih Ruangan Baru</label>
                    <select v-model="newRoomId" id="room" class="form-input">
                        <option v-for="room in rooms" :key="room.room_id" :value="room.room_id">
                            {{ room.room_name }}
                        </option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="date" class="form-label">Tanggal Baru</label>
                        <input v-model="newStartTime" type="date" id="date" class="form-input" required>
                    </div>
                    <div>
                        <label for="time" class="form-label">Waktu Baru</label>
                        <input v-model="newTime" type="time" id="time" class="form-input" step="1800" required>
                    </div>
                </div>

                <p class="text-xs text-white/70">
                    Peringatan: Sistem ini **tidak** memeriksa ketersediaan slot.
                    Pastikan Anda memilih slot yang kosong secara manual.
                </p>

                <div class="flex justify-end space-x-4 pt-4">
                    <button type="button" @click="emit('close')"
                        class="bg-gray-700 text-white font-bold py-2 px-4 border-3 border-outline shadow-solid hover:bg-gray-800">
                        Cancel
                    </button>
                    <button type="submit" :disabled="isLoading"
                        class="bg-background text-text-default font-bold py-2 px-4 border-3 border-outline shadow-solid hover:bg-yellow-300 disabled:opacity-50">
                        <span v-if="isLoading">SAVING...</span>
                        <span v-else>Confirm Reschedule</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
/* Style input yang konsisten untuk modal ini */
.form-label {
    @apply font-bold text-sm block mb-1;
}

.form-input {
    @apply w-full bg-white text-black p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400;
}
</style>