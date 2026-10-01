# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copia os ficheiros de dependências da pasta app
COPY app/package*.json ./
RUN npm install

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
USER node

# Copia os node_modules do estágio anterior e o restante código da app
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node ./app .

EXPOSE 3000
CMD ["node", "index.js"]