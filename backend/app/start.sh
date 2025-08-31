#!/bin/sh

# Start script for Strapi application
# backend/app/start.sh

echo "Starting Strapi application..."

# Install admin dependencies if not already installed
if [ ! -d "node_modules/react" ]; then
    echo "Installing admin dependencies..."
    npm install react@^18.0.0 react-dom@^18.0.0 react-router-dom@^5.2.0 styled-components@^5.2.1 --save
fi

# Check if we're in development mode
if [ "$NODE_ENV" = "development" ]; then
    echo "Running in development mode..."
    npm run develop
else
    echo "Running in production mode..."
    npm run start
fi

