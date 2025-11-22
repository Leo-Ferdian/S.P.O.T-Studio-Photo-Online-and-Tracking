// file: test-db.js
require('dotenv').config();
const db = require('./src/config/database'); // SESUAIKAN PATH KE CONFIG DATABASE KAMU

async function testUpdate() {
    const bookingId = 'e51724ec-a18d-43eb-810b-fd60d2107f53'; // ID Booking Kamu
    console.log("🔥 MEMULAI TEST UPDATE MANUAL...");

    try {
        // 1. Cek Data Awal
        console.log("1️⃣  Mengecek data awal...");
        // Perhatikan saya pakai phourto.bookings
        const resAwal = await db.query("SELECT payment_status FROM phourto.bookings WHERE booking_id = $1", [bookingId]);

        if (resAwal.rows.length === 0) {
            console.error("❌ ERROR: Booking ID tidak ditemukan di database!");
            process.exit(1);
        }
        console.log("   Status Saat Ini:", resAwal.rows[0].payment_status);

        // 2. Coba Update ke PAID-FULL
        console.log("2️⃣  Mencoba UPDATE ke 'PAID-FULL'...");
        const resUpdate = await db.query(`
            UPDATE phourto.bookings 
            SET payment_status = 'PAID-FULL', updated_at = NOW() 
            WHERE booking_id = $1 
            RETURNING *
        `, [bookingId]);

        console.log("   Baris yang berubah:", resUpdate.rowCount);

        if (resUpdate.rows.length > 0) {
            console.log("✅ SUKSES! Status baru:", resUpdate.rows[0].payment_status);
        } else {
            console.log("⚠️ GAGAL! Tidak ada baris yang terupdate.");
        }

    } catch (err) {
        console.error("❌ TERJADI ERROR DATABASE:");
        console.error(err.message);
    } finally {
        process.exit();
    }
}

testUpdate();