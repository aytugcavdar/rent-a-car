# Temel imaj olarak node:18-alpine kullan
FROM node:18-alpine

# Uygulama için çalışma dizini oluştur
WORKDIR /app

# Önce root package.json'u kopyala ve workspace'leri kur
COPY package*.json ./
COPY shared-utils/package*.json ./shared-utils/
COPY services/auth-service/package*.json ./services/auth-service/

# Workspace bağımlılıklarını kur
RUN npm install

# Shared-utils kodlarını kopyala
COPY shared-utils/ ./shared-utils/

# Auth service kodlarını kopyala
COPY services/auth-service/ ./services/auth-service/

# Node_modules'daki symlink'i manuel olarak oluştur
RUN ln -sf /app/shared-utils /app/node_modules/@rent-a-car/shared-utils

# Auth service dizinine geç
WORKDIR /app/services/auth-service

# Port'u expose et
EXPOSE 5001

# Uygulamayı başlat (root dizinden çalıştır)
CMD ["node", "/app/services/auth-service/server.js"]