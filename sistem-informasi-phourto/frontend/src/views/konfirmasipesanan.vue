<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import feather from 'feather-icons'
import ActionButton from '../components/common/ActionButton.vue'

const route = useRoute()
const nama = ref('')
const email = ref('')
const whatsapp = ref('')
const instagram = ref('')
const background = ref('')
const tanggal = ref(route.query.tanggal || 'Belum dipilih')
const waktu = ref(route.query.waktu || 'Belum dipilih')

const backgrounds = [
  'Default (Spotlight)',
  'Soft Beige',
  'Blue Sky',
  'Black Matte',
  'Color Pop'
]

const handleSubmit = () => {
  alert(`Terima kasih ${nama.value}! Pesananmu untuk ${tanggal.value} jam ${waktu.value} telah dikonfirmasi.`)
}

onMounted(() => feather.replace())
</script>

<template>
  <div class="bg-[#FEE600] min-h-screen text-black font-kodemono">
    <header class="flex items-center justify-between px-6 py-4 border-b-2 border-black">
      <div class="flex items-center space-x-2">
        <button @click="$router.push('/booking')" class="bg-black text-white px-2 py-1 rounded hover:bg-gray-800 transition">
          <i data-feather="arrow-left" class="w-4 h-4"></i>
        </button>
        <h1 class="text-lg font-bold">Konfirmasi Pemesanan</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
      <!-- Kiri -->
      <section class="border-2 border-black p-6">
        <h2 class="text-xl font-bold mb-2">Phourto Studio_CH 1</h2>
        <p class="font-bold mb-6">Room 4 : Spotlight</p>

        <div class="border border-black p-4 space-y-4">
          <div>
            <p>{{ tanggal }}</p>
            <p>{{ waktu }}</p>
            <p class="text-sm mt-1 flex items-center gap-1">
              <i data-feather="globe" class="w-4 h-4"></i> Asia/Jakarta
            </p>
          </div>

          <div class="border-t border-black pt-4">
            <p class="flex items-center gap-2">
              <i data-feather="clock" class="w-4 h-4"></i> <span>30 menit</span>
            </p>
            <p class="text-sm mt-1">Phour.to CH1 Room 4: Spotlight</p>
            <p class="font-semibold mt-2 flex items-center gap-1">
              <i data-feather="tag" class="w-4 h-4"></i> Rp 175.000,00
            </p>
          </div>
        </div>
      </section>

      <!-- Kanan -->
      <section>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block font-bold">Nama</label>
            <input v-model="nama" type="text" required placeholder="(Diperlukan)"
              class="w-full border border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div>
            <label class="block font-bold">Email</label>
            <input v-model="email" type="email" required placeholder="(Diperlukan)"
              class="w-full border border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div>
            <label class="block font-bold">Whatsapp</label>
            <input v-model="whatsapp" type="text" required placeholder="(Diperlukan)"
              class="w-full border border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div>
            <label class="block font-bold">Instagram</label>
            <input v-model="instagram" type="text" placeholder="(Opsional)"
              class="w-full border border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div>
            <label class="block font-bold">Pilihan Background</label>
            <select v-model="background" class="w-full border border-black px-3 py-2">
              <option disabled value="">Silahkan pilih</option>
              <option v-for="b in backgrounds" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>

          <p class="text-sm mt-4">
            <strong>PENAMBAHAN ORANG (ADD ONS)</strong><br />
            untuk penambahan orang bisa dilakukan ketika sudah di chat oleh Admin kita ya :)
          </p>

          <ActionButton text="Konfirmasi Pemesanan" class="bg-red-600 text-white w-full" />
        </form>
      </section>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kode+Mono:wght@400..700&display=swap');
.font-kodemono {
  font-family: "Kode Mono", monospace;
}
@media (max-width: 768px) {
  main {
    grid-template-columns: 1fr;
  }
}
</style>
