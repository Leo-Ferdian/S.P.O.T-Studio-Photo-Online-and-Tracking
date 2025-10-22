<template>
    <aside class="w-64 bg-background text-text-default p-6 flex flex-col font-display">
        <h1 class="font-display text-4xl font-bold relative mb-12">
            Phour<span class="text-primary text-5xl absolute -bottom-2 -right-6 transform -rotate-12">to</span>
        </h1>
        <nav class="space-y-2">
            <div>
                <span class="text-xs text-gray-500">MAIN</span>
                <router-link to="/admin/dashboard"
                    class="flex items-center p-3 rounded-lg text-white bg-primary border-2 border-outline shadow-solid mt-1">Dashboard</router-link>
            </div>
            <div>
                <span class="text-xs text-gray-500">PAGES</span>
                <div class="space-y-1 mt-1 font-sans font-bold">
                    <router-link to="/admin/bookings"
                        class="block p-3 hover:bg-yellow-300 rounded-lg">Bookings</router-link>
                    <router-link to="/admin/users" class="block p-3 hover:bg-yellow-300 rounded-lg">Users</router-link>
                    <router-link to="/admin/packages"
                        class="block p-3 hover:bg-yellow-300 rounded-lg">Packages</router-link>
                    <router-link to="/admin/gallery"
                        class="block p-3 hover:bg-yellow-300 rounded-lg">Gallery</router-link>
                </div>
            </div>
            <div>
                <span class="text-xs text-gray-500">SETTINGS</span>
                <div class="space-y-1 mt-1 font-sans font-bold">
                    <router-link to="/admin/settings"
                        class="block p-3 hover:bg-yellow-300 rounded-lg">Settings</router-link>
                    <button class="w-full text-left p-3 hover:bg-yellow-300 rounded-lg">Logout</button>
                </div>
            </div>
        </nav>
    </aside>
</template>