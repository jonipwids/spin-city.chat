#!/bin/bash
# remove-git.sh
# This script searches recursively for .git directories and deletes them.

echo "Searching for .git folders and removing them..."
find . -type d -name ".git" -exec rm -rf {} +
echo "Done! All .git directories removed."
