require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Untuk mengizinkan request dari frontend

// Impor rute
const authRoutes = require('./src/api/routes/auth.routes');

const app = express();

// Middleware
app.use(cors()); // Mengaktifkan CORS
app.use(express.json()); // Mem-parsing body request sebagai JSON
app.use(express.urlencoded({ extended: true }));

// Rute Utama
app.get('/', (req, res) => {
    res.send('Selamat datang di S.P.O.T API!');
});

// Gunakan Rute Autentikasi
app.use('/api/auth', authRoutes);

// Jalankan Server
const PORT = process.env.PORT | 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});