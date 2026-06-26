#!/bin/bash
# Deployment script for Mahavir Automation VPS

echo "Starting Deployment..."

# 1. Pull latest code from GitHub
git pull origin Main

# 2. Build Frontend
echo "Building Frontend..."
cd front-end
npm install
npm run build
cd ..

# 3. Setup Backend
echo "Setting up Backend..."
cd back-end
npm install
# Restart the backend using PM2
pm2 restart server || pm2 start server.js --name "mahavir-backend"
cd ..

# 4. Update Nginx configuration
echo "Updating Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/mahavirautomation
sudo ln -sf /etc/nginx/sites-available/mahavirautomation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "Deployment Complete!"
