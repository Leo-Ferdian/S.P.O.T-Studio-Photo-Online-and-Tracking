<script setup>
    defineProps({
        text: String
    });
</script>

<template>
    <button
        class="bg-primary text-text-default text-xl px-8 py-3 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100 font-display">
        {{ text }}
    </button>
</template>