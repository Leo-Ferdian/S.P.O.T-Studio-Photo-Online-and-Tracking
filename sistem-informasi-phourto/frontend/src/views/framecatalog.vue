<script setup>
import { ref, onMounted } from 'vue';
import feather from 'feather-icons';

// Data statis sebagai contoh. Idealnya, opsi-opsi ini akan datang dari API.
const frameName = ref('');
const outlet = ref('');
const type = ref('');
const categories = ref('');

const outlets = ['Studio Sail', 'Studio Panam', 'Studio Marpoyan'];
const types = ['Basic Frame', 'Premium Frame'];
const categoryOptions = ['Minimalist', 'Vintage', 'Colorful'];

const handleSubmit = () => {
//     // TODO: Tambahkan logika untuk mencari frame berdasarkan filter
//     alert(Mencari frame dengan filter:\nNama: ${frameName.value}\nOutlet: ${outlet.value}\nType: ${type.value}\nCategories: ${categories.value});
};

onMounted(() => {
  feather.replace();
});
</script>

<template>
  <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
    <main class="container mx-auto px-4">
      <!-- Header Halaman -->
      <div class="flex items-center justify-between mb-12">
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <button @click="$router.back()" class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
              <i data-feather="arrow-left" class="w-6 h-6"></i>
            </button>
            <button @click="$router.push('/')" class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
              <i data-feather="home" class="w-6 h-6"></i>
            </button>
          </div>
        </div>
        <div class="flex-1"></div>
        <div class="flex-1"></div>
      </div>
      
      <!-- Konten Utama: Form Katalog Frame -->
      <div class="max-w-4xl mx-auto bg-primary text-white p-8 border-4 border-outline shadow-solid">
        <h1 class="text-3xl font-bold text-center mb-8">FRAME CATALOG</h1>

        <form @submit.prevent="handleSubmit" class="grid md:grid-cols-2 gap-x-8 gap-y-6 font-sans">
            <!-- Kolom Kiri -->
            <div class="space-y-6">
                <div>
                    <label for="frame-name" class="font-display font-bold">Frame Name</label>
                    <input v-model="frameName" type="text" id="frame-name" class="mt-1 w-full p-3 bg-white text-text-default border-3 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-outline">
                </div>
                 <div>
                    <label for="type" class="font-display font-bold">Type</label>
                    <select v-model="type" id="type" class="mt-1 w-full p-3 bg-white text-text-default border-3 border-outline shadow-solid appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-outline">
                        <option disabled value="">Pilih Tipe</option>
                        <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
                    </select>
                </div>
            </div>

            <!-- Kolom Kanan -->
            <div class="space-y-6">
                 <div>
                    <label for="outlet" class="font-display font-bold">Outlet</label>
                    <select v-model="outlet" id="outlet" class="mt-1 w-full p-3 bg-white text-text-default border-3 border-outline shadow-solid appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-outline">
                         <option disabled value="">Pilih Outlet</option>
                        <option v-for="o in outlets" :key="o" :value="o">{{ o }}</option>
                    </select>
                </div>
                 <div>
                    <label for="categories" class="font-display font-bold">Categories</label>
                    <select v-model="categories" id="categories" class="mt-1 w-full p-3 bg-white text-text-default border-3 border-outline shadow-solid appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-outline">
                         <option disabled value="">Pilih Kategori</option>
                        <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                </div>
            </div>

            <!-- Tombol Done -->
            <div class="md:col-span-2 flex justify-center pt-4">
                <button type="submit" class="bg-white text-text-default font-bold text-lg py-2 px-12 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                    Done
                </button>
            </div>
        </form>
      </div>

    </main>
  </div>
</template>