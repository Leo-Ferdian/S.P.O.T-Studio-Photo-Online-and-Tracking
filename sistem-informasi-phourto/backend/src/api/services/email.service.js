const nodemailer = require('nodemailer');
const { logger } = require('../../utils/logger');

class EmailService {
    transporter;

    constructor() {
        // Konfigurasi transporter (pengirim email)
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST, // "smtp.gmail.com"
            port: process.env.EMAIL_PORT, // 587
            secure: false, // true untuk port 465, false untuk port lain
            auth: {
                user: process.env.EMAIL_USER, // email-anda@gmail.com
                pass: process.env.EMAIL_PASS, // password-aplikasi-16-digit
            },
        });

        // Verifikasi koneksi (opsional tapi bagus untuk debug)
        this.transporter.verify((error, success) => {
            if (error) {
                logger.error('Email Transporter Gagal Terhubung:', error);
            } else {
                logger.info('Email Transporter Siap Mengirim Email');
            }
        });
    }

    /**
     * Fungsi untuk mengirim email
     * @param {string} to - Email penerima
     * @param {string} subject - Judul email
     * @param {string} text - Isi email (plain text)
     * @param {string} html - Isi email (HTML)
     */
    async sendEmail(to, subject, text, html) {
        try {
            const mailOptions = {
                from: `"Phourto Studio" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                text: text,
                html: html,
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email terkirim: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error(`Gagal mengirim email ke ${to}:`, error);
            throw new Error('Gagal mengirim email.');
        }
    }
}

// Ekspor sebagai instance (singleton)
module.exports = new EmailService();