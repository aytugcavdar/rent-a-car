# Base image
FROM node:18-alpine

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared-utils/package*.json ./shared-utils/
COPY gateway/package*.json ./gateway/

# Install dependencies
RUN npm install

# Copy shared-utils
COPY shared-utils/ ./shared-utils/

# Copy gateway code
COPY gateway/ ./gateway/

# Create symlink for shared-utils
RUN ln -sf /app/shared-utils /app/node_modules/@rent-a-car/shared-utils

# Expose port
EXPOSE 3000

# Start the gateway
CMD ["node", "/app/gateway/server.js"]