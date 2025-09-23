FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared-utils/package*.json ./shared-utils/
COPY services/booking-service/package*.json ./services/booking-service/

# Install dependencies
RUN npm install

# Copy shared-utils
COPY shared-utils/ ./shared-utils/

# Copy booking service code
COPY services/booking-service/ ./services/booking-service/

# Create symlink for shared-utils
RUN ln -sf /app/shared-utils /app/node_modules/@rent-a-car/shared-utils

# Set working directory to booking service
WORKDIR /app/services/booking-service

# Expose port
EXPOSE 5003

# Start the service
CMD ["node", "/app/services/booking-service/server.js"]