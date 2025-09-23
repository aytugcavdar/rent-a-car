FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared-utils/package*.json ./shared-utils/
COPY services/payment-service/package*.json ./services/payment-service/

# Install dependencies
RUN npm install

# Copy shared-utils
COPY shared-utils/ ./shared-utils/

# Copy payment service code
COPY services/payment-service/ ./services/payment-service/

# Create symlink for shared-utils
RUN ln -sf /app/shared-utils /app/node_modules/@rent-a-car/shared-utils

# Set working directory to payment service
WORKDIR /app/services/payment-service

# Expose port
EXPOSE 5004

# Start the service
CMD ["node", "/app/services/payment-service/server.js"]