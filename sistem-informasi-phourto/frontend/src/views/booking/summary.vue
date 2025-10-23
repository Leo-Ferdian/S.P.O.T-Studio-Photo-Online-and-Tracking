<script setup>
    import { onMounted, computed, ref } from 'vue'; // Tambahkan ref
    import { useBookingStore } from '../../stores/booking.stores'; // Perbaiki path
    import feather from 'feather-icons';
    import { useRouter } from 'vue-router';
    import apiClient from '../../api/api'; // Impor apiClient

    const bookingStore = useBookingStore();
    const router = useRouter();
    const isLoading = ref(false); // Tambahkan state loading

    // Format tanggal dari store
    const formattedDate = computed(() => {
        if (!bookingStore.selectedDate) return 'N/A';
        // Pastikan selectedDate adalah objek Date
        const dateObj = bookingStore.selectedDate instanceof Date ? bookingStore.selectedDate : new Date(bookingStore.selectedDate);
        return dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    });

    // Fungsi untuk melanjutkan ke pembayaran
    const proceedToPayment = async () => {
        isLoading.value = true; // Mulai loading
        try {
            // --- INI ADALAH LOGIKA UTAMA ---
            // 1. Ambil semua data booking dari store
            const bookingPayload = {
                // user_id diambil dari authStore di backend (tidak perlu dikirim dari frontend)
                branch_id: bookingStore.selectedBranch?.id, // Pastikan ID ada
                package_id: bookingStore.selectedPackage?.id, // Pastikan ID ada
                booking_time: `${new Date(bookingStore.selectedDate).toISOString().split('T')[0]} ${bookingStore.selectedTime}:00`, // Format YYYY-MM-DD HH:MM:SS
                // Kirim detail customer & add-ons jika backend memerlukannya
                customer_name: bookingStore.customerDetails.name,
                customer_email: bookingStore.customerDetails.email,
                customer_whatsapp: bookingStore.customerDetails.whatsapp,
                customer_instagram: bookingStore.customerDetails.instagram,
                selected_background: bookingStore.selectedBackground,
                additional_people: bookingStore.additionalPeople,
                total_amount: bookingStore.grandTotal // Kirim total akhir
            };

            // Validasi data sebelum kirim
            if (!bookingPayload.branch_id || !bookingPayload.package_id || !bookingPayload.booking_time || !bookingPayload.customer_name) {
                throw new Error("Data booking tidak lengkap.");
            }

            // 2. Panggil API backend untuk MEMBUAT booking
            console.log("Mengirim data booking ke backend:", bookingPayload);
            const bookingResponse = await apiClient.post('/bookings', bookingPayload);
            const newBooking = bookingResponse.data.data;
            console.log("Booking berhasil dibuat:", newBooking);

            // 3. Panggil API backend untuk MEMBUAT TRANSAKSI DOKU
            // Diasumsikan endpointnya /bookings/:id/pay
            console.log(`Memulai pembayaran untuk booking ID: ${newBooking.id}`);
            // const paymentResponse = await apiClient.post(`/bookings/${newBooking.id}/pay`, { paymentType: 'QRIS_DOKU' });
            // const paymentInfo = paymentResponse.data.data;
            // console.log("Info pembayaran DOKU:", paymentInfo);

            // --- AKHIR LOGIKA UTAMA ---


            // --- SIMULASI PEMBAYARAN SUKSES (Hapus ini jika API sudah jalan) ---
            console.log("Simulasi: Pembayaran dianggap berhasil.");
            await new Promise(resolve => setTimeout(resolve, 1500)); // Delay simulasi
            // --- AKHIR SIMULASI ---

            // 4. Jika semua berhasil, arahkan ke halaman Success
            router.push('/booking/success');

            // 5. Reset state booking di Pinia setelah berhasil
            bookingStore.resetBooking();

        } catch (error) {
            console.error("Failed to proceed to payment:", error);
            alert(`Gagal memproses pesanan: ${error.response?.data?.message || error.message || 'Silakan coba lagi.'}`);
            // Jangan reset store jika gagal, agar pengguna bisa mencoba lagi
        } finally {
            isLoading.value = false; // Selesai loading
        }
    };

    onMounted(() => {
        feather.replace();
        // Validasi data booking saat halaman dimuat
        if (!bookingStore.selectedPackage || !bookingStore.selectedDate || !bookingStore.selectedTime) {
            console.warn("Data booking tidak lengkap, mengarahkan kembali ke home...");
            router.push('/'); // Arahkan ke home jika data penting hilang
        }
    });
</script>

