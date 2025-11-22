const axios = require('axios');
const crypto = require('crypto');

// =======================================================
// ⚠️ PENTING: KETIK MANUAL KUNCI DI BAWAH INI (JANGAN COPY-PASTE)
// =======================================================
// Kadang copy-paste membawa karakter tersembunyi yang merusak signature.
const CLIENT_ID = "BRN-0247-1763549965476";
const SECRET_KEY = "SK-y7ttkjxdPAji58REhIK3"; // <-- KETIK MANUAL KODE INI JIKA BISA //SK-y7ttkjxdPAji58REhIK3
// =======================================================

async function testCleanCheckout() {
    const url = "https://api-sandbox.doku.com/checkout/v1/payment";
    const targetPath = "/checkout/v1/payment";

    // 1. Request ID Acak
    const requestId = "REQ-" + Math.floor(1000 + Math.random() * 9000);

    // 2. Timestamp Bersih (Tanpa Milidetik .123)
    // Contoh: 2025-11-19T15:30:00Z
    const timestamp = new Date().toISOString().slice(0, 19) + "Z";

    // 3. Body Minimal (Hanya yang wajib)
    const body = {
        order: {
            amount: 20000,
            invoice_number: "INV-" + Date.now(),
            currency: "IDR",
            callback_url: "http://localhost:5173/" // Wajib ada
        },
        payment: {
            payment_due_date: 60
        }
        // Customer dihapus dulu untuk tes
    };

    // 4. Hitung Digest
    const bodyString = JSON.stringify(body);
    const digest = crypto.createHash('sha256').update(bodyString).digest('base64');

    // 5. Hitung Signature
    // Urutan String: Client-Id -> Request-Id -> Request-Timestamp -> Request-Target -> Digest
    const stringToSign = `Client-Id:${CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${targetPath}\nDigest:${digest}`;

    const signature = crypto.createHmac('sha256', SECRET_KEY).update(stringToSign).digest('base64');
    const finalSignature = "HMACSHA256=" + signature;

    console.log("🚀 MENCOBA CHECKOUT (CLEAN)...");
    console.log("   URL       :", url);
    console.log("   Time      :", timestamp);
    console.log("   Signature :", finalSignature);

    try {
        const response = await axios.post(url, bodyString, {
            headers: {
                'Client-Id': CLIENT_ID,
                'Request-Id': requestId,
                'Request-Timestamp': timestamp,
                'Signature': finalSignature,
                'Content-Type': 'application/json'
            }
        });

        console.log("\n✅ SUKSES! LINK DITERIMA.");
        console.log("🔗 Link:", response.data.response.payment.url);

        // Jika ini sukses, copy logika ini ke payment.service.js

    } catch (error) {
        console.log("\n❌ GAGAL.");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Error:", JSON.stringify(error.response.data, null, 2));

            // Diagnosa Khusus
            if (error.response.status === 400) {
                console.log("\n⚠️ DIAGNOSA: Signature Masih Salah.");
                console.log("Kemungkinan besar Secret Key di kode tidak sama persis dengan di Dashboard.");
                console.log("Coba REGENERATE Secret Key di Dashboard sekali lagi dan update di sini.");
            }
        } else {
            console.log("Error:", error.message);
        }
    }
}

testCleanCheckout();