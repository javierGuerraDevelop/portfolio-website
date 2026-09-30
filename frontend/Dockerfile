# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Build arguments
ARG VITE_API_URL
ARG VITE_GITHUB_USERNAME

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GITHUB_USERNAME=$VITE_GITHUB_USERNAME

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

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
