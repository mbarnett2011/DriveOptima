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

# Check for API_KEY if available (optional for script safety, but good practice)
if [ -f .env.local ]; then
    echo "Using .env.local for secrets..."
    export $(grep -v '^#' .env.local | xargs)
elif [ -f .env ]; then
    echo "Using .env for secrets..."
    export $(grep -v '^#' .env | xargs)
fi

# We build and pass the API config
docker build --build-arg BUILD_VALUE="$API_KEY" -t $APP_NAME .

# 3. Stop and remove existing container
echo "🛑 Stopping existing container..."
docker stop $APP_NAME || true
docker rm $APP_NAME || true

# 4. Run new container
echo "🏃 Running new container..."
docker run -d \
  --name $APP_NAME \
  --restart unless-stopped \
  -e API_KEY="$API_KEY" \
  -p 80:80 \
  $APP_NAME

echo "✅ Deployment Complete! App should be running on port 80."
