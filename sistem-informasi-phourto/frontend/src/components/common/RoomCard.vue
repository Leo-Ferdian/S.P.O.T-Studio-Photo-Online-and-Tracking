<script setup>
    defineProps({
        room: Object // Berisi { name, image }
    });
</script>

<template>
    <div class="border-3 border-outline">
        <img :src="room.image" :alt="room.name" class="w-full h-auto object-cover" />
        <p class="font-display text-center bg-white p-2 border-t-3 border-outline">{{ room.name }}</p>
    </div>
</template>