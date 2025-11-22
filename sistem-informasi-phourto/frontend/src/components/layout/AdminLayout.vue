<script setup>
import Sidebar from '../admin/Sidebar.vue';
// import Topbar from '../admin/Topbar.vue';
</script>

<template>
    <div class="flex h-screen bg-background">
        <Sidebar />
        <div class="flex-1 flex flex-col overflow-hidden">
            <Topbar />
            <main class="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
                <router-view />
            </main>
        </div>
    </div>
</template>