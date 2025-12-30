# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# API keys should be passed at build time via:
#   docker build --build-arg API_KEY=your_key .
# Do NOT hardcode sensitive values in the Dockerfile.
# Using ARG only (not ENV) ensures the key is not persisted in image layers.
ARG API_KEY

# Build the project
# Note environment variables must be passed at build time or runtime. 
# For Vite, variables prefixed with VITE_ are embedded at build time.
# However, we'll setup the Nginx stage to potentially serve this.
# Build the project
# Increase memory limit for build process
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
