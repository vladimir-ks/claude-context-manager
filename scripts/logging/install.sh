#!/bin/bash
# install.sh: Install logging scripts to ~/bin/ for global access
# Usage: ./install.sh

echo "Installing AI logging scripts..."
echo ""

# Create ~/bin if it doesn't exist
mkdir -p ~/bin

# Copy scripts
cp ai-log-start ~/bin/ai-log-start
cp ai-log-progress ~/bin/ai-log-progress
cp ai-log-end ~/bin/ai-log-end

# Make executable
chmod +x ~/bin/ai-log-start
chmod +x ~/bin/ai-log-progress
chmod +x ~/bin/ai-log-end

echo "✓ Scripts installed to ~/bin/"
echo ""
echo "Installed commands:"
echo "  - ai-log-start"
echo "  - ai-log-progress"
echo "  - ai-log-end"
echo ""

# Check if ~/bin is in PATH
if [[ ":$PATH:" == *":$HOME/bin:"* ]]; then
  echo "✓ ~/bin is in your PATH - commands are ready to use"
else
  echo "⚠️  ~/bin is NOT in your PATH"
  echo ""
  echo "Add this line to your shell profile (~/.zshrc or ~/.bashrc):"
  echo ""
  echo "  export PATH=\"\$HOME/bin:\$PATH\""
  echo ""
  echo "Then restart your terminal or run: source ~/.zshrc"
fi

echo ""
echo "Test installation with: ai-log-start --help"
