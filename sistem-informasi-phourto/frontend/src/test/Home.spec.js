import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import feather from 'feather-icons'; // Import library yang akan di-mock

// Import komponen yang akan dites
// Sesuaikan path '..' jika lokasi file tes-mu berbeda
import HomeView from '../views/home.vue'; 

// Import komponen anak yang ingin kita cari (bukan stub)
import RoomCard from '../components/common/RoomCard.vue';
import LocationButton from '../components/common/LocationButton.vue';

// 1. MOCKING:
// Kita mock 'feather-icons' agar tes tidak error
// karena 'replace' tidak ada di lingkungan tes (jsdom)
vi.mock('feather-icons', () => ({
  // Karena di <script> kamu memanggil 'feather.replace()', 
  // kita mock 'default' export-nya
  default: {
    replace: vi.fn(), // vi.fn() adalah fungsi mock
  },
}));

// 2. DESKRIPSI TEST SUITE:
describe('HomeView.vue', () => {
  let wrapper;

  // 3. SETUP:
  // beforeEach berjalan sebelum setiap 'it' (tes individu)
  beforeEach(() => {
    // Bersihkan riwayat panggilan mock sebelumnya
    feather.replace.mockClear();

    // Mount komponen
    wrapper = mount(HomeView, {
      global: {
        // Kita stub <router-link> agar tidak error
        // Kita juga stub komponen anak yang tidak relevan
        stubs: {
          'router-link': RouterLinkStub,
          'TitleBadge': true, // Stub komponen TitleBadge
          'ActionButton': true, // Stub komponen ActionButton
        },
      },
    });
  });

  // 4. DAFTAR 5 TEST CASE:

  // Tes ke-1: Merender teks statis (Hero)
  it('merender heading utama (hero) dengan benar', () => {
    const heading = wrapper.find('h2');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe('SELF PORTRAIT STUDIO AND SPACE PEKANBARU');
  });

  // Tes ke-2: Merender list berdasarkan data (Rooms)
  it('merender jumlah RoomCard yang benar (4) berdasarkan data rooms', () => {
    // Data 'rooms' di komponenmu memiliki 4 item
    const roomCards = wrapper.findAllComponents(RoomCard);
    expect(roomCards.length).toBe(4);
  });

  // Tes ke-3: Merender list berdasarkan data (Locations)
  it('merender jumlah LocationButton yang benar (3) berdasarkan data locations', () => {
    // Data 'locations' di komponenmu memiliki 3 item
    const locationButtons = wrapper.findAllComponents(LocationButton);
    expect(locationButtons.length).toBe(3);
  });

  // Tes ke-4: Mengecek link routing (Our Service)
  it('merender link "Our Service" dengan path (to) yang benar', () => {
    // Cari semua stub <router-link>
    const links = wrapper.findAllComponents(RouterLinkStub);

    // Filter link yang menuju ke halaman service
    const serviceLinks = links.filter(link =>
      link.props('to').startsWith('/service/')
    );

    // Harusnya ada 3 link service
    expect(serviceLinks.length).toBe(3);
    
    // Cek path tujuannya satu per satu
    expect(serviceLinks[0].props('to')).toBe('/service/basic-ramean');
    expect(serviceLinks[1].props('to')).toBe('/service/basic-ramean');
    expect(serviceLinks[2].props('to')).toBe('/service/pas-foto');
  });

  // Tes ke-5: Mengecek side effect (onMounted)
  it('memanggil feather.replace() saat komponen di-mount', () => {
    // 'wrapper' sudah di-mount di 'beforeEach'
    // Kita hanya perlu cek apakah fungsi mock-nya dipanggil
    expect(feather.replace).toHaveBeenCalledTimes(1);
  });
});