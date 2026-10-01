# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Runtime stage
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

# Enable pnpm via Corepack
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy build output and fixtures
COPY --from=builder /app/dist ./dist
COPY fixtures ./fixtures

EXPOSE 8080

# Start the built server
CMD ["node", "dist/server.js"]
