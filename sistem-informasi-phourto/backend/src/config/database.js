const { Pool } = require('pg');
require('dotenv').config();

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "password terbaca" : "password tidak terbaca");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);

// Konfigurasi koneksi database PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Ekspor fungsi query agar bisa digunakan di seluruh aplikasi
module.exports = {
    query: (text, params) => pool.query(text, params),
};