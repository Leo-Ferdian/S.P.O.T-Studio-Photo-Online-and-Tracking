<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-yellow-400 p-6">
    <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-red-600 mb-4">Booking Jadwal Studio</h1>

      <!-- Step 1: Pilih Tanggal -->
      <div v-if="step === 1">
        <label class="block text-gray-700 font-medium mb-2 text-center">Pilih Tanggal</label>
        <input
          type="date"
          v-model="selectedDate"
          :min="minDate"
          :max="maxDate"
          class="w-full border border-gray-300 rounded-lg p-3 text-center focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <button
          @click="nextStep"
          :disabled="!selectedDate"
          class="mt-5 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <!-- Step 2: Pilih Jam -->
      <div v-else-if="step === 2">
        <label class="block text-gray-700 font-medium mb-3 text-center">Pilih Jam</label>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="time in timeSlots"
            :key="time"
            @click="selectedTime = time"
            :class="[
              'py-2 px-3 rounded-lg border text-center transition',
              selectedTime === time
                ? 'bg-yellow-400 border-yellow-500 text-white font-bold'
                : 'bg-white hover:bg-yellow-100 border-gray-300 text-gray-700'
            ]"
          >
            {{ time }}
          </button>
        </div>
        <div class="flex justify-between mt-5">
          <button
            @click="prevStep"
            class="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition"
          >
            Back
          </button>
          <button
            @click="goToConfirmation"
            :disabled="!selectedTime"
            class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const step = ref(1);
const selectedDate = ref("");
const selectedTime = ref("");

// Range tanggal tahun 2025
const minDate = "2025-01-01";
const maxDate = "2025-12-31";

// Generate waktu dari 09.00 – 22.30
const timeSlots = [];
for (let hour = 9; hour <= 22; hour++) {
  timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
}

// Step control
const nextStep = () => (step.value += 1);
const prevStep = () => (step.value -= 1);

// Pindah ke halaman konfirmasi
const goToConfirmation = () => {
  router.push({
    name: "Konfirmasi",
    query: {
      date: selectedDate.value,
      time: selectedTime.value,
    },
  });
};
</script>

<style scoped>
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
