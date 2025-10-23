import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '../views/auth/login.vue'

// ✅ Mock store auth
const loginMock = vi.fn()
vi.mock('../stores/auth.stores', () => ({
  useAuthStore: () => ({
    login: loginMock
  })
}))

describe('Login.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Login, {
      global: {
        stubs: ['router-link'], // biar router-link ga error
      },
    })
    loginMock.mockReset() // reset setiap test
  })

  // 🧩 1. Komponen ter-render
  it('renders login form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
  })

  // 🧩 2. Toggle visibilitas password
  it('toggles password visibility when button clicked', async () => {
    const button = wrapper.find('button[type="button"]')
    const passwordInput = wrapper.find('input#password')

    expect(passwordInput.attributes('type')).toBe('password')
    await button.trigger('click')
    expect(passwordInput.attributes('type')).toBe('text')
  })

  // 🧩 3. Berhasil login
  it('calls authStore.login when form is submitted', async () => {
    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input#password')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(loginMock).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  // 🧩 4. Login gagal (menampilkan errorMessage)
  it('displays error message when login fails', async () => {
    loginMock.mockRejectedValueOnce(new Error('Invalid credentials'))

    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input#password')

    await emailInput.setValue('wrong@example.com')
    await passwordInput.setValue('wrongpass')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    const errorDiv = wrapper.find('.bg-primary\\/20')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toContain('Email atau password yang Anda masukkan salah.')
  })
})
