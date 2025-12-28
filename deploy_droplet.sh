#!/bin/bash

# Deployment Script for DriveOptima

APP_NAME="driveoptima"
BRANCH="main"

echo "🚀 Starting Deployment for $APP_NAME..."

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin $BRANCH

# 2. Build Docker Image
echo "🏗️  Building Docker Image..."
# We pass --no-cache to ensure fresh build if needed, though layers cache is usually good.
docker build -t $APP_NAME .

# 3. Stop and remove existing container
echo "🛑 Stopping existing container..."
docker stop $APP_NAME || true
docker rm $APP_NAME || true

# 4. Run new container
echo "🏃 Running new container..."
# NOTE: We assume API_KEY is set in the environment or passed via .env file
# To pass explicit key: -e API_KEY=your_key
# Or use --env-file .env
docker run -d \
  --name $APP_NAME \
  --restart unless-stopped \
  -p 80:80 \
  $APP_NAME

echo "✅ Deployment Complete! App should be running on port 80."
