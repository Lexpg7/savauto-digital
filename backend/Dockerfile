FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source
COPY . .

# Expose port
EXPOSE 4000

# Run with tsx (no compilation needed)
CMD ["npx", "tsx", "src/server.ts"]
