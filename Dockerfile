FROM node:20-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

# Copy lockfile and package files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install all dependencies (including dev for build)
RUN npm ci || npm install

# Copy source
COPY . .

# Build the app
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Prune dev dependencies
RUN npm prune --omit=dev && npm cache clean --force

# Start: run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
