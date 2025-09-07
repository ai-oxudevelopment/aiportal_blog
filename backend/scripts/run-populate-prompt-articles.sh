#!/bin/bash

# backend/scripts/run-populate-prompt-articles.sh
# Script to populate prompt articles in the database

echo "🚀 Starting prompt articles population..."

# Navigate to the backend directory
cd "$(dirname "$0")/.."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check if the script file exists
SCRIPT_PATH="scripts/admin/populate-prompt-articles.js"
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Script file not found: $SCRIPT_PATH"
    exit 1
fi

# Run the script
echo "📝 Running prompt articles population script..."
node "$SCRIPT_PATH"

# Check exit status
if [ $? -eq 0 ]; then
    echo "✅ Prompt articles population completed successfully!"
else
    echo "❌ Prompt articles population failed!"
    exit 1
fi
