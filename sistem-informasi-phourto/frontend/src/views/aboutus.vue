<template>
  <div class="min-h-screen bg-background text-text-default flex flex-col font-display">

    <!-- Content -->
    <main class="flex flex-1 flex-col md:flex-row items-start justify-center px-6 md:px-16 py-10 gap-10">
      <!-- Left Posters -->
      <div class="flex flex-col gap-4 md:w-1/2 lg:w-1/3 items-center">
        <img
          src="https://images.unsplash.com/photo-1612831455542-1d92c5d15a0a?auto=format&fit=crop&w=800&q=80"
          alt="Studio Photo 1"
          class="w-full rounded-2xl shadow-lg object-cover"
        />
        <img
          src="https://images.unsplash.com/photo-1614284376484-6a00b24b9f41?auto=format&fit=crop&w=800&q=80"
          alt="Studio Photo 2"
          class="w-full rounded-2xl shadow-lg object-cover"
        />
      </div>

      <!-- Right Text -->
      <div class="flex-1 text-center md:text-left max-w-2xl">
        <h2 class="text-3xl font-bold mb-4">ABOUT PHOUR.TO</h2>

        <p class="text-base leading-relaxed mb-6">
          Phour.to merupakan self photo studio and space di Pekanbaru yang fokus menghadirkan hasil foto berkualitas tinggi
          dengan sentuhan kreatif. Kami percaya setiap momen punya cerita, dan lewat lensa kami, cerita itu bisa jadi lebih
          hidup, estetik, dan timeless.
        </p>

        <p class="text-base leading-relaxed mb-8">
          Kami siap bantu kamu mengabadikan momen dengan gaya yang profesional namun tetap fresh.
        </p>

        <button
          class="bg-text-inverse text-text-default font-bold px-6 py-3 rounded shadow-solid hover:translate-y-1 transition-transform"
        >
          Go Grab Your Photos with Us!!!
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-cream text-text-default border-t-3 border-outline py-8 px-8 grid md:grid-cols-4 gap-6">
      <div>
        <h3 class="font-bold mb-2">Our Profile</h3>
        <ul class="space-y-1 text-sm">
          <li>About Us</li>
          <li>Location</li>
          <li>Contact Person</li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold mb-2">Our Service</h3>
        <ul class="space-y-1 text-sm">
          <li>Basic Plan</li>
          <li>Premium Plan</li>
          <li>Res Foto</li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold mb-2">Claim Photos</h3>
        <ul class="space-y-1 text-sm">
          <li>Download Photos</li>
          <li>Print Photos</li>
        </ul>
      </div>

      <div class="flex flex-col items-center md:items-start">
        <div class="flex gap-3 text-lg">
          <a href="#" class="text-primary"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" class="text-black"><i class="fa-brands fa-tiktok"></i></a>
          <a href="#" class="text-accent-green"><i class="fa-brands fa-whatsapp"></i></a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Halaman statis, tidak butuh script logic khusus
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

main {
  margin-top: 2rem;
}
</style>
