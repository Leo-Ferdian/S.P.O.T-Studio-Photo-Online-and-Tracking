<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import feather from 'feather-icons'
import { useBookingStore } from '../../stores/booking.stores'
import { useAuthStore } from '../../stores/auth.stores'

// === STORE & ROUTER ===
const bookingStore = useBookingStore()
const authStore = useAuthStore()
const router = useRouter()

// === GETTER STORE ===
const summary = computed(() => bookingStore.getBookingSummary)
const grandTotal = computed(() => bookingStore.grandTotal)
const packageAllowsAddons = computed(() => summary.value?.package?.price_type === 'per_package')

// === STATE FORM (LOKAL) ===
const customerName = ref(authStore.user?.full_name || '')
const customerEmail = ref(authStore.user?.email || '')
const customerWhatsapp = ref(authStore.user?.phone_number || '')
const customerInstagram = ref('')
const selectedBackground = ref('')

// === STATE ADDITIONAL PEOPLE ===
const additionalPeople = computed({
  get: () => bookingStore.additionalPeople,
  set: (val) => bookingStore.setAdditionalPeople(val)
})

// === STATE UI ===
const isLoading = ref(false)
const errorMessage = ref(null)

// === UTIL: Format Mata Uang ===
const formatCurrency = (value) => {
  const number = parseFloat(value) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number)
}

// === FUNGSI KONFIRMASI BOOKING ===
const confirmBooking = async () => {
  isLoading.value = true
  errorMessage.value = null

  // Simpan detail customer ke store
  bookingStore.setCustomerDetails({
    name: customerName.value,
    email: customerEmail.value,
    whatsapp: customerWhatsapp.value,
    instagram: customerInstagram.value
  })

  bookingStore.setSelectedBackground(selectedBackground.value)

  try {
    await bookingStore.createBooking()
    router.push('/booking/payment')
  } catch (error) {
    console.error('Gagal membuat booking:', error)
    errorMessage.value = error.message || 'Gagal mengkonfirmasi pesanan.'
  } finally {
    isLoading.value = false
  }
}

// === OPSI BACKGROUND ===
const backgroundOptions = ['Putih', 'Abu-abu', 'Hitam', 'Merah Maroon']

