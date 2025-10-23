import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Sesuaikan path ini jika store kamu ada di tempat lain
import { useAuthStore } from '../stores/auth.stores' 
import ForgotPassword from '../views/auth/forgotpassword.vue'

// --- Persiapan Mock ---
vi.stubGlobal('feather', {
  replace: vi.fn(),
})

// --- Mulai Tes ---
describe('ForgotPassword.vue', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Tes 1: Memeriksa tampilan awal (Sudah Lulus)
  it('merender tampilan input email dengan benar saat pertama dimuat', () => {
    const wrapper = mount(ForgotPassword, {
      global: {
        stubs: { 'router-link': true }
      }
    })
    expect(wrapper.find('h2').text()).toBe('FORGOT PASSWORD')
    expect(wrapper.find('#email').exists()).toBe(true)
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.exists()).toBe(true)
    expect(submitButton.text()).toBe('SEND')
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  // Tes 2: Skenario Sukses (Sudah Lulus)
  it('memanggil store, menampilkan loading, dan pindah ke step "check_email" saat sukses', async () => {
    const authStore = useAuthStore()
    const mockResetFn = vi.fn().mockResolvedValue()
    authStore.requestPasswordReset = mockResetFn

    const wrapper = mount(ForgotPassword, {
      global: {
        stubs: { 'router-link': true }
      }
    })

    await wrapper.find('#email').setValue('abel@test.com')
    const submitButton = wrapper.find('button[type="submit"]')
    await submitButton.trigger('submit')

    // Asersi Loading (Ini LULUS di Tes 2)
    expect(submitButton.text()).toBe('MENGIRIM...')
    expect(submitButton.attributes('disabled')).toBeDefined()

    await flushPromises()

    expect(wrapper.find('h2').text()).toBe('CHECK YOUR EMAIL')
    expect(wrapper.find('p.font-sans').text()).toContain('abel@test.com')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  // Tes 3: Skenario Gagal (INI PERBAIKAN BESARNYA)
  it('menampilkan pesan error jika store gagal (misal: email tidak ditemukan)', async () => {
    const authStore = useAuthStore()

    // --- PERBAIKAN LOGIKA PROMISE ---
    // 1. Buat promise yang bisa kita kontrol dari luar
    let mockReject;
    const pendingPromise = new Promise((_, reject) => {
      mockReject = reject;
    });

    // 2. Buat mock-nya mengembalikan promise yang 'pending' itu
    const mockResetFn = vi.fn().mockReturnValue(pendingPromise);
    authStore.requestPasswordReset = mockResetFn
    // --- SELESAI PERBAIKAN ---

    const wrapper = mount(ForgotPassword, {
      global: {
        stubs: { 'router-link': true }
      }
    })

    await wrapper.find('#email').setValue('gagal@test.com')

    const submitButton = wrapper.find('button[type="submit"]')
    
    // 3. Trigger aksi. Ini akan set isLoading=true dan 'await' promise yg pending
    await submitButton.trigger('submit')
    // 'trigger' akan menunggu DOM update dari 'isLoading=true'
    
    // 4. Cek loading state. Ini SEKARANG PASTI LULUS.
    // Komponenmu 'terjebak' di state loading, persis seperti yang kita mau
    expect(submitButton.text()).toBe('MENGIRIM...')
    expect(submitButton.attributes('disabled')).toBeDefined()

    // 5. SEKARANG kita selesaikan (reject) promise-nya
    mockReject(new Error('Email tidak ditemukan'));
    
    // 6. Tunggu promise-nya selesai (catch/finally) dan DOM-nya update
    await flushPromises()

    // 7. Cek hasil akhirnya
    expect(wrapper.text()).toContain('Email tidak ditemukan atau terjadi kesalahan.')
    expect(submitButton.text()).toBe('SEND')
    expect(submitButton.attributes('disabled')).toBeUndefined()
    expect(wrapper.find('h2').text()).toBe('FORGOT PASSWORD')
  })

})