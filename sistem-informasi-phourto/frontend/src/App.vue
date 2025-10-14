<template>
  <div id="app" class="bg-gray-900 text-white min-h-screen">
    <header class="bg-gray-800 p-4 text-center">
      <nav class="space-x-4">
        <router-link to="/" class="hover:text-indigo-400">Home</router-link>
        <router-link to="/login" class="hover:text-indigo-400">Login</router-link>
        <router-link to="/register" class="hover:text-indigo-400">Register</router-link>
      </nav>
    </header>

    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>