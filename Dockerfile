# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Pass build configuration via:
#   docker build --build-arg BUILD_VALUE=your_value .
# The value is only available during build stage.
ARG BUILD_VALUE
ENV GEMINI_CONFIG=$BUILD_VALUE

# Build the project
# Note environment variables must be passed at build time or runtime. 
# For Vite, variables prefixed with VITE_ are embedded at build time.
# However, we'll setup the Nginx stage to potentially serve this.
# Build the project
# Increase memory limit for build process
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
