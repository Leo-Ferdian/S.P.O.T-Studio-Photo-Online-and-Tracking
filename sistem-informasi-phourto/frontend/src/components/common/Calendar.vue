<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import feather from 'feather-icons'

// Emit ke parent saat tanggal dipilih
const emit = defineEmits(['date-selected'])

// State utama
const currentDate = ref(new Date())
const selectedDate = ref(null)

// Hitungan dinamis
const currentMonth = computed(() =>
    currentDate.value.toLocaleString('default', { month: 'long' })
)
const currentYear = computed(() => currentDate.value.getFullYear())

const daysInMonth = computed(() => {
    const year = currentYear.value
    const month = currentDate.value.getMonth()
    const date = new Date(year, month, 1)
    const days = []

    while (date.getMonth() === month) {
        days.push(new Date(date))
        date.setDate(date.getDate() + 1)
    }

    return days
})

const firstDayOfMonth = computed(
    () => new Date(currentYear.value, currentDate.value.getMonth(), 1).getDay()
)

// Fungsi memilih tanggal
const selectDate = (day) => {
    selectedDate.value = day
    emit('date-selected', day)
}

// Navigasi bulan
const prevMonth = () => {
    currentDate.value = new Date(
        currentDate.value.setMonth(currentDate.value.getMonth() - 1)
    )
    refreshIcons()
}

const nextMonth = () => {
    currentDate.value = new Date(
        currentDate.value.setMonth(currentDate.value.getMonth() + 1)
    )
    refreshIcons()
}

// Refresh ikon Feather setelah render
const refreshIcons = () => {
    nextTick(() => feather.replace())
}

onMounted(() => feather.replace())
</script>

<template>
    <div class="bg-white text-black p-4 border-3 border-outline shadow-solid w-72 rounded-lg">
        <!-- Header Navigasi Bulan -->
        <div class="flex justify-between items-center mb-4">
            <button @click="prevMonth" class="p-1 hover:bg-yellow-200 rounded-full">
                <i data-feather="chevron-left" class="w-5 h-5"></i>
            </button>

            <div class="font-bold">
                {{ currentMonth }} {{ currentYear }}
            </div>

            <button @click="nextMonth" class="p-1 hover:bg-yellow-200 rounded-full">
                <i data-feather="chevron-right" class="w-5 h-5"></i>
            </button>
        </div>

        <!-- Header Hari -->
        <div class="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
            <div v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day">
                {{ day }}
            </div>
        </div>

        <!-- Grid Tanggal -->
        <div class="grid grid-cols-7 text-center">
            <div v-for="i in firstDayOfMonth" :key="'empty-' + i"></div>

            <div v-for="day in daysInMonth" :key="day.getDate()">
                <button @click="selectDate(day)"
                    class="w-8 h-8 flex items-center justify-center hover:bg-yellow-300 rounded-full" :class="{
                        'bg-primary text-text-inverse shadow-solid':
                            selectedDate?.toDateString() === day.toDateString()
                    }">
                    {{ day.getDate() }}
                </button>
            </div>
        </div>

        <!-- Footer -->
        <p class="text-xs text-center text-gray-400 mt-4">
            You can choose multiple date
        </p>
    </div>
</template>
