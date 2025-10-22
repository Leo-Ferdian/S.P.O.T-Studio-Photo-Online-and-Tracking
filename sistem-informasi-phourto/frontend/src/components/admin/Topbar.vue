<script setup>
    import { ref, onMounted } from 'vue';
    import feather from 'feather-icons';

    const isLangOpen = ref(false);
    const isProfileOpen = ref(false);

    onMounted(() => feather.replace());
</script>

<template>
    <header class="bg-background flex items-center justify-between p-4 border-b-3 border-outline">
        <div class="flex items-center">
            <button class="mr-4"><i data-feather="menu"></i></button>
            <div class="relative">
                <input type="text" placeholder="Search..."
                    class="bg-primary text-white placeholder-yellow-200 font-sans px-4 py-2 border-2 border-outline shadow-solid focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-outline w-64">
            </div>
        </div>
        <div class="flex items-center space-x-6">
            <!-- Language Dropdown -->
            <div class="relative">
                <button @click="isLangOpen = !isLangOpen" class="flex items-center space-x-2">
                    <img src="https://flagcdn.com/gb.svg" width="24" alt="English Flag">
                    <span class="font-sans font-bold">English</span>
                    <i data-feather="chevron-down" class="w-4 h-4"></i>
                </button>
                <div v-if="isLangOpen" @click="isLangOpen = false"
                    class="absolute right-0 mt-2 w-48 bg-white text-black border-2 border-black shadow-solid font-sans rounded-md py-1">
                    <p class="px-4 py-2 text-xs text-gray-400">Select Language</p>
                    <a href="#" class="flex justify-between items-center px-4 py-2 hover:bg-gray-100">English <i
                            data-feather="check" class="w-4 h-4 text-green-500"></i></a>
                    <a href="#" class="flex justify-between items-center px-4 py-2 hover:bg-gray-100">Indonesia</a>
                </div>
            </div>
            <!-- Profile Dropdown -->
            <div class="relative">
                <button @click="isProfileOpen = !isProfileOpen" class="flex items-center space-x-2">
                    <img class="w-10 h-10 rounded-full border-2 border-black" src="https://placehold.co/40x40"
                        alt="Admin avatar">
                    <div>
                        <p class="font-sans font-bold text-sm">Moni Roy</p>
                        <p class="font-sans text-xs text-gray-600">Admin</p>
                    </div>
                    <i data-feather="chevron-down" class="w-4 h-4"></i>
                </button>
                <div v-if="isProfileOpen" @click="isProfileOpen = false"
                    class="absolute right-0 mt-2 w-48 bg-white text-black border-2 border-black shadow-solid font-sans rounded-md py-1">
                    <a href="#" class="flex items-center px-4 py-2 hover:bg-gray-100"><i data-feather="user"
                            class="w-4 h-4 mr-2"></i> Manage Account</a>
                    <a href="#" class="flex items-center px-4 py-2 hover:bg-gray-100"><i data-feather="lock"
                            class="w-4 h-4 mr-2"></i> Change Password</a>
                    <a href="#" class="flex items-center px-4 py-2 hover:bg-gray-100"><i data-feather="activity"
                            class="w-4 h-4 mr-2"></i> Activity Log</a>
                    <hr class="my-1">
                    <a href="#" class="flex items-center px-4 py-2 hover:bg-gray-100"><i data-feather="log-out"
                            class="w-4 h-4 mr-2"></i> Logout</a>
                </div>
            </div>
        </div>
    </header>
</template>