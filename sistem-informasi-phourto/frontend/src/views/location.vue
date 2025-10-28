<script setup>
import { ref, onMounted } from 'vue';
// import apiClient from '../api/api'; // (Masih dimatikan)
import feather from 'feather-icons';

// 1. IMPORT LEAFLET (Tidak berubah)
import "leaflet/dist/leaflet.css";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LIcon,
  LCircleMarker,
  LTooltip
} from "@vue-leaflet/vue-leaflet";
import L from 'leaflet';

const branches = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);

// 2. FIX ICON MARKER (Tidak berubah)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const fixedIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
// Selesai fix icon


// 3. TENTUKAN "RENCANA B" (FALLBACK) (Tidak berubah)
const defaultCenter = [0.5177497414788308, 101.44742656175134];
const defaultZoom = 12;

const mapCenter = ref(defaultCenter);
const mapZoom = ref(defaultZoom);

// 'ref' untuk MENYIMPAN lokasi user (Tidak berubah)
const userLocation = ref(null);


// 4. FUNGSI GET USER LOCATION (Tidak berubah)
const getUserLocation = () => {
  if ("geolocation" in navigator) {
    console.log("Meminta izin user...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Lokasi user ditemukan: ${latitude}, ${longitude}`);
        
        mapCenter.value = [latitude, longitude];
        mapZoom.value = 13;
        userLocation.value = [latitude, longitude];
      },
      (error) => {
        console.warn(`Gagal mendapatkan lokasi user (Kode: ${error.code}): ${error.message}`);
      }
    );

  } else {
    console.warn("Browser ini tidak support Geolocation.");
  }
};


// 5. DATA PALSU (MOCK DATA) - ▼▼▼ KITA EDIT DI SINI ▼▼▼
// Kita tambahkan 'gmapsUrl' sesuai link yang kamu kasih
const mockBranchData = [
  {
    id: 1,
    name: "Phour.to Studio Sail",
    address: "Jl. Soerkarno Hatta",
    city: "Pekanbaru",
    latitude: 0.5265268476275768,
    longitude: 101.46211969858643,
    slug: 'studio-sail',
    gmapsUrl: 'https://maps.app.goo.gl/kFypLspgaaKQastc7' // Link Sail
  },
  {
    id: 2,
    name: "Phour.to Studio Panam",
    address: "Jl. Bangau Sakti",
    city: "Pekanbaru",
    latitude: 0.48334309706418865,
    longitude: 101.37600242475055,
    slug: 'studio-panam',
    gmapsUrl: 'https://maps.app.goo.gl/vGS8SM3p2Dz4rbUJ9' // Link Panam
  },
  {
    id: 3,
    name: "Phour.to Studio Marpoyan",
    address: "Jl. Kaharudin Nst",
    city: "Pekanbaru",
    latitude: 0.45737970178812026,
    longitude: 101.46174126015526,
    slug: 'studio-marpoyan',
    gmapsUrl: 'https://maps.app.goo.gl/3MMp1B4N7W5BYY6k6' // Link Marpoyan
  }
];
//


// 6. onMounted (Tidak berubah)
onMounted(() => {
  getUserLocation();
  isLoading.value = true;
  errorMessage.value = null;
  setTimeout(() => {
    branches.value = mockBranchData;
    isLoading.value = false;
  }, 1000);
  setTimeout(() => feather.replace(), 50);
});
</script>

<template>
  <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
    <main class="container mx-auto px-4">

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
          <h1 class="text-3xl font-bold">LOCATION</h1>
        </div>
        <div class="flex-1"></div>
      </div>

      <div v-if="isLoading" class="text-center py-16">
        <p>Loading map and locations...</p>
      </div>
      <div v-else-if="errorMessage"
        class="text-center py-16 bg-primary/20 text-primary border-2 border-primary p-4">
        {{ errorMessage }}
      </div>

      <div v-else class="w-full h-[60vh] border-4 border-outline">
        <l-map 
          ref="map" 
          v-model:zoom="mapZoom" 
          :center="mapCenter"
          :use-global-leaflet="false" 
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          ></l-tile-layer>

          <l-circle-marker
            v-if="userLocation"
            :lat-lng="userLocation"
            :radius="8"
            color="#B91C1C"       
            :fill-opacity="0.8"
            fill-color="#EF4444"
          >
            <l-tooltip :sticky="true">
              Lokasi Anda Saat Ini
            </l-tooltip>
          </l-circle-marker>

          <l-marker 
            v-for="branch in branches" 
            :key="branch.id"
            :lat-lng="[branch.latitude, branch.longitude]"
          >
            <l-icon :icon-anchor="fixedIcon.options.iconAnchor" :icon-url="fixedIcon.options.iconUrl" :shadow-url="fixedIcon.options.shadowUrl"></l-icon>
            
            <l-popup>
              <div class="font-display" style="display: flex; flex-direction: column; gap: 8px; min-width: 200px;">
                
                <div>
                  <h3 class="font-bold text-lg" style="margin-bottom: 4px;">{{ branch.name }}</h3>
                  <p class="font-sans text-sm">{{ branch.address }}, {{ branch.city }}</p>
                </div>
                
                <router-link 
                  :to="`/location/${branch.slug}`" 
                  class="text-blue-600 font-bold text-sm"
                  style="text-decoration: underline;"
                >
                  Lihat Detail
                </router-link>

                <a 
                  :href="branch.gmapsUrl" 
                  target="_blank" 
                  class="text-green-600 font-bold text-sm"
                  style="text-decoration: underline;"
                >
                  Buka di Google Maps
                </a>

                </div>
            </l-popup>
            </l-marker>

        </l-map>
      </div>

    </main>
  </div>
</template>

<style>
@import "leaflet/dist/leaflet.css";
</style>