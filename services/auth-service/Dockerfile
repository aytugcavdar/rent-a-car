FROM node:18-alpine

WORKDIR /app

# DEĞİŞİKLİK: package.json dosyalarının tam yolunu belirt
COPY services/auth-service/package*.json ./

# DEĞİŞİKLİK: shared-utils'ın tam yolunu belirt
COPY shared-utils ./shared-utils

# Bağımlılıkları yükle (artık shared-utils'ın package.json'ı da burada olmalı ama
# biz npm workspace kullanmadığımız için bu yeterli)
RUN npm install

# DEĞİŞİKLİK: Sadece auth-service kodunu kopyala
COPY services/auth-service/. .

EXPOSE 5001

CMD [ "node", "server.js" ]