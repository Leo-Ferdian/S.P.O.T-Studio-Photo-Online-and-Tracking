import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AboutUs from '../views/aboutus.vue'

// Mock feather-icons
vi.mock('feather-icons', () => ({
  default: { replace: vi.fn() }
}))

describe('AboutUs.vue', () => {
  let wrapper
  let mockRouter

  beforeEach(() => {
    mockRouter = {
      back: vi.fn(),
      push: vi.fn()
    }

    wrapper = mount(AboutUs, {
      global: {
        mocks: {
          $router: mockRouter
        },
        stubs: ['router-link']
      }
    })
  })

  // 🧩 1. Komponen ter-render
  it('renders About Us page correctly', () => {
    expect(wrapper.find('h1').text()).toBe('ABOUT PHOUR.TO')
    expect(wrapper.text()).toContain('Phour.to merupakan self photo studio and space di Pekanbaru')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  // 🧩 2. Tombol navigasi berfungsi
  it('calls router.back when back button is clicked', async () => {
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    expect(mockRouter.back).toHaveBeenCalled()
  })

  it('calls router.push("/") when home button is clicked', async () => {
    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

  // 🧩 3. feather.replace() terpanggil saat mounted
  it('calls feather.replace on mount', async () => {
    const feather = await import('feather-icons')
    expect(feather.default.replace).toHaveBeenCalled()
  })

  // 🧩 4. Tombol CTA muncul
  it('has a call-to-action button with correct text', () => {
    const ctaButton = wrapper.find('button.bg-white')
    expect(ctaButton.exists()).toBe(true)
    expect(ctaButton.text()).toContain('Go Grab Your Photos with Us!!!')
  })
})
