# Stage 1: Build the React frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build static assets
COPY . .
RUN npm run build

# Stage 2: Serve using Express backend
FROM node:20-alpine

WORKDIR /app

# Install production dependencies for the server
COPY server/package*.json ./server/
RUN npm ci --only=production --prefix server

# Copy built frontend assets from Stage 1
COPY --from=builder /app/dist ./dist

# Copy backend source files
COPY server/ ./server/

ENV PORT=3001 \
    NODE_ENV=production

EXPOSE 3001

CMD ["node", "server/server.js"]
