#!/bin/bash
# setup-heroku.sh - Script to prepare and deploy backend to Heroku

echo "Setting up Heroku deployment for job tracker backend..."

# Navigate to server directory
cd /home/la-patrona/strategy/server

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
  git init
fi

# Add all server files to git  
git add .
git status

echo "Ready for Heroku deployment!"
echo ""
echo "Now run these commands:"
echo "1. heroku login"
echo "2. heroku create your-app-name"
echo "3. git push heroku main"
echo ""
echo "After deployment, note your backend URL and update your Netlify environment variable:"
echo "REACT_APP_API_URL = https://your-app-name.herokuapp.com"