// === FORMAT TANGGAL & WAKTU ===
const formattedDateTime = computed(() => {
  if (!summary.value || !summary.value.dateTime) return 'Waktu belum dipilih'

  const date = summary.value.dateTime
  const parsedDate = date instanceof Date ? date : new Date(date)
  if (isNaN(parsedDate)) return 'Format Waktu Salah'

  return parsedDate.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// === TAMBAHAN ORANG (ADD-ONS) ===
const incrementPerson = () => {
  bookingStore.setAdditionalPeople(additionalPeople.value + 1)
}

const decrementPerson = () => {
  if (additionalPeople.value > 0) {
    bookingStore.setAdditionalPeople(additionalPeople.value - 1)
  }
}

// === LIFECYCLE ===
onMounted(() => {
  if (!bookingStore.hasSelectedPackage) {
    alert('Sesi booking tidak ditemukan. Silakan mulai lagi.')
    router.push('/location')
    return
  }

  nextTick(() => feather.replace())

  // Prefill data user
  if (authStore.user) {
    customerName.value = authStore.user.full_name || bookingStore.customerDetails.name
    customerEmail.value = authStore.user.email || bookingStore.customerDetails.email
    customerWhatsapp.value = authStore.user.phone_number || bookingStore.customerDetails.whatsapp
  }
})
</script>

<template>
  <div class="bg-background min-h-screen text-text-default pt-24 pb-12">
    <main class="container mx-auto px-4">
      <!-- HEADER -->
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

      <!-- KONTEN UTAMA -->
      <div v-if="summary" class="grid md:grid-cols-2 gap-12 items-start">
        <!-- KOLOM KIRI -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">
            {{ summary.branch.name }}<br />
            {{ summary.package.room_name_display }}
          </h2>

          <!-- Jadwal -->
          <div class="bg-white border-3 border-outline p-4 flex justify-between items-start">
            <div>
              <p class="font-bold text-lg">{{ formattedDateTime }}</p>
              <p class="text-sm text-gray-600">Asia/Jakarta</p>
            </div>
            <router-link to="/booking/appointment" class="text-gray-500 hover:text-primary">
              <i data-feather="edit-2" class="w-5 h-5"></i>
            </router-link>
          </div>

          <!-- Paket -->
          <div class="bg-white border-3 border-outline p-4 flex justify-between items-start">
            <div>
              <p class="font-bold text-lg">{{ summary.package.duration }} Menit</p>
              <p class="text-sm text-gray-600">{{ summary.package.package_name }}</p>
              <p class="font-bold text-lg mt-2">{{ formatCurrency(summary.package.price) }}</p>
            </div>
            <router-link :to="`/location/${summary.branch.slug}`" class="text-gray-500 hover:text-primary">
              <i data-feather="edit-2" class="w-5 h-5"></i>
            </router-link>
          </div>
        </div>

        <!-- KOLOM KANAN -->
        <form @submit.prevent="confirmBooking" class="space-y-4">
          <!-- Input Form -->
          <div>
            <label for="name" class="font-bold text-sm block mb-1">
              Nama <span class="text-gray-500">(Diperlukan)</span>
            </label>
            <input v-model="customerName" type="text" id="name" required class="form-input-setting" />
          </div>

          <div>
            <label for="email" class="font-bold text-sm block mb-1">
              Email <span class="text-gray-500">(Diperlukan)</span>
            </label>
            <input v-model="customerEmail" type="email" id="email" required class="form-input-setting" />
          </div>

          <div>
            <label for="whatsapp" class="font-bold text-sm block mb-1">
              Whatsapp <span class="text-gray-500">(Diperlukan)</span>
            </label>
            <input v-model="customerWhatsapp" type="tel" id="whatsapp" required class="form-input-setting" />
          </div>

          <div>
            <label for="instagram" class="font-bold text-sm block mb-1">
              Instagram <span class="text-gray-500">(Diperlukan)</span>
            </label>
            <input v-model="customerInstagram" type="text" id="instagram" required class="form-input-setting" />
          </div>

          <div>
            <label for="background" class="font-bold text-sm block mb-1">Pilihan Background</label>
            <select v-model="selectedBackground" id="background" class="form-input-setting appearance-none">
              <option disabled value="">Silahkan pilih</option>
              <option v-for="bg in backgroundOptions" :key="bg" :value="bg">{{ bg }}</option>
            </select>
          </div>

          <!-- Tambahan Orang -->
          <div v-if="packageAllowsAddons" class="pt-4">
            <p class="font-bold text-sm">PENAMBAHAN ORANG (ADD ONS)</p>
            <p class="text-xs text-gray-600 mb-2">
              Harga default paket sudah termasuk ({{ summary.package.capacity }} orang).
            </p>

            <div
              class="bg-primary text-white p-3 border-3 border-outline shadow-solid flex justify-between items-center">
              <div>
                <p class="font-bold">Tambahan Orang</p>
                <p class="text-xs">{{ formatCurrency(bookingStore.addOnPricePerPerson) }} / orang</p>
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

          <!-- Tombol -->
          <div class="pt-6">
            <div v-if="errorMessage" class="bg-red-800/50 text-white text-sm p-3 border-2 border-primary mb-4">
              {{ errorMessage }}
            </div>

            <button type="submit" :disabled="isLoading"
              class="w-full bg-primary text-text-default font-bold text-lg py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50">
              <span v-if="isLoading">MEMPROSES...</span>
              <span v-else>Lanjut ke Pembayaran</span>
            </button>

            <p class="text-center mt-4">
              Total: <span class="font-bold">{{ formatCurrency(grandTotal) }}</span>
            </p>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<style lang="postcss" scoped>
.form-input-setting {
  @apply w-full p-3 bg-white text-text-default border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-yellow-400;
}
</style>
