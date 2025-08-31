FROM --platform=linux/arm64/v8 node:20-alpine

# Install dependencies for native modules and networking tools
RUN apk add --no-cache python3 make g++ curl netcat-openbsd

WORKDIR /srv/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create .env file from env file if it doesn't exist
RUN if [ ! -f .env ]; then cp env .env 2>/dev/null || true; fi

# Make startup script executable
RUN chmod +x start.sh

# Set proper permissions
RUN chown -R node:node /srv/app
USER node

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:1337/_health || exit 1

# Start Strapi using the startup script
CMD ["sh", "./start.sh"]
