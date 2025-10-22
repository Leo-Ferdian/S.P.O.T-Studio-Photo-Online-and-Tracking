<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#fff200] p-6">
    <!-- Kotak utama form -->
    <div class="bg-[hsl(0,95%,48%)] shadow-[8px_8px_0px_#000000] p-6 w-full max-w-md border-2 border-black">
      <h1 class="text-2xl font-bold text-center text-black mb-4 uppercase tracking-wide">
        Booking Jadwal Studio
      </h1>

      <!-- Step 1: Pilih Tanggal -->
      <div v-if="step === 1">
        <label class="block text-black font-semibold mb-2 text-center">Pilih Tanggal</label>
        <input
          type="date"
          v-model="selectedDate"
          :min="minDate"
          :max="maxDate"
          class="w-full border-2 border-black bg-white p-3 text-center focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          @click="nextStep"
          :disabled="!selectedDate"
          class="mt-5 w-full bg-[#ffffff] text-black font-bold py-2 border-2 border-black 
                 shadow-[8px_8px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] 
                 hover:shadow-[4px_4px_0px_#000000] active:translate-x-[5px] active:translate-y-[5px] 
                 active:shadow-none transition-transform duration-150 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <!-- Step 2: Pilih Jam -->
      <div v-else-if="step === 2">
        <label class="block text-black font-semibold mb-3 text-center">Pilih Jam</label>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="time in timeSlots"
            :key="time"
            @click="selectedTime = time"
            :class="[
              'py-2 px-3 text-center font-semibold border-2 border-black shadow-[5px_5px_0px_#000000] transition-transform',
              selectedTime === time
                ? 'bg-red-600 text-black'
                : 'bg-white hover:bg-yellow-100 text-black'
            ]"
          >
            {{ time }}
          </button>
        </div>

        <div class="flex justify-between mt-5">
          <button
            @click="prevStep"
            class="bg-[#ffffff] text-black font-bold py-2 px-4 border-2 border-black 
                   shadow-[8px_8px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] 
                   hover:shadow-[4px_4px_0px_#000000] transition-transform duration-150"
          >
            Back
          </button>
          <button
            @click="goToConfirmation"
            :disabled="!selectedTime"
            class="bg-[#ffffff] text-black font-bold py-2 px-4 border-2 border-black 
                   shadow-[8px_8px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] 
                   hover:shadow-[4px_4px_0px_#000000] active:translate-x-[5px] active:translate-y-[5px] 
                   active:shadow-none transition-transform duration-150 disabled:opacity-50"
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
for (let hour = 9; hour <= 17; hour++) {
  timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
}


// Step control
const nextStep = () => (step.value += 1);
const prevStep = () => (step.value -= 1);

// Pindah ke halaman konfirmasi
const goToConfirmation = () => {
  router.push({
    name: "konfirmasipesanan", // pastikan nama route sesuai router
    query: {
      tanggal: selectedDate.value,
      waktu: selectedTime.value,
    },
  });
};
</script>
