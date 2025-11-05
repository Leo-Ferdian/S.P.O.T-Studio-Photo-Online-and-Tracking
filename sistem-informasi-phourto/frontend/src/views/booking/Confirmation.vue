<script setup>
import { onMounted, computed, ref, nextTick } from 'vue'
import { useBookingStore } from '../../stores/booking.stores'
import { useAuthStore } from '../../stores/auth.stores'
import { useRouter } from 'vue-router'
import feather from 'feather-icons'
import { storeToRefs } from 'pinia'

// === STORE & ROUTER ===
const bookingStore = useBookingStore()
const authStore = useAuthStore()
const router = useRouter()

// === DATA DARI STORE ===
const summary = computed(() => bookingStore.getBookingSummary)
const isLoading = computed(() => bookingStore.isLoading)

// === STATE FORM (LOKAL) ===
const customerName = ref(authStore.user?.full_name || '')
const customerEmail = ref(authStore.user?.email || '')
const customerWhatsapp = ref(authStore.user?.phone_number || '')
const customerInstagram = ref('')
const selectedBackground = ref('')
const additionalPeople = ref(0)

// === OPSI PEMBAYARAN ===
const paymentOption = ref('FULL') // 'FULL' atau 'DP'
const addOnPricePerPerson = ref(25000)

const dpAmount = computed(() => {
  const packagePrice = parseFloat(summary.value?.package?.price) || 0
  return packagePrice * 0.5
})

const addonsTotal = computed(() => additionalPeople.value * addOnPricePerPerson.value)

const grandTotal = computed(() => {
  const packagePrice = parseFloat(summary.value?.package?.price) || 0
  return paymentOption.value === 'DP'
    ? dpAmount.value + addonsTotal.value
    : packagePrice + addonsTotal.value
})

// === STATE UI ===
const errorMessage = ref(null)

// === UTIL: Format Rupiah ===
const formatCurrency = (value) => {
  if (typeof value !== 'number') value = 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

// === KONFIRMASI BOOKING ===
const confirmBooking = async () => {
  bookingStore.isLoading = true
  errorMessage.value = null

  const payload = {
    customerDetails: {
      name: customerName.value,
      email: customerEmail.value,
      whatsapp: customerWhatsapp.value,
      instagram: customerInstagram.value
    },
    addons: [
      { type: 'background', value: selectedBackground.value },
      { type: 'additional_people', value: additionalPeople.value }
    ],
    payment_option: paymentOption.value,
    total_price: grandTotal.value
  }

  try {
    await bookingStore.createBooking(payload)
    router.push('/booking/summary')
  } catch (error) {
    console.error('Gagal membuat booking:', error)
    errorMessage.value = error.message || 'Gagal mengkonfirmasi pesanan.'
  } finally {
    bookingStore.isLoading = false
  }
}

// === DATA BACKGROUND ===
const backgroundOptions = ['Putih', 'Abu-abu', 'Hitam', 'Merah Maroon']

// === FORMAT WAKTU ===
const formattedDateTime = computed(() => {
  if (!summary.value || !summary.value.dateTime) return 'Waktu belum dipilih'
  const date = summary.value.dateTime
  const validDate = date instanceof Date ? date : new Date(date)

  if (isNaN(validDate.getTime())) return 'Format Waktu Salah'

  return validDate.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// === CEK ADD-ONS ===
const packageAllowsAddons = computed(() => summary.value?.package?.price_type === 'per_package')

// === FUNGSI TAMBAHAN ORANG ===
const incrementPerson = () => additionalPeople.value++
const decrementPerson = () => {
  if (additionalPeople.value > 0) additionalPeople.value--
}

// === LIFECYCLE ===
onMounted(() => {
  if (!bookingStore.hasSelectedPackage) {
    alert('Sesi booking tidak ditemukan. Silakan mulai lagi.')
    router.push('/location')
    return
  }
  nextTick(() => feather.replace())

  if (authStore.user) {
    customerName.value = authStore.user.full_name
    customerEmail.value = authStore.user.email
    customerWhatsapp.value = authStore.user.phone_number
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
            <button @click="$router.back()" class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid
                     hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
              <i data-feather="arrow-left" class="w-6 h-6"></i>
            </button>
            <button @click="$router.push('/')" class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid
                     hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
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
      <div class="grid md:grid-cols-2 gap-12 items-start" v-if="summary">
        <!-- KOLOM KIRI: RINGKASAN -->
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
              <p class="font-bold text-lg mt-2">
                {{ formatCurrency(parseFloat(summary.package.price)) }}
              </p>
            </div>
            <router-link :to="`/location/${summary.branch.slug}`" class="text-gray-500 hover:text-primary">
              <i data-feather="edit-2" class="w-5 h-5"></i>
            </router-link>
          </div>
        </div>

        <!-- KOLOM KANAN: FORM -->
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

          <!-- ADD-ONS -->
          <div class="pt-4" v-if="packageAllowsAddons">
            <p class="font-bold text-sm">PENAMBAHAN ORANG (ADD ONS)</p>
            <p class="text-xs text-gray-600 mb-2">
              Harga default paket sudah termasuk ({{ summary.package.capacity }}).
            </p>

            <div
              class="bg-primary text-white p-3 border-3 border-outline shadow-solid flex justify-between items-center">
              <div>
                <p class="font-bold">Tambahan Orang</p>
                <p class="text-xs">{{ formatCurrency(addOnPricePerPerson) }} / orang</p>
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

          <!-- OPSI PEMBAYARAN -->
          <div class="pt-4 space-y-3">
            <p class="font-bold text-sm">OPSI PEMBAYARAN</p>

            <!-- Bayar Penuh -->
            <label
              :class="['form-input-setting p-4 flex items-center cursor-pointer', paymentOption === 'FULL' ? 'ring-2 ring-yellow-400' : '']">
              <input type="radio" v-model="paymentOption" value="FULL" class="mr-3" />
              <div>
                <span class="font-bold">Bayar Penuh</span>
                <p class="text-sm">Total: {{ formatCurrency(parseFloat(summary.package.price) + addonsTotal) }}</p>
              </div>
            </label>

            <!-- Bayar DP -->
            <label
              :class="['form-input-setting p-4 flex items-center cursor-pointer', paymentOption === 'DP' ? 'ring-2 ring-yellow-400' : '']">
              <input type="radio" v-model="paymentOption" value="DP" class="mr-3" />
              <div>
                <span class="font-bold">Bayar DP (50%)</span>
                <p class="text-sm">Total: {{ formatCurrency(dpAmount + addonsTotal) }}</p>
              </div>
            </label>
          </div>

          <!-- Tombol Submit -->
          <div class="pt-6">
            <div v-if="errorMessage" class="bg-red-800/50 text-white text-sm p-3 border-2 border-primary mb-4">
              {{ errorMessage }}
            </div>

            <button type="submit" :disabled="isLoading" class="w-full bg-primary text-text-default font-bold text-lg py-3 border-3 border-outline shadow-solid
                  hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1
                  transition-all disabled:opacity-50">
              <span v-if="isLoading">MEMPROSES...</span>
              <span v-else>Amankan Slot (DP/Penuh)</span>
            </button>

            <p class="text-center mt-4">
              Total yang akan dibayar sekarang:
              <span class="font-bold text-lg">{{ formatCurrency(grandTotal) }}</span>
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
