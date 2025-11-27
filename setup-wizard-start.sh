#!/bin/bash

###############################################################################
# WABA BSP Setup Wizard Quick Start
# Opens the setup wizard in your default browser
# Usage: bash setup-wizard-start.sh
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     WABA BSP Platform - Setup Wizard                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WIZARD_FILE="${PROJECT_ROOT}/setup-wizard.html"

# Check if wizard exists
if [ ! -f "$WIZARD_FILE" ]; then
    echo -e "${YELLOW}⚠ Setup wizard not found!${NC}"
    echo "Expected location: $WIZARD_FILE"
    exit 1
fi

echo -e "${GREEN}✓ Found setup wizard${NC}"
echo ""

# Start a simple HTTP server if Python is available
if command -v python3 &> /dev/null; then
    echo -e "${BLUE}ℹ Starting HTTP server...${NC}"
    cd "$PROJECT_ROOT"
    
    # Find available port
    PORT=8000
    while netstat -tuln 2>/dev/null | grep -q ":$PORT "; do
        PORT=$((PORT + 1))
    done
    
    echo -e "${GREEN}✓ Server starting on http://localhost:$PORT${NC}"
    echo -e "${YELLOW}⚠ Press Ctrl+C to stop the server${NC}"
    echo ""
    
    # Open browser
    if command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open "http://localhost:$PORT/setup-wizard.html" &
    elif command -v open &> /dev/null; then
        # macOS
        open "http://localhost:$PORT/setup-wizard.html" &
    elif command -v start &> /dev/null; then
        # Windows
        start "http://localhost:$PORT/setup-wizard.html" &
    fi
    
    # Start server
    python3 -m http.server $PORT --directory "$PROJECT_ROOT"
    
elif command -v python &> /dev/null; then
    echo -e "${BLUE}ℹ Starting HTTP server...${NC}"
    cd "$PROJECT_ROOT"
    
    # Find available port
    PORT=8000
    while netstat -tuln 2>/dev/null | grep -q ":$PORT "; do
        PORT=$((PORT + 1))
    done
    
    echo -e "${GREEN}✓ Server starting on http://localhost:$PORT${NC}"
    echo -e "${YELLOW}⚠ Press Ctrl+C to stop the server${NC}"
    echo ""
    
    # Open browser
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT/setup-wizard.html" &
    elif command -v open &> /dev/null; then
        open "http://localhost:$PORT/setup-wizard.html" &
    elif command -v start &> /dev/null; then
        start "http://localhost:$PORT/setup-wizard.html" &
    fi
    
    # Start server
    python -m SimpleHTTPServer $PORT
    
elif command -v node &> /dev/null; then
    echo -e "${BLUE}ℹ Starting Node.js HTTP server...${NC}"
    
    # Create temporary server
    TEMP_SERVER=$(mktemp)
    cat > "$TEMP_SERVER" << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const projectRoot = process.env.PROJECT_ROOT || __dirname;

const server = http.createServer((req, res) => {
    let filePath = path.join(projectRoot, req.url);
    
    // Default to wizard if root
    if (req.url === '/' || req.url === '') {
        filePath = path.join(projectRoot, 'setup-wizard.html');
    }
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        const ext = path.extname(filePath);
        let contentType = 'text/plain';
        
        if (ext === '.html') contentType = 'text/html';
        else if (ext === '.js') contentType = 'application/javascript';
        else if (ext === '.css') contentType = 'text/css';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}/setup-wizard.html`);
});
EOF
    
    PORT=8000
    while netstat -tuln 2>/dev/null | grep -q ":$PORT "; do
        PORT=$((PORT + 1))
    done
    
    echo -e "${GREEN}✓ Server starting on http://localhost:$PORT${NC}"
    echo -e "${YELLOW}⚠ Press Ctrl+C to stop the server${NC}"
    echo ""
    
    # Open browser
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT/setup-wizard.html" &
    elif command -v open &> /dev/null; then
        open "http://localhost:$PORT/setup-wizard.html" &
    elif command -v start &> /dev/null; then
        start "http://localhost:$PORT/setup-wizard.html" &
    fi
    
    # Start server
    PROJECT_ROOT="$PROJECT_ROOT" PORT=$PORT node "$TEMP_SERVER"
    rm -f "$TEMP_SERVER"
    
else
    echo -e "${YELLOW}⚠ No HTTP server found!${NC}"
    echo ""
    echo "Please open the following file in your browser:"
    echo -e "${BLUE}$WIZARD_FILE${NC}"
    echo ""
    echo "Or install Python/Node.js and run this script again."
    exit 1
fi
