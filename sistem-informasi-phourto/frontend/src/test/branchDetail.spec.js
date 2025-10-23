import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Sesuaikan path ini jika store-mu ada di tempat lain
import { useBookingStore } from '../stores/booking.stores'
import BranchDetail from '../views/BranchDetail.vue'

// --- Persiapan Mock ---

// 1. Mock 'feather-icons' secara global
vi.stubGlobal('feather', {
  replace: vi.fn(),
})

// 2. Mock '$router' (karena ada @click="$router.back()")
const mockRouter = {
  back: vi.fn(),
  push: vi.fn(),
}

// Helper untuk mounting komponen (biar gak ngetik ulang-ulang)
const mountComponent = (props) => {
  return mount(BranchDetail, {
    props: {
      branchName: props.branchName
    },
    global: {
      // Sediakan mock $router dan stub <router-link>
      mocks: {
        $router: mockRouter,
      },
      stubs: {
        'router-link': true, // Matikan <router-link>
      }
    }
  })
}

// --- Mulai Tes ---
describe('BranchDetail.vue', () => {

  let bookingStore;

  // 'beforeEach' berjalan sebelum setiap tes 'it(...)'
  beforeEach(() => {
    // Buat Pinia baru setiap tes
    setActivePinia(createPinia())
    // Ambil referensi store-nya untuk dimata-matai
    bookingStore = useBookingStore()
    
    // Reset mock router (jika dipanggil di tes sebelumnya)
    mockRouter.back.mockClear()
    mockRouter.push.mockClear()
  })

  // Tes 1: Skenario Sukses (Happy Path)
  it('merender nama cabang dan daftar paket dengan benar saat slug valid', async () => {
    const wrapper = mountComponent({ branchName: 'studio-sail' })

    // Tunggu 'onMounted' (isLoading=false) selesai
    await flushPromises()

    // Cek: Judul harus "STUDIO SAIL"
    expect(wrapper.find('h1').text()).toBe('STUDIO SAIL')

    // Cek: Pesan loading dan error tidak boleh ada
    expect(wrapper.text()).not.toContain('Loading...')
    expect(wrapper.text()).not.toContain('Studio Tidak Ditemukan')

    // Cek: Harus ada 4 kartu paket (sesuai data statis 'studio-sail')
    const packageCards = wrapper.findAll('.bg-white.border-4.border-outline')
    expect(packageCards.length).toBe(4)

    // Cek: Data di kartu pertama harus benar
    const firstPackage = packageCards[0]
    expect(firstPackage.text()).toContain('ROOM 1: BASIC')
    expect(firstPackage.text()).toContain('Rp. 125.000') // (sudah terformat)
  })

  // Tes 2: Skenario Gagal (Sad Path)
  it('menampilkan pesan "Studio Tidak Ditemukan" saat slug tidak valid', async () => {
    const wrapper = mountComponent({ branchName: 'studio-hantu' })

    // Tunggu 'onMounted' (isLoading=false) selesai
    await flushPromises()

    // Cek: Judul error harus tampil
    expect(wrapper.find('h2').text()).toBe('Studio Tidak Ditemukan')

    // Cek: Pesan loading dan judul sukses tidak boleh ada
    expect(wrapper.text()).not.toContain('Loading...')
    expect(wrapper.find('h1').exists()).toBe(false) // Tidak ada <h1>

    // Cek: Tidak boleh ada kartu paket yang dirender
    const packageCards = wrapper.findAll('.bg-white.border-4.border-outline')
    expect(packageCards.length).toBe(0)
  })

  // Tes 3: Tes Interaksi (Store)
  it('memanggil store setBranchAndPackage dengan data yang benar saat "Booking Room" diklik', async () => {
    // "Mata-matai" (spy) fungsi di store-nya
    bookingStore.setBranchAndPackage = vi.fn()

    const wrapper = mountComponent({ branchName: 'studio-panam' })
    await flushPromises() // Tunggu onMounted

    // 1. Ambil data paket pertama dari komponen (untuk perbandingan)
    // 'vm' adalah instance komponennya
    const expectedPackageData = wrapper.vm.currentBranchData.packages[0]
    // Cek data: 'ROOM 1: BASIC' (id: 5)
    expect(expectedPackageData.id).toBe(5) 

    // 2. Temukan kartu paket pertama
    const firstPackageCard = wrapper.find('.bg-white.border-4.border-outline')

    // 3. Temukan tombol "Booking Room" di dalam kartu itu
    // (Tombolnya adalah <router-link> yang sudah kita stub)
    const bookingButton = firstPackageCard.find('router-link-stub')
    await bookingButton.trigger('click')

    // 4. Cek Asersi (Ekspektasi)
    
    // Cek: Fungsi store harus dipanggil 1x
    expect(bookingStore.setBranchAndPackage).toHaveBeenCalledTimes(1)

    // Cek: Fungsi store dipanggil dengan argumen yang benar
    const expectedBranchInfo = {
      id: 'studio-panam', // (karena id di data statis tidak ada, dia fallback ke branchName)
      name: 'STUDIO PANAM',
      slug: 'studio-panam'
    }
    
    expect(bookingStore.setBranchAndPackage).toHaveBeenCalledWith(
      expectedBranchInfo, // Argumen pertama (branchInfo)
      expectedPackageData // Argumen kedua (pkg)
    )
  })

})