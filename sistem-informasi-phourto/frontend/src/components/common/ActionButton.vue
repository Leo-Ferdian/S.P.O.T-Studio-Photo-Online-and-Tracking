<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

// 1. Definisikan semua "opsi" (props) yang bisa diterima tombol ini
const props = defineProps({
    // Jika 'to' diberikan, tombol ini akan menjadi <router-link>
    to: {
        type: String,
        default: null
    },
    // Jika 'href' diberikan, tombol ini akan menjadi <a>
    href: {
        type: String,
        default: null
    },
    // Untuk gaya warna (merah vs putih)
    variant: {
        type: String,
        default: 'primary' // 'primary' (merah) atau 'secondary' (putih)
    },
    // Untuk ukuran (CTA besar vs tombol nav kecil)
    size: {
        type: String,
        default: 'medium' // 'small', 'medium', 'large', 'location'
    }
});

// 2. Tentukan tag apa yang harus digunakan (logika inti)
const componentType = computed(() => {
    if (props.to) return RouterLink;
    if (props.href) return 'a';
    return 'button';
});

// 3. Tentukan kelas CSS secara dinamis berdasarkan props
const buttonClasses = computed(() => [
    'btn', // Kelas dasar
    `btn-variant-${props.variant}`, // Kelas untuk warna
    `btn-size-${props.size}` // Kelas untuk ukuran
]);
</script>

<template>
    <component :is="componentType" :to="to" :href="href" :class="buttonClasses">
        <slot />
    </component>
</template>

<style lang="postcss" scoped>
/* 6. Kita pindahkan SEMUA style tombol dari home.vue ke sini
     agar terpusat.
*/

/* Gaya dasar untuk SEMUA tombol */
.btn {
    @apply inline-block font-bold border-3 border-outline shadow-solid transition-all duration-100;
    @apply active:shadow-none active:translate-x-0.5 active:translate-y-0.5;
}

/* --- VARIAN WARNA --- */
.btn-variant-primary {
    @apply bg-primary text-text-default hover:bg-red-600;
}

.btn-variant-secondary {
    @apply bg-white text-text-default hover:bg-gray-200;
}

/* --- VARIASI UKURAN --- */
/* (btn-nav di home.vue) */
.btn-size-small {
    @apply px-4 py-1;
}

/* (btn-secondary di home.vue) */
.btn-size-medium {
    @apply py-3 px-6;
}

/* (btn-cta di home.vue) */
.btn-size-large {
    @apply text-xl px-8 py-3;
}

/* (btn-location di home.vue) */
.btn-size-location {
    @apply w-full flex items-center space-x-4 p-4 text-left;
}
</style>