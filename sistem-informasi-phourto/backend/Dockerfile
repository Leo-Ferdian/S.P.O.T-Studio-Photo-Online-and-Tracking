FROM node:18-alpine

WORKDIR /app

# COPY package.json saja (Hapus 'backend/' di depannya)
COPY package*.json ./

RUN npm install

# COPY semua file (Hapus 'backend/' di depannya)
COPY . .

EXPOSE 5000

CMD ["npm", "start"]