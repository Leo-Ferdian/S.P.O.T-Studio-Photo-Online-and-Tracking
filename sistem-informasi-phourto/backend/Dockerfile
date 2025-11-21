# Gunakan image Node.js versi stabil yang ringan
FROM node:18-alpine

# Set folder kerja di dalam container
WORKDIR /app

# Copy file package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh sisa kode backend ke dalam container
COPY . .

# Beritahu port yang akan digunakan (Sesuaikan dengan kodingan Anda 5000)
EXPOSE 5000

# Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]