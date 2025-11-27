const { Pool } = require('pg');
require('dotenv').config();

// (Ini bagus untuk debugging, biarkan saja)
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "password terbaca" : "password tidak terbaca");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,

    // --- PERBAIKAN 1 (KRITIS) ---
    // Mengatur search_path. 
    // Ini memberi tahu PostgreSQL untuk "melihat" ke dalam skema 'phourto' 
    // secara default. Sekarang kita bisa menulis 'SELECT * FROM users' 
    // BUKAN 'SELECT * FROM phourto.users'.
    // 'public' ditambahkan sebagai fallback (praktik standar).
    options: '-c search_path=phourto,public',
});

// --- PERBAIKAN 2 (PENTING) ---
// Kita sekarang mengekspor DUA fungsi, bukan satu.
// 1. query: Untuk query sederhana (SELECT, UPDATE, dll.)
// 2. getClient: Untuk transaksi (BEGIN, COMMIT, ROLLBACK)
module.exports = {
    /**
     * Menjalankan query sederhana menggunakan koneksi dari pool.
     * @param {string} text Query SQL (e.g., "SELECT * FROM users WHERE id = $1")
     * @param {Array} params Array nilai untuk $1, $2, dst.
     * @returns {Promise<QueryResult>} Hasil dari query.
     */
    query: (text, params) => pool.query(text, params),

    /**
     * Meminjam (checkout) satu klien dari pool.
     * PENTING: Anda HARUS me-release klien ini secara manual menggunakan client.release() 
     * di dalam blok 'finally' setelah selesai.
     * @returns {Promise<PoolClient>} Klien koneksi.
     */
    getClient: () => pool.connect(),

    /**
     * Fungsi untuk menguji koneksi saat aplikasi dimulai.
     * (Panggil ini di file index.js/app.js utama Anda)
     */
    testConnection: async () => {
        try {
            const client = await pool.connect();
            console.log("Koneksi Database PostgreSQL Berhasil (terhubung ke skema 'phourto').");
            await client.query('SELECT NOW()'); // Query tes sederhana
            client.release();
        } catch (err) {
            console.error("GAGAL terhubung ke Database PostgreSQL:", err.message);
            process.exit(1); // Keluar dari aplikasi jika DB gagal terhubung
        }
    }
};
