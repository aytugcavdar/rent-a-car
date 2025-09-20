FROM node:18-alpine

WORKDIR /app 

# Önce shared-utils'ı kopyala ve yükle
COPY shared-utils ./shared-utils
WORKDIR /app/shared-utils
RUN npm install

# Auth service dizinine geç
WORKDIR /app

# Auth service package.json'ı kopyala ve bağımlılıkları yükle
COPY services/auth-service/package*.json ./
RUN npm install

# shared-utils'ı node_modules'a link et
RUN mkdir -p node_modules/@rent-a-car && \
    ln -sf /app/shared-utils node_modules/@rent-a-car/shared-utils

# Auth service kodunu kopyala
COPY services/auth-service/. .

EXPOSE 5001

CMD [ "node", "server.js" ]