<script setup>
  import { onMounted, computed, ref } from 'vue';
  import { useBookingStore } from '../../stores/booking.stores';
  import { useAuthStore } from '../../stores/auth.stores';
  import feather from 'feather-icons';
  import { useRouter } from 'vue-router';
  import apiClient from '../../api/api';

  const bookingStore = useBookingStore();
  const authStore = useAuthStore();
  const router = useRouter();

    // Fungsi untuk menyimpan data dan lanjut ke pembayaran
  const confirmBooking = async () => {
    // Simpan detail customer & add-ons ke store
    bookingStore.setCustomerDetails({
      name: customerName.value,
      email: customerEmail.value,
      whatsapp: customerWhatsapp.value,
      instagram: customerInstagram.value,
    });
    bookingStore.setSelectedBackground(selectedBackground.value);
    bookingStore.setAdditionalPeople(additionalPeople.value);
    // console.log("Booking Confirmed Data:", bookingStore.$state);

    // TODO: Panggil API backend POST /api/bookings untuk membuat booking sebenarnya
    try {
      // --- OPSIONAL TAPI DIREKOMENDASIKAN: Panggil API create booking di sini ---
      // const bookingPayload = {
      //     user_id: authStore.user.id,
      //     branch_id: bookingStore.selectedBranch.id,
      //     package_id: bookingStore.selectedPackage.id,
      //     booking_time: `${bookingStore.selectedDate.toISOString().split('T')[0]} ${bookingStore.selectedTime}:00`, // Format YYYY-MM-DD HH:MM:SS
      //     // Kirim juga data customerDetails, selectedBackground, additionalPeople jika backend memerlukan
      // };
      // const response = await apiClient.post('/bookings', bookingPayload);
      // Simpan booking ID yang asli dari backend ke store jika perlu
      // bookingStore.setBookingId(response.data.data.id); 
      // --------------------------------------------------------------------

      console.log("Booking Confirmed Data Saved:", bookingStore.$state);
      // Arahkan ke halaman summary final
      router.push('/booking/summary');

    } catch (error) {
      console.error("Failed to create booking:", error);
      alert('Gagal mengkonfirmasi pesanan. Silakan coba lagi.');
    }
    // Setelah berhasil, arahkan ke halaman pembayaran (misal /payment)
    // router.push('/payment'); 
    // alert('Booking dikonfirmasi (simulasi). Lanjut ke pembayaran.');
  };

  // Salin data awal dari store agar bisa diedit di form
  const customerName = ref(bookingStore.customerDetails.name || authStore.user?.full_name || '');
  const customerEmail = ref(bookingStore.customerDetails.email || authStore.user?.email || '');
  const customerWhatsapp = ref(bookingStore.customerDetails.whatsapp || authStore.user?.whatsapp_number || '');
  const customerInstagram = ref(bookingStore.customerDetails.instagram || '');
  const selectedBackground = ref(bookingStore.selectedBackground || '');
  const additionalPeople = computed({
  get: () => bookingStore.additionalPeople,
  set: (value) => bookingStore.setAdditionalPeople(value)
});


  // Data dummy untuk pilihan background
  const backgroundOptions = ['Putih', 'Abu-abu', 'Hitam', 'Merah Maroon'];

  // Format tanggal dari store
  const formattedDate = computed(() => {
    if (!bookingStore.selectedDate) return 'Tanggal belum dipilih';
    return new Date(bookingStore.selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  });

  const incrementPerson = () => additionalPeople.value++;
  const decrementPerson = () => {
    if (additionalPeople.value > 0) additionalPeople.value--;
  };

  onMounted(() => {
    feather.replace();
    // Isi form dengan data user jika sudah login
    if (!bookingStore.customerDetails.name && authStore.user) {
      customerName.value = authStore.user.full_name;
      customerEmail.value = authStore.user.email;
      customerWhatsapp.value = authStore.user.whatsapp_number;
    }
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
          <h1 class="text-3xl font-bold">Konfirmasi Pemesanan</h1>
        </div>
        <div class="flex-1"></div>
      </div>

      <!-- Konten Utama -->
      <div class="grid md:grid-cols-2 gap-12 items-start">
        <!-- Kolom Kiri: Ringkasan Booking -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">{{ bookingStore.selectedBranch?.name || 'Pilih Cabang' }}<br>{{
            bookingStore.selectedPackage?.room || 'Pilih Paket' }}</h2>

          <!-- Card Jadwal -->
          <div class="bg-white border-3 border-outline p-4 flex justify-between items-start">
            <div class="font-sans">
              <p class="font-bold text-lg">{{ formattedDate }}</p>
              <p class="font-bold text-lg">{{ bookingStore.selectedTime || '--:--' }}</p>
              <p class="text-sm text-gray-600">Asia/Jakarta</p>
            </div>
            <!-- Tombol Edit Jadwal -->
            <router-link :to="`/booking/${bookingStore.selectedBranch?.slug}/${bookingStore.selectedPackage?.id}`"
              class="text-gray-500 hover:text-primary">
              <i data-feather="edit-2" class="w-5 h-5"></i>
            </router-link>
          </div>

          <!-- Card Paket -->
          <div class="bg-white border-3 border-outline p-4 flex justify-between items-start">
            <div class="font-sans">
              <p class="font-bold text-lg">{{ bookingStore.selectedPackage?.duration || 0 }} Menit</p>
              <p class="text-sm text-gray-600">{{ bookingStore.selectedBranch?.name }} {{
                bookingStore.selectedPackage?.room }}</p>
              <p class="font-bold text-lg mt-2">Rp {{ (bookingStore.selectedPackage?.price || 0).toLocaleString('id-ID')
                }}</p>
            </div>
            <!-- Tombol Edit Paket -->
            <router-link :to="`/location/${bookingStore.selectedBranch?.slug}`"
              class="text-gray-500 hover:text-primary">
              <i data-feather="edit-2" class="w-5 h-5"></i>
            </router-link>
          </div>
        </div>

        <!-- Kolom Kanan: Form Detail & Add-ons -->
        <form @submit.prevent="confirmBooking" class="space-y-4 font-sans">
          <div>
            <label for="name" class="font-display font-bold text-sm block mb-1">Nama <span
                class="text-gray-500 font-sans">(Diperlukan)</span></label>
            <input v-model="customerName" type="text" id="name" required
              class="w-full p-3 bg-white text-text-default border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-yellow-400">
          </div>
          <div>
            <label for="email" class="font-display font-bold text-sm block mb-1">Email <span
                class="text-gray-500 font-sans">(Diperlukan)</span></label>
            <input v-model="customerEmail" type="email" id="email" required
              class="w-full p-3 bg-white text-text-default border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-yellow-400">
          </div>
          <div>
            <label for="whatsapp" class="font-display font-bold text-sm block mb-1">Whatsapp <span
                class="text-gray-500 font-sans">(Diperlukan)</span></label>
            <input v-model="customerWhatsapp" type="tel" id="whatsapp" required
              class="w-full p-3 bg-white text-text-default border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-yellow-400">
          </div>
          <div>
            <label for="instagram" class="font-display font-bold text-sm block mb-1">Instagram <span
                class="text-gray-500 font-sans">(Diperlukan)</span></label>
            <input v-model="customerInstagram" type="text" id="instagram" required
              class="w-full p-3 bg-white text-text-default border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-yellow-400">
          </div>
          <div>
            <label for="background" class="font-display font-bold text-sm block mb-1">Pilihan Background</label>
            <select v-model="selectedBackground" id="background"
              class="w-full p-3 bg-white text-text-default border-3 border-outline shadow-solid appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400">
              <option disabled value="">Silahkan pilih</option>
              <option v-for="bg in backgroundOptions" :key="bg" :value="bg">{{ bg }}</option>
            </select>
          </div>

          <!-- Add On Orang -->
          <div class="pt-4">
            <p class="font-display font-bold text-sm">PENAMBAHAN ORANG (ADD ONS)</p>
            <p class="text-xs text-gray-600 mb-2">untuk penambahan orang bisa dilakukan ketika sudah di chat oleh mimin
              kita ya :)</p>
            <div
              class="bg-primary text-white p-3 border-3 border-outline shadow-solid flex justify-between items-center">
              <div>
                <p class="font-bold">Tambahan Orang</p>
                <p class="text-xs">Rp {{ bookingStore.addOnPricePerPerson.toLocaleString('id-ID') }} / orang</p>
              </div>
              <div class="flex items-center space-x-3 bg-black p-1">
                <button type="button" @click="decrementPerson"
                  class="w-6 h-6 flex items-center justify-center bg-white text-black font-bold text-xl">-</button>
                <span class="w-6 text-center">{{ additionalPeople }}</span>
                <button type="button" @click="incrementPerson"
                  class="w-6 h-6 flex items-center justify-center bg-white text-black font-bold text-xl">+</button>
              </div>
            </div>
          </div>

          <!-- Tombol Konfirmasi -->
          <div class="pt-6">
            <button type="submit"
              class="w-full bg-primary text-text-default font-bold text-lg py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
              Konfirmasi Pemesanan
            </button>
            <p class="font-sans text-center mt-4">Total: <span class="font-bold">Rp {{
                bookingStore.grandTotal.toLocaleString('id-ID') }}</span></p>
          </div>

        </form>
      </div>
    </main>
  </div>
</template>