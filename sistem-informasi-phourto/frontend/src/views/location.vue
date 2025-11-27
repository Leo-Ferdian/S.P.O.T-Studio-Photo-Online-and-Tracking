<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api/api';
import feather from 'feather-icons';

// --- Leaflet ---
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

// --- State ---
const branches = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);

// --- Fix Icon Marker ---
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const fixedIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- Map State ---
const defaultCenter = [0.5177497414788308, 101.44742656175134];
const defaultZoom = 12;

const mapCenter = ref(defaultCenter);
const mapZoom = ref(defaultZoom);
const userLocation = ref(null);

// --- Dapatkan Lokasi User ---
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
    console.warn("Browser ini tidak mendukung Geolocation.");
  }
};

// --- Data tambahan untuk branch (koordinat, slug, dll.) ---
const branchExtraData = {
  'c4e3d584-9123-49e9-b644-413db743ca33': {
    latitude: 0.5265268476275768,
    longitude: 101.46211969858643,
    city: "Pekanbaru",
    gmapsUrl: 'https://maps.app.goo.gl/kFypLspgaaKQastc7',
    slug: 'studio-sail',
  },
  'f5534e4c-13d5-436a-9624-3705ef1fc989': {
    latitude: 0.48334309706418865,
    longitude: 101.37600242475055,
    city: "Pekanbaru",
    gmapsUrl: 'https://maps.app.goo.gl/vGS8SM3p2Dz4rbUJ9',
    slug: 'studio-panam',
  },
  'f0bce5e9-4842-42cf-ad97-979c2d57cd32': {
    latitude: 0.45737970178812026,
    longitude: 101.46174126015526,
    city: "Pekanbaru",
    gmapsUrl: 'https://maps.app.goo.gl/3MMp1B4N7W5BYY6k6',
    slug: 'studio-marpoyan',
  },
};

// --- Lifecycle: Ambil data cabang dari API ---
onMounted(async () => {
  getUserLocation();
  isLoading.value = true;
  errorMessage.value = null;

  try {
    // Ambil data dari API
    const response = await apiClient.get('/branches');
    const apiBranches = response.data.data;

    // Gabungkan data API dengan data tambahan
    const mergedBranches = apiBranches
      .map(apiBranch => {
        const extraData = branchExtraData[apiBranch.branch_id];
        if (!extraData) {
          console.warn(`Koordinat untuk ${apiBranch.branch_name} (ID: ${apiBranch.branch_id}) tidak ditemukan.`);
          return null;
        }
        return {
          id: apiBranch.branch_id,
          name: apiBranch.branch_name,
          address: apiBranch.address,
          city: extraData.city,
          latitude: extraData.latitude,
          longitude: extraData.longitude,
          gmapsUrl: extraData.gmapsUrl,
          slug: extraData.slug,
        };
      })
      .filter(Boolean);

    branches.value = mergedBranches;
  } catch (error) {
    console.error("Gagal mengambil data studio:", error);
    errorMessage.value = "Gagal memuat lokasi studio. Silakan coba lagi nanti.";
  } finally {
    isLoading.value = false;
  }

  setTimeout(() => feather.replace(), 50);
});
</script>

<template>
  <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
    <main class="container mx-auto px-4">

      <!-- Header -->
      <div class="flex items-center justify-between mb-12">
  
  <!-- Tombol Back di kiri -->
  <div class="flex-1">
    <button @click="$router.back()"
      class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:translate-y-1 hover:shadow-none transition-all">
      <i data-feather="arrow-left" class="w-6 h-6"></i>
    </button>
  </div>

  <!-- Judul di tengah -->
  <div class="flex-1 text-center">
    <h1 class="text-3xl font-bold">LOCATION</h1>
  </div>

  <!-- Tombol Home di kanan -->
  <div class="flex-1 flex justify-end">
    <button @click="$router.push('/Home')"
      class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:translate-y-1 hover:shadow-none transition-all">
      <i data-feather="home" class="w-6 h-6"></i>
    </button>
  </div>


      </div>

      <!-- Loading & Error -->
      <div v-if="isLoading" class="text-center py-16">
        <p>Memuat peta dan lokasi...</p>
      </div>

      <div v-else-if="errorMessage" class="text-center py-16 bg-primary/20 text-primary border-2 border-primary p-4">
        {{ errorMessage }}
      </div>

      <!-- Map -->
      <div v-else class="w-full h-[60vh] border-4 border-outline">
        <l-map ref="map" v-model:zoom="mapZoom" :center="mapCenter" :use-global-leaflet="false">
          <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OpenStreetMap"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'></l-tile-layer>

          <!-- User Location -->
          <l-circle-marker v-if="userLocation" :lat-lng="userLocation" :radius="8" color="#B91C1C" fill-color="#EF4444"
            :fill-opacity="0.8">
            <l-tooltip :sticky="true">Lokasi Anda Saat Ini</l-tooltip>
          </l-circle-marker>

          <!-- Branch Markers -->
          <l-marker v-for="branch in branches" :key="branch.id" :lat-lng="[branch.latitude, branch.longitude]">
            <l-icon :icon-anchor="fixedIcon.options.iconAnchor" :icon-url="fixedIcon.options.iconUrl"
              :shadow-url="fixedIcon.options.shadowUrl"></l-icon>

            <l-popup>
              <div class="font-display flex flex-col gap-2 min-w-[200px]">
                <div>
                  <h3 class="font-bold text-lg mb-1">{{ branch.name }}</h3>
                  <p class="font-sans text-sm">{{ branch.address }}, {{ branch.city }}</p>
                </div>

                <router-link :to="`/location/${branch.slug}`" class="text-blue-600 font-bold text-sm underline">
                  Lihat Detail
                </router-link>

                <a :href="branch.gmapsUrl" target="_blank" class="text-green-600 font-bold text-sm underline">
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
