FROM node:18-alpine

WORKDIR /app

# Önce shared-utils'ı kopyala ve package.json'ını yükle
COPY shared-utils/package*.json ./shared-utils/
WORKDIR /app/shared-utils
RUN npm install

# Auth service dizinine geç ve package.json'ı kopyala
WORKDIR /app
COPY services/auth-service/package*.json ./
RUN npm install

# shared-utils'ın kodlarını kopyala
COPY shared-utils ./shared-utils

# shared-utils'ı node_modules'a link et (daha güvenli yöntem)
RUN npm install ./shared-utils

# Auth service kodunu kopyala
COPY services/auth-service/. .

EXPOSE 5001

CMD [ "node", "server.js" ]