<script setup>
    defineProps({
        text: String
    });
</script>

<template>
    <span class="inline-block bg-primary text-text-default px-6 py-2 border-3 border-outline shadow-solid font-display">
        {{ text }}
    </span>
</template>