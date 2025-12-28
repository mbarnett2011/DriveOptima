#!/bin/bash

# Configuration
DROPLET_IP="137.184.84.157"
USER="root"
REPO_URL="https://github.com/mbarnett2011/DriveOptima.git"
REMOTE_DIR="DriveOptima"

echo "🚀 DriveOptima DigitalOcean Deployer"
echo "========================================"

# 1. Ask for API Key securely
if [ -z "$API_KEY" ]; then
    echo -n "🔑 Enter your Gemini API Key: "
    read -s API_KEY
    echo ""
fi

if [ -z "$API_KEY" ]; then
    echo "❌ API Key is required!"
    exit 1
fi

echo "📡 Connecting to Droplet ($DROPLET_IP)..."

# 2. Execute Remote Commands via SSH
# We use a Here-Doc (<< 'EOF') to pass a block of commands to the remote server
ssh -t $USER@$DROPLET_IP << EOF
    set -e # Exit on error

    # 0. Ensure Docker is Installed
    if ! command -v docker &> /dev/null; then
        echo "🐳 Docker not found. Installing..."
        # Try snap first (common on Ubuntu DO droplets), fallback to apt
        if command -v snap &> /dev/null; then
            snap install docker
        else
            apt-get update
            apt-get install -y docker.io
        fi
        echo "✅ Docker installed."
    fi

    # A. Setup/Update Repo
    if [ ! -d "$REMOTE_DIR" ]; then
        echo "📂 Cloning repository..."
        git clone $REPO_URL $REMOTE_DIR
    fi

    cd $REMOTE_DIR
    echo "🔄 Updating repository..."
    git pull origin main

    # B. Write API Key to .env (Securely)
    echo "📝 Configuring secrets..."
    echo "API_KEY=$API_KEY" > .env

    # C. Run the Deployment Script
    echo "🚢 Launching Docker deployment..."
    chmod +x deploy_droplet.sh
    ./deploy_droplet.sh

    echo "✅ Remote checklist completed!"
EOF
