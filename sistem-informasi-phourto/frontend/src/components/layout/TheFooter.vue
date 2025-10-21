<script setup>
    import { onMounted } from 'vue';
    import feather from 'feather-icons';

    onMounted(() => {
        feather.replace();
    });
</script>

<template>
    <footer class="bg-white text-text-default mt-16 p-8 border-t-3 border-outline">
        <div class="container mx-auto grid md:grid-cols-3 items-start md:items-center">
            <div class="mb-8 md:mb-0">
                <router-link to="/" class="font-display text-4xl font-bold relative inline-block">
                    Phour<span class="text-primary text-5xl absolute -bottom-2 -right-6 transform -rotate-12">to</span>
                    <span
                        class="absolute top-0 right-0 text-[8px] leading-none font-sans font-bold w-16 text-right">we'll
                        partner<br>with our<br>best</span>
                </router-link>
            </div>

            <div class="grid grid-cols-3 gap-8 font-display my-8 md:my-0 text-sm">
                <div>
                    <h4 class="font-bold mb-3 text-base">Our Profile</h4>
                    <ul class="space-y-1.5 text-gray-700">
                        <li><router-link to="/about" class="hover:text-primary">About Us</router-link></li>
                        <li><router-link to="/location" class="hover:text-primary">Location</router-link></li>
                        <li><router-link to="/contact" class="hover:text-primary">Contact Person</router-link></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-3 text-base">Our Service</h4>
                    <ul class="space-y-1.5 text-gray-700">
                        <li><router-link to="/packages/basic" class="hover:text-primary">Basic Plan</router-link></li>
                        <li><router-link to="/packages/ramean" class="hover:text-primary">Ramean Plan</router-link></li>
                        <li><router-link to="/services/pasfoto" class="hover:text-primary">Pas Foto</router-link></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-3 text-base">Claim Photos</h4>
                    <ul class="space-y-1.5 text-gray-700">
                        <li><router-link to="/claim" class="hover:text-primary">Download Photos</router-link></li>
                        <li><router-link to="/print" class="hover:text-primary">Print Photos</router-link></li>
                    </ul>
                </div>
            </div>

            <div class="flex justify-start md:justify-end space-x-4">
                <a href="#"
                    class="bg-black text-cream p-2 rounded-full border-2 border-black hover:bg-gray-800 transition-colors">
                    <i data-feather="voicemail" class="w-5 h-5"></i> </a>
                <a href="#"
                    class="bg-black text-cream p-2 rounded-full border-2 border-black hover:bg-gray-800 transition-colors">
                    <i data-feather="instagram" class="w-5 h-5"></i>
                </a>
                <a href="#"
                    class="bg-black text-cream p-2 rounded-full border-2 border-black hover:bg-gray-800 transition-colors">
                    <i data-feather="message-circle" class="w-5 h-5"></i> </a>
            </div>
        </div>
    </footer>
</template>