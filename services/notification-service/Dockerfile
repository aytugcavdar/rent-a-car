FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
COPY shared-utils/package*.json ./shared-utils/
COPY services/notification-service/package*.json ./services/notification-service/

RUN npm install

COPY shared-utils/ ./shared-utils/
COPY services/notification-service/ ./services/notification-service/

RUN ln -sf /app/shared-utils /app/node_modules/@rent-a-car/shared-utils
WORKDIR /app/services/notification-service

CMD ["node", "consumer.js"]