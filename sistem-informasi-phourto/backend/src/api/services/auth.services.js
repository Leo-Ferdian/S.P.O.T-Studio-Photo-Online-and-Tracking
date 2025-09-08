const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
    async registerUser({ full_name, whatsapp_number, email, password }) {
        // Cek duplikasi email atau nomor whatsapp
        const existingUser = await db.query(
            'SELECT * FROM phourto.users WHERE email = $1 OR whatsapp_number = $2',
            [email, whatsapp_number]
        );

        if (existingUser.rows.length > 0) {
            const error = new Error('Email atau nomor WhatsApp sudah terdaftar.');
            error.statusCode = 409; // 409 Conflict
            throw error;
        }

        // Hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan pengguna baru
        const newUserResult = await db.query(
            'INSERT INTO phourto.users (full_name, whatsapp_number, email, password) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email',
            [full_name, whatsapp_number, email, hashedPassword]
        );

        return newUserResult.rows;
    }

    async loginUser({ email, password }) {
        // Cari pengguna berdasarkan email
        const userResult = await db.query('SELECT * FROM phourto.users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            const error = new Error('Email atau password salah.');
            error.statusCode = 401; // 401 Unauthorized
            throw error;
        }

        const user = userResult.rows;

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const error = new Error('Email atau password salah.');
            error.statusCode = 401; // 401 Unauthorized
            throw error;
        }

        // Buat Token JWT
        const payload = {
            id: user.id,
            name: user.full_name,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        return { token, user: { id: user.id, full_name: user.full_name, email: user.email } };
    }
}

module.exports = new AuthService();