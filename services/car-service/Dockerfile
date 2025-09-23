FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared-utils/package*.json ./shared-utils/
COPY services/car-service/package*.json ./services/car-service/

# Install dependencies
RUN npm install

# Copy shared-utils
COPY shared-utils/ ./shared-utils/

# Copy car service code
COPY services/car-service/ ./services/car-service/

# Create symlink for shared-utils
RUN ln -sf /app/shared-utils /app/node_modules/@rent-a-car/shared-utils

# Set working directory to car service
WORKDIR /app/services/car-service

# Expose port
EXPOSE 5002

# Start the service
CMD ["node", "/app/services/car-service/server.js"]