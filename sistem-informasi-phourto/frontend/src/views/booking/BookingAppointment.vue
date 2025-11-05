<script setup>
import { ref, onMounted, computed } from 'vue'
import feather from 'feather-icons'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../../stores/booking.stores.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const bookingStore = useBookingStore()

// --- State dari Store ---
const {
  selectedBranch,
  selectedPackage,
  availability,
  isLoading
} = storeToRefs(bookingStore)

// --- State Kalender Lokal ---
const currentDate = ref(new Date())
const selectedDate = ref(null)
const today = new Date()
today.setHours(0, 0, 0, 0)

const currentMonthName = computed(() =>
  currentDate.value.toLocaleString('id-ID', { month: 'long' })
)
const currentYear = computed(() => currentDate.value.getFullYear())

const startOfMonth = computed(
  () => new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
)
const endOfMonth = computed(
  () => new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
)
const daysInMonth = computed(() => endOfMonth.value.getDate())
const firstDayIndex = computed(() => startOfMonth.value.getDay())

const calendarDays = computed(() => {
  const days = []
  let startDayIndex = firstDayIndex.value === 0 ? 6 : firstDayIndex.value - 1
  for (let i = 0; i < startDayIndex; i++) {
    days.push(null)
  }
  for (let day = 1; day <= daysInMonth.value; day++) {
    days.push(new Date(currentYear.value, currentDate.value.getMonth(), day))
  }
  return days
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1))
  selectedDate.value = null
  bookingStore.availability.slots = []
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1))
  selectedDate.value = null
  bookingStore.availability.slots = []
}

const goToToday = () => {
  currentDate.value = new Date()
  handleDateSelect(today)
}

const isToday = (day) => day && day.toDateString() === today.toDateString()
const isSelected = (day) =>
  day && selectedDate.value && day.toDateString() === selectedDate.value.toDateString()
const isPast = (day) => day && day < today

// --- State Slot Waktu ---
const selectedTime = ref(null)

// --- Pilih Tanggal ---
const handleDateSelect = async (day) => {
  if (!day || isPast(day)) return;
  selectedDate.value = day;
  selectedTime.value = null;

  const packageId = selectedPackage.value?.package_id;

  if (!packageId) {
    console.error("Gagal memilih tanggal: packageId tidak ditemukan.");
    return;
  }

  // --- PERBAIKAN TIMEZONE ---
  // 'day' adalah tanggal lokal (misal: 4 Nov, 00:00 WIB)
  // Kita harus membuat objek Date baru menggunakan nilai UTC
  // agar .toISOString() tidak menggesernya ke hari sebelumnya.
  const startOfDayUTC = new Date(Date.UTC(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    0, 0, 0
  ));
  // 'startOfDayUTC.toISOString()' sekarang akan menjadi: "2025-11-04T00:00:00.000Z"
  // (Bukan "2025-11-03T17:00:00.000Z" lagi)
  // -------------------------

  // Panggil action dari store dengan tanggal UTC yang sudah benar
  await bookingStore.checkAvailability(packageId, startOfDayUTC);

  setTimeout(() => feather.replace(), 0);
};

const handleTimeSelect = (time) => {
  selectedTime.value = time
}

const goToNextStep = () => {
  if (selectedDate.value && selectedTime.value) {
    const [hours, minutes] = selectedTime.value.split(':')
    const finalDateTime = new Date(selectedDate.value)
    finalDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    bookingStore.setDateAndTime(finalDateTime)
    router.push('/booking/Confirmation')
  } else {
    alert('Silakan pilih tanggal dan waktu terlebih dahulu.')
  }
}

onMounted(() => {
  if (!selectedBranch.value || !selectedPackage.value) {
    console.warn('Data booking tidak ditemukan. Redirecting...')
    router.push('/')
  } else {
    console.log('Data booking dimuat:', selectedBranch.value, selectedPackage.value)
    setTimeout(() => feather.replace(), 50)
  }
})
</script>

<template>
  <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
    <main class="container mx-auto px-4">
      <!-- Header Halaman -->
      <div class="flex items-center justify-between mb-12">
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <button @click="$router.back()"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
              <i data-feather="arrow-left" class="w-6 h-6"></i>
            </button>
            <button @click="$router.push('/')"
              class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
              <i data-feather="home" class="w-6 h-6"></i>
            </button>
          </div>
        </div>
        <div class="flex-1 text-center">
          <h1 class="text-3xl font-bold">BOOKING APPOINTMENT</h1>
        </div>
        <div class="flex-1"></div>
      </div>

      <!-- Konten Booking -->
      <div v-if="selectedBranch && selectedPackage">
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Kalender -->
          <div class="md:col-span-2 bg-white text-black p-6 border-4 border-outline">
            <div class="flex justify-between items-center mb-6">
              <button @click="goToToday"
                class="bg-primary text-white px-3 py-1 border-2 border-black shadow-solid text-sm font-display hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                Hari ini
              </button>
              <div class="flex items-center space-x-4">
                <button @click="prevMonth" class="hover:text-primary">&lt;</button>
                <span class="font-bold text-lg font-display">{{ currentMonthName }} {{ currentYear }}</span>
                <button @click="nextMonth" class="hover:text-primary">&gt;</button>
              </div>
            </div>

            <div class="grid grid-cols-7 text-center font-sans font-bold mb-2 text-sm">
              <div v-for="day in ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']" :key="day">{{ day }}</div>
            </div>

            <div class="grid grid-cols-7 gap-1">
              <div v-for="i in (firstDayIndex === 0 ? 6 : firstDayIndex - 1)" :key="'empty-' + i" class="h-12"></div>
              <div v-for="day in calendarDays.filter(d => d !== null)" :key="day.getDate()"
                class="h-12 flex items-center justify-center">
                <button @click="handleDateSelect(day)" :disabled="isPast(day)" :class="[
                  'w-10 h-10 flex items-center justify-center rounded-full border-2 border-transparent transition-colors font-sans',
                  isPast(day) ? 'text-gray-400 cursor-not-allowed' : 'hover:border-primary',
                  isToday(day) && !isSelected(day) ? 'bg-primary text-white' : '',
                  isSelected(day) ? 'bg-black text-white border-black ring-2 ring-offset-2 ring-primary' : ''
                ]">
                  {{ day.getDate() }}
                </button>
              </div>
            </div>
          </div>

          <!-- Ringkasan & Slot Waktu -->
          <div class="font-sans space-y-6">
            <!-- Ringkasan Pesanan -->
            <div class="bg-white text-black p-4 border-4 border-outline">
              <h3 class="font-display font-bold text-lg border-b-2 border-outline pb-2 mb-3">Ringkasan Pesanan</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Studio</span>
                  <span class="font-bold text-right">{{ selectedBranch.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Room</span>
                  <span class="font-bold text-right">{{ selectedPackage.room_name_display }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Paket</span>
                  <span class="font-bold text-right">{{ selectedPackage.package_name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Harga</span>
                  <span class="font-bold text-right">Rp {{ parseFloat(selectedPackage.price).toLocaleString('id-ID')
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Slot Waktu -->
            <div>
              <div
                class="bg-primary text-white text-center p-2 border-2 border-outline shadow-solid mb-4 text-sm font-display">
                {{ selectedDate ? selectedDate.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : 'Pilih Tanggal Dahulu' }}
              </div>

              <div v-if="isLoading" class="text-center p-4">Loading waktu...</div>
              <div v-else-if="selectedDate && availability.slots.length === 0"
                class="text-center p-4 text-sm text-gray-500">
                {{ availability.message || 'Tidak ada jadwal tersedia.' }}
              </div>
              <div v-else-if="selectedDate && availability.slots.length > 0" class="grid grid-cols-4 gap-2">
                <button v-for="time in availability.slots" :key="time" @click="handleTimeSelect(time)" :class="[
                  'p-2 border-3 border-outline shadow-solid font-bold transition-all duration-100 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 font-display',
                  selectedTime === time ? 'bg-black text-white' : 'bg-primary text-white hover:bg-red-600'
                ]">
                  {{ time }}
                </button>
              </div>
              <div v-else class="text-center p-4 text-sm text-gray-500">
                Pilih tanggal di kalender untuk melihat waktu tersedia.
              </div>
            </div>
          </div>
        </div>

        <!-- Tombol Next -->
        <div class="text-center mt-12">
          <button @click="goToNextStep" :disabled="!selectedTime"
            class="bg-primary text-text-default font-bold text-lg py-3 px-12 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-display">
            Next
          </button>
        </div>
      </div>

      <!-- Jika Data Booking Tidak Ditemukan -->
      <div v-else class="text-center py-16">
        <h2 class="text-2xl font-bold">Sesi Booking Anda Tidak Ditemukan</h2>
        <p class="mb-6">Silakan mulai lagi dari halaman lokasi.</p>
        <router-link to="/"
          class="bg-primary text-white px-6 py-3 block w-max mx-auto mt-6 border-3 border-outline shadow-solid">
          Kembali ke Beranda
        </router-link>
      </div>
    </main>
  </div>
</template>
