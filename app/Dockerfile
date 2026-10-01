# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
USER node
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node ./app .
EXPOSE 3000
CMD ["node", "src/index.js"]