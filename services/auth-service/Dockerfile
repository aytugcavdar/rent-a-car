# Temel imaj olarak node:18-alpine kullan
FROM node:18-alpine

# Uygulama için çalışma dizini oluştur
WORKDIR /app

# Önce tüm package.json dosyalarını kopyala. Bu sayede sadece bağımlılıklar
# değiştiğinde "npm install" adımı tekrar çalışır (Docker katman önbelleği).
COPY package*.json ./
COPY shared-utils/package*.json ./shared-utils/
COPY services/auth-service/package*.json ./services/auth-service/

# Kök dizinden tüm workspace bağımlılıklarını kur.
# Bu komut, node_modules/@rent-a-car/shared-utils sembolik linkini oluşturur.
RUN npm install

# Bağımlılıklar kurulduktan sonra projenin tüm kodunu kopyala.
COPY . .

# Uygulamayı, node_modules'un bulunduğu kök dizinden başlat.
# Bu sayede require('@rent-a-car/shared-utils') doğru şekilde çözümlenir.
CMD [ "node", "services/auth-service/server.js" ]