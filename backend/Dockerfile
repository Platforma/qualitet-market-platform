FROM node:18-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Run migrations (safe wrapper skips if file is missing) then start server
CMD ["sh", "-c", "node scripts/run-migrations-safe.js && node src/app.js"]
