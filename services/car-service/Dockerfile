# Temel imaj olarak node:18-alpine kullan
FROM node:18-alpine

# Uygulama için çalışma dizini oluştur
WORKDIR /app

# Önce root package.json'u kopyala ve workspace'leri kur
COPY package*.json ./
COPY shared-utils/package*.json ./shared-utils/
COPY services/car-service/package*.json ./services/car-service/

# Workspace bağımlılıklarını kur
RUN npm install

# Shared-utils kodlarını kopyala
COPY shared-utils/ ./shared-utils/

# Car service kodlarını kopyala
COPY services/car-service/ ./services/car-service/

# Node_modules'daki symlink'i manuel olarak oluştur
RUN ln -sf /app/shared-utils /app/node_modules/@rent-a-car/shared-utils

# Car service dizinine geç
WORKDIR /app/services/car-service

# Port'u expose et
EXPOSE 5002

# Uygulamayı başlat
CMD ["node", "server.js"]