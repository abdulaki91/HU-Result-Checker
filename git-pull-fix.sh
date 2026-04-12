#!/bin/bash

# Script to fix git pull conflict on cPanel

echo "🔧 Fixing git pull conflict..."

# Option 1: Stash local changes, pull, then reapply
echo "📦 Stashing local changes..."
git stash

echo "⬇️  Pulling from remote..."
git pull

echo "📤 Reapplying your local changes..."
git stash pop

echo "✅ Done! Check if there are any conflicts to resolve."
