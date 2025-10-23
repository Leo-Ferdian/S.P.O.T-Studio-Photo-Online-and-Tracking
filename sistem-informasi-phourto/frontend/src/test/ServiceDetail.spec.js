import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Path dari 'src/test/' ke 'src/stores/'
import { useBookingStore } from '../stores/booking.stores' 
// Path dari 'src/test/' ke 'src/views/'
// (Ganti 'ServiceDetail.vue' jika nama file aslinya beda)
import ServiceDetail from '../views/ServiceDetail.vue' 

// --- Persiapan Mock ---
vi.stubGlobal('feather', {
  replace: vi.fn(),
})

const mockRouter = {
  back: vi.fn(),
  push: vi.fn(),
}

// Helper untuk mounting (biar rapi)
const mountComponent = (planName) => {
  return mount(ServiceDetail, {
    props: {
      planName: planName
    },
    global: {
      mocks: {
        $router: mockRouter,
      },
      stubs: {
        'router-link': true,
      }
    }
  })
}

// --- Mulai Tes ---
describe('ServiceDetail.vue', () => {

  beforeEach(() => {
    setActivePinia(createPinia()) // Pinia-nya tidak dipakai di sini, tapi aman
    mockRouter.back.mockClear()
    mockRouter.push.mockClear()
  })

  // Tes 1: Skenario 'pas-foto'
  it('menampilkan layout detail "Pas Foto" saat prop planName adalah "pas-foto"', async () => {
    const wrapper = mountComponent('pas-foto')
    await flushPromises()

    expect(wrapper.find('span.inline-block').text()).toBe('PAS FOTO MENU')
    const detailCard = wrapper.find('.bg-white.text-black.border-4.border-primary')
    expect(detailCard.exists()).toBe(true)
    expect(detailCard.text()).toContain('Rp. 125.000,00')

    // --- PERBAIKAN DI SINI ---
    // Menggunakan selector atribut [class*="..."] yang aman
    const genericGallery = wrapper.find('div[class*="md:grid-cols-4"]')
    expect(genericGallery.exists()).toBe(false)
  })

  // Tes 2: Skenario Galeri Umum (Yang tadi gagal)
  it('menampilkan layout galeri umum saat prop planName adalah "basic-ramean"', async () => {
    const wrapper = mountComponent('basic-ramean')
    await flushPromises()

    expect(wrapper.find('span.inline-block').text()).toBe('BASIC PLAN & RAMEAN PLAN')

    // --- PERBAIKAN DI SINI ---
    // Menggunakan selector atribut [class*="..."] yang aman
    const genericGallery = wrapper.find('div[class*="md:grid-cols-4"]')
    
    // Ini sekarang akan LULUS
    expect(genericGallery.exists()).toBe(true) 

    // Cek: Jumlah gambar harus 8 (sesuai data statis)
    const images = genericGallery.findAll('img')
    expect(images.length).toBe(8)
    expect(images[0].attributes('alt')).toBe('PURPLE')

    const detailCard = wrapper.find('.bg-white.text-black.border-4.border-primary')
    expect(detailCard.exists()).toBe(false)
  })

  // Tes 3: Skenario Gagal
  it('menampilkan pesan "Galeri Tidak Ditemukan" saat prop planName tidak valid', async () => {
    const wrapper = mountComponent('galeri-hantu')
    await flushPromises()

    expect(wrapper.find('h2').text()).toBe('Galeri Tidak Ditemukan')
    expect(wrapper.find('span.inline-block').exists()).toBe(false)
    expect(wrapper.find('.bg-white.text-black.border-4.border-primary').exists()).toBe(false)
    
    // --- PERBAIKAN DI SINI ---
    // Menggunakan selector atribut [class*="..."] yang aman
    const genericGallery = wrapper.find('div[class*="md:grid-cols-4"]')
    expect(genericGallery.exists()).toBe(false)
  })

})