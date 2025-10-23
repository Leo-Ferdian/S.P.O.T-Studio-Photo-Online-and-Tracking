<script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import apiClient from '../../api/api';
  import feather from 'feather-icons';
  import { useRouter } from 'vue-router'; // Impor useRouter
  import { useBookingStore } from '../../stores/booking.stores.js';

  const props = defineProps({
    branchSlug: String,
    packageId: String // ID paket bisa berupa string dari URL
  });

  const router = useRouter(); // Gunakan useRouter
  const bookingStore = useBookingStore();

  // --- State Kalender ---
  const currentDate = ref(new Date()); // Tanggal acuan untuk bulan yang ditampilkan
  const selectedDate = ref(null); // Tanggal yang dipilih pengguna
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set ke awal hari untuk perbandingan

  const currentMonthName = computed(() => currentDate.value.toLocaleString('id-ID', { month: 'long' }));
  const currentYear = computed(() => currentDate.value.getFullYear());

  // Mendapatkan hari pertama dan jumlah hari dalam bulan
  const startOfMonth = computed(() => new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1));
  const endOfMonth = computed(() => new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0));
  const daysInMonth = computed(() => endOfMonth.value.getDate());
  const firstDayIndex = computed(() => startOfMonth.value.getDay()); // 0=Minggu, 1=Senin, dst.

  // Membuat array tanggal untuk ditampilkan di kalender
  const calendarDays = computed(() => {
    const days = [];
    // Tambahkan padding kosong di awal (sesuaikan 0=Minggu, 1=Senin)
    let startDayIndex = firstDayIndex.value === 0 ? 6 : firstDayIndex.value - 1; // Konversi agar Senin = 0
    for (let i = 0; i < startDayIndex; i++) {
      days.push(null);
    }
    // Tambahkan tanggal aktual
    for (let day = 1; day <= daysInMonth.value; day++) {
      days.push(new Date(currentYear.value, currentDate.value.getMonth(), day));
    }
    return days;
  });

  const prevMonth = () => {
    currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1));
    selectedDate.value = null; // Reset tanggal terpilih saat ganti bulan
    availableTimes.value = []; // Reset waktu tersedia
  };

  const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1));
    selectedDate.value = null; // Reset tanggal terpilih saat ganti bulan
    availableTimes.value = []; // Reset waktu tersedia
  };

  const goToToday = () => {
    currentDate.value = new Date(); // Set kalender ke bulan hari ini
    handleDateSelect(today); // Pilih tanggal hari ini
  };

  const isToday = (day) => {
    if (!day) return false;
    return day.toDateString() === today.toDateString();
  };

  const isSelected = (day) => {
    if (!day || !selectedDate.value) return false;
    return day.toDateString() === selectedDate.value.toDateString();
  }

  const isPast = (day) => {
    if (!day) return false;
    return day < today;
  }

  // --- State Slot Waktu ---
  const availableTimes = ref([]);
  const selectedTime = ref(null);
  const isLoadingTimes = ref(false);

  const handleDateSelect = async (day) => {
    if (!day || isPast(day)) return; // Jangan pilih tanggal kosong atau masa lalu
    selectedDate.value = day;
    selectedTime.value = null; // Reset waktu terpilih
    await fetchAvailableTimes();
  };

  // Fungsi untuk mengambil slot waktu dari API
  const fetchAvailableTimes = async () => {
    if (!selectedDate.value) return;
    isLoadingTimes.value = true;
    availableTimes.value = [];
    try {
      const dateString = selectedDate.value.toISOString().split('T')[0]; // Format YYYY-MM-DD
      // TODO: Ganti '1' dengan ID cabang yang sebenarnya (perlu diambil berdasarkan branchSlug)
      const response = await apiClient.get(`/bookings/availability?branchId=1&date=${dateString}`);
      availableTimes.value = response.data.data; // Asumsi API mengembalikan array string ["10:00", "11:00"]
    } catch (error) {
      console.error("Failed to fetch available times:", error);
      availableTimes.value = ["18.00", "18.30", "19.00", "19.30", "20.00", "20.30", "21.00", "21.30", "22.00", "22.30"]; // Data dummy jika error
    } finally {
      isLoadingTimes.value = false;
      setTimeout(() => feather.replace(), 0); // Re-render ikon
    }
  };

  const handleTimeSelect = (time) => {
    selectedTime.value = time;
  };

  // Fungsi tombol Next
  const goToNextStep = () => {
    if (selectedDate.value && selectedTime.value) {
        // Simpan pilihan ke Pinia Store
        bookingStore.setDateAndTime(selectedDate.value, selectedTime.value);
        
        // Arahkan ke halaman konfirmasi (BUKAN summary lagi)
        router.push('/booking/confirm'); 
    } else {
        alert('Silakan pilih tanggal dan waktu terlebih dahulu.');
    }
};

  onMounted(() => {
    feather.replace();
  });
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

      <!-- Konten Utama: Kalender dan Waktu -->
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Kolom Kalender (2/3 lebar) -->
        <div class="md:col-span-2 bg-white text-black p-6 border-4 border-outline">
          <div class="flex justify-between items-center mb-6">
            <button @click="goToToday"
              class="bg-primary text-white px-3 py-1 border-2 border-black shadow-solid text-sm font-display hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">Hari
              ini</button>
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
            <!-- Sel kosong sebelum tanggal 1 -->
            <div v-for="i in (firstDayIndex === 0 ? 6 : firstDayIndex - 1)" :key="'empty-' + i" class="h-12"></div>
            <!-- Sel tanggal -->
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

        <!-- Kolom Waktu (1/3 lebar) -->
        <div class="font-sans">
          <div
            class="bg-primary text-white text-center p-2 border-2 border-outline shadow-solid mb-4 text-sm font-display">
            {{ selectedDate ? selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long',
            year: 'numeric' }) : 'Pilih Tanggal Dahulu' }}
          </div>

          <div v-if="isLoadingTimes" class="text-center p-4">Loading waktu...</div>
          <div v-else-if="selectedDate && availableTimes.length === 0" class="text-center p-4 text-sm text-gray-500">
            Tidak ada jadwal tersedia pada tanggal ini.</div>
          <div v-else-if="selectedDate && availableTimes.length > 0" class="grid grid-cols-2 gap-3">
            <button v-for="time in availableTimes" :key="time" @click="handleTimeSelect(time)" :class="[
                        'p-3 border-3 border-outline shadow-solid font-bold transition-all duration-100 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 font-display',
                        selectedTime === time ? 'bg-black text-white' : 'bg-primary text-white hover:bg-red-600'
                    ]">
              {{ time }}
            </button>
          </div>
          <div v-else class="text-center p-4 text-sm text-gray-500">Pilih tanggal di kalender untuk melihat waktu
            tersedia.</div>
        </div>
      </div>

      <!-- Tombol Next -->
      <div class="text-center mt-12">
        <button @click="goToNextStep" :disabled="!selectedTime"
          class="bg-primary text-text-default font-bold text-lg py-3 px-12 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-display">
          Next
        </button>
      </div>

    </main>
  </div>
</template>