<template>
    <div class="bg-background min-h-screen font-display text-text-default pt-24 pb-12">
        <main class="container mx-auto px-4">
            <!-- Header Halaman -->
            <div class="flex items-center justify-between mb-12">
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <!-- Tombol kembali sekarang mengarah ke halaman konfirmasi -->
                        <button @click="$router.push('/booking/confirm')"
                            class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                            <i data-feather="arrow-left" class="w-6 h-6"></i>
                        </button>
                        <button @click="$router.push('/')"
                            class="p-2 bg-primary text-text-default border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                            <i data-feather="home" class="w-6 h-6"></i>
                        </button>
                    </div>
                </div>
                <div class="flex-1 text-center">
                    <h1 class="text-3xl font-bold">SUMMARY</h1>
                </div>
                <div class="flex-1"></div>
            </div>

            <!-- Konten Utama: Ringkasan Read-Only -->
            <div class="grid md:grid-cols-2 gap-8 items-start">
                <!-- Kolom Kiri: Detail Booking -->
                <div class="space-y-4">
                    <h2 class="text-2xl font-bold">{{ bookingStore.selectedBranch?.name || 'N/A' }}<br>{{
                        bookingStore.selectedPackage?.room || 'N/A' }}</h2>

                    <!-- Card Jadwal (Read-Only) -->
                    <div class="bg-white border-3 border-outline p-4">
                        <div class="font-sans">
                            <p class="font-bold text-lg">{{ formattedDate }}</p>
                            <p class="font-bold text-lg">{{ bookingStore.selectedTime || '--:--' }}</p>
                            <p class="text-sm text-gray-600">Asia/Jakarta</p>
                        </div>
                    </div>

                    <!-- Card Paket (Read-Only) -->
                    <div class="bg-white border-3 border-outline p-4">
                        <div class="font-sans">
                            <p class="font-bold text-lg">{{ bookingStore.selectedPackage?.duration || 0 }} Menit</p>
                            <p class="text-sm text-gray-600">{{ bookingStore.selectedBranch?.name }} {{
                                bookingStore.selectedPackage?.room }}</p>
                            <p class="font-bold text-lg mt-2">Rp {{ (bookingStore.selectedPackage?.price ||
                                0).toLocaleString('id-ID') }}</p>
                        </div>
                    </div>

                    <!-- Detail Pelanggan (Read-Only) -->
                    <div class="bg-white border-3 border-outline p-4 font-sans text-sm space-y-1">
                        <p><span class="font-bold">Nama:</span> {{ bookingStore.customerDetails.name || 'N/A' }}</p>
                        <p><span class="font-bold">Email:</span> {{ bookingStore.customerDetails.email || 'N/A' }}</p>
                        <p><span class="font-bold">Whatsapp:</span> {{ bookingStore.customerDetails.whatsapp || 'N/A' }}
                        </p>
                        <p><span class="font-bold">Instagram:</span> {{ bookingStore.customerDetails.instagram || 'N/A'
                            }}</p>
                        <p><span class="font-bold">Background:</span> {{ bookingStore.selectedBackground || 'N/A' }}</p>
                    </div>
                </div>

                <!-- Kolom Kanan: Ringkasan Add-ons & Total -->
                <div class="space-y-4">
                    <!-- Card Tambahan Orang (Read-Only) -->
                    <div v-if="bookingStore.additionalPeople > 0"
                        class="bg-primary text-white p-4 border-3 border-outline shadow-solid font-sans">
                        <h3 class="font-display font-bold text-lg">-TAMBAHAN ORANG</h3>
                        <div class="flex justify-between items-center mt-2">
                            <span>{{ bookingStore.additionalPeople }} orang x Rp {{
                                bookingStore.addOnPricePerPerson.toLocaleString('id-ID') }}</span>
                            <span class="font-bold">Rp {{ bookingStore.totalAddOnPrice.toLocaleString('id-ID') }}</span>
                        </div>
                    </div>

                    <!-- Total Keseluruhan -->
                    <div class="bg-white border-3 border-outline p-4 text-center">
                        <p class="font-sans text-sm mb-1">Total Pembayaran</p>
                        <p class="font-display font-bold text-3xl">Rp {{ bookingStore.grandTotal.toLocaleString('id-ID')
                            }}</p>
                    </div>
                </div>
            </div>

            <!-- Tombol Lanjut ke Pembayaran -->
            <div class="text-center mt-12">
                <button @click="proceedToPayment" :disabled="isLoading"
                    class="bg-primary text-text-default font-bold text-lg py-4 px-16 border-3 border-outline shadow-solid hover:bg-red-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isLoading ? 'MEMPROSES...' : 'Lanjut ke Pembayaran' }}
                </button>
            </div>

        </main>
    </div>
</template>