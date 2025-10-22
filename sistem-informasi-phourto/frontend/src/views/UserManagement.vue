<template>
  <div class="bg-yellow-400 min-h-screen p-10 text-center">
    <h1 class="text-3xl font-bold text-red-600 mb-6">Users Management</h1>

    <div class="bg-red-500 p-5 rounded-xl w-96 mx-auto text-left mb-8">
      <h2 class="text-lg text-white mb-3 font-mono">Add User</h2>
      <form @submit.prevent="addUser">
        <label class="block text-white text-sm">Name</label>
        <input v-model="newUser.name" class="w-full p-2 mb-3 rounded border" placeholder="Enter name" />

        <label class="block text-white text-sm">Booking Code</label>
        <input v-model="newUser.booking_code" class="w-full p-2 mb-3 rounded border" placeholder="Enter code" />

        <button class="bg-yellow-300 px-4 py-2 rounded font-bold hover:bg-yellow-200">Save</button>
      </form>
    </div>

    <div class="bg-red-200 p-5 rounded-xl w-4/5 mx-auto">
      <h2 class="font-bold text-lg mb-3">Gallery</h2>
      <div class="grid grid-cols-4 gap-4">
        <div v-for="user in users" :key="user.id" class="bg-white p-3 rounded shadow">
          <img src="/placeholder.png" alt="User" class="w-full h-32 object-cover mb-2 rounded" />
          <p class="font-bold text-sm">{{ user.name }}</p>
          <p class="text-xs text-gray-500">Code: {{ user.booking_code }}</p>
          <button @click="deleteUser(user.id)" class="mt-2 bg-red-500 text-white px-3 py-1 rounded text-xs">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';

const users = ref([]);
const newUser = ref({ name: '', booking_code: '' });

const fetchUsers = async () => {
  const res = await axios.get('/api/users');
  users.value = res.data;
};

const addUser = async () => {
  await axios.post('/api/users', newUser.value);
  newUser.value = { name: '', booking_code: '' };
  fetchUsers();
};

const deleteUser = async (id) => {
  await axios.delete(`/api/users/${id}`);
  fetchUsers();
};

onMounted(fetchUsers);
</script>
