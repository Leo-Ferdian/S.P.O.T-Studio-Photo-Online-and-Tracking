<script setup>
    import { ref, computed } from 'vue';

    const emit = defineEmits(['date-selected']);

    const currentDate = ref(new Date());

    const currentMonth = computed(() => currentDate.value.toLocaleString('default', { month: 'long' }));
    const currentYear = computed(() => currentDate.value.getFullYear());

    const daysInMonth = computed(() => {
        const year = currentYear.value;
        const month = currentDate.value.getMonth();
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    });

    const firstDayOfMonth = computed(() => new Date(currentYear.value, currentDate.value.getMonth(), 1).getDay());

    const selectDate = (day) => {
        emit('date-selected', day);
    };

    const prevMonth = () => {
        currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1));
    };

    const nextMonth = () => {
        currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1));
    };
</script>

<template>
    <div class="bg-white text-black p-4 border-2 border-black font-sans w-72">
        <div class="flex justify-between items-center mb-4">
            <button @click="prevMonth" class="p-1 hover:bg-gray-200 rounded-full">&lt;</button>
            <div class="font-bold">{{ currentMonth }} {{ currentYear }}</div>
            <button @click="nextMonth" class="p-1 hover:bg-gray-200 rounded-full">&gt;</button>
        </div>
        <div class="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
            <div v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day">{{ day }}</div>
        </div>
        <div class="grid grid-cols-7 text-center">
            <div v-for="i in firstDayOfMonth" :key="'empty-' + i"></div>
            <div v-for="day in daysInMonth" :key="day.getDate()">
                <button @click="selectDate(day)"
                    class="w-8 h-8 flex items-center justify-center hover:bg-yellow-300 rounded-full">
                    {{ day.getDate() }}
                </button>
            </div>
        </div>
        <p class="text-xs text-center text-gray-400 mt-4">You can choose multiple date</p>
    </div>
</template>