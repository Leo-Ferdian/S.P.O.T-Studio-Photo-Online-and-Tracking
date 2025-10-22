<script setup>
    defineProps({
        location: String
    });
</script>

<template>
    <button
        class="w-full flex items-center space-x-4 bg-primary text-text-default text-left p-4 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">
        <i data-feather="map-pin" class="w-6 h-6"></i>
        <span class="font-bold">{{ location }}</span>
    </button>
</template>