<script setup>
    import { onMounted } from 'vue';
    import feather from 'feather-icons';
    import TittleBadge from '../components/common/TittleBadge.vue';
    import ActionButton from '../components/common/ActionButton.vue';
    import RoomCard from '../components/common/RoomCard.vue';
    import LocationButton from '../components/common/LocationButton.vue';

    // Data ini bisa diganti dengan data dari API nanti
    const rooms = [
        { name: 'RECAP POSE', image: 'https://placehold.co/400x500/000000/FFFFFF?text=Recap+Pose' },
        { name: 'TWIVOR', image: 'https://placehold.co/400x500/cccccc/000000?text=Twivor' },
        { name: 'KALA', image: 'https://placehold.co/400x500/999999/FFFFFF?text=Kala' },
        { name: 'FLOWER STUDIO', image: 'https://placehold.co/400x500/eeeeee/000000?text=Flower' },
    ];

    const locations = [
        "STUDIO SKA, Jl. Soekarno Hatta, Pekanbaru",
        "STUDIO PEKANBARU, Jl. Durian, Pekanbaru",
        "STUDIO MARPOYAN, Jl. Kaharudin Nst, Pekanbaru"
    ];

    onMounted(() => {
        feather.replace();
    });
</script>

<template>
    <div class="bg-background text-text-default pt-10">
        <!-- Navbar akan dipindahkan ke App.vue nanti -->
        <!-- ... -->

        <main class="container mx-auto px-4">
            <!-- Hero -->
            <section class="text-center"> <!-- py-10-->
                <h2 class="font-display text-2xl md:text-3xl font-bold">SELF PORTRAIT STUDIO AND SPACE PEKANBARU</h2>
            </section>

            <!-- Our Rooms -->
            <section class="py-5">
                <div class="text-center mb-8">
                    <TitleBadge text="OUR ROOMS" />
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <RoomCard v-for="room in rooms" :key="room.name" :room="room" />
                </div>
                <div class="text-center mt-8">
                    <ActionButton text="⭐ BOOK YOUR PHOTO SESSION NOW! ⭐" />
                </div>
            </section>

            <!-- Our Service -->
            <section class="py-10">
                <div class="text-center mb-8">
                    <TitleBadge text="OUR SERVICE" />
                </div>
                <div class="grid grid-cols-3 gap-6">
                    <div class="border-3 border-accent-green">
                        <img src="https://placehold.co/400x500/dddddd/000000?text=Group" alt="Service 1"
                            class="w-full h-auto" />
                    </div>
                    <div class="border-3 border-outline">
                        <img src="https://placehold.co/400x245/aaaaaa/000000?text=Recap" alt="Service 2"
                            class="w-full h-auto mb-6" />
                        <img src="https://placehold.co/400x245/bbbbbb/000000?text=Recap" alt="Service 3"
                            class="w-full h-auto" />
                    </div>
                    <div class="border-3 border-accent-blue">
                        <img src="https://placehold.co/400x500/eeeeee/000000?text=Pas+Foto" alt="Service 4"
                            class="w-full h-auto" />
                    </div>
                </div>
            </section>

            <!-- Inspiration -->
            <section class="py-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 class="font-display text-3xl leading-tight">EXPRESS YOUR STYLE WITH US AT PHOUR.TO</h3>
                    <p class="font-sans mt-4 mb-6"> Available premium room for your best pose with friends, family,
                        loved-one or even pet. </p>
                    <a href="#"
                        class="inline-block bg-white text-text-default font-bold py-3 px-6 border-3 border-outline shadow-solid hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100">Find
                        Your Inspiration Here 👉</a>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <img src="https://placehold.co/300x400/cccccc/000000?text=Pose1" alt="Inspiration 1"
                        class="border-3 border-outline" />
                    <img src="https://placehold.co/300x400/dddddd/000000?text=Pose2" alt="Inspiration 2"
                        class="border-3 border-outline" />
                    <img src="https://placehold.co/300x400/eeeeee/000000?text=Pose3" alt="Inspiration 3"
                        class="border-3 border-outline" />
                    <img src="https://placehold.co/300x400/fafafa/000000?text=Pose4" alt="Inspiration 4"
                        class="border-3 border-outline" />
                </div>
            </section>

            <!-- Location -->
            <section class="py-10">
                <div class="text-center mb-8">
                    <TitleBadge text="OUR LOCATION" />
                </div>
                <div class="space-y-4 max-w-2xl mx-auto">
                    <LocationButton v-for="loc in locations" :key="loc" :location="loc" />
                </div>
            </section>
        </main>

        <!-- Footer akan dipindahkan ke App.vue nanti -->
        <!-- ... -->
    </div>
</template>