FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
COPY shared-utils/package*.json ./shared-utils/
COPY services/booking-service/package*.json ./services/booking-service/

RUN npm install

COPY shared-utils/ ./shared-utils/
COPY services/booking-service/ ./services/booking-service/

RUN ln -sf /app/shared-utils /app/node_modules/@rent-a-car/shared-utils
WORKDIR /app/services/booking-service

EXPOSE 5003
CMD ["node", "server.js"]