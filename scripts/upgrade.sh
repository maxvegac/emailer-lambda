#!/bin/bash

# Windows License Emailer - Upgrade Script
echo "🚀 Windows License Emailer - Upgrade System"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: $CURRENT_VERSION"

# Backup current state
print_info "Creating backup..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r src/ "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp tsconfig.json "$BACKUP_DIR/"
print_status "Backup created in $BACKUP_DIR"

# Upgrade options
echo ""
echo "📋 Upgrade Options:"
echo "1. Update dependencies only"
echo "2. Update dependencies + rebuild"
echo "3. Full upgrade (deps + rebuild + redeploy)"
echo "4. Rollback to backup"
echo "5. Check for updates"
echo "6. Exit"
echo ""

read -p "Select option (1-6): " choice

case $choice in
    1)
        print_info "Updating dependencies..."
        npm update
        print_status "Dependencies updated"
        ;;
    2)
        print_info "Updating dependencies and rebuilding..."
        npm update
        npm run build
        print_status "Dependencies updated and project rebuilt"
        ;;
    3)
        print_info "Full upgrade in progress..."
        
        # Update dependencies
        print_info "Updating dependencies..."
        npm update
        
        # Rebuild
        print_info "Rebuilding project..."
        npm run build
        
        # Check if terraform is available
        if command -v tofu &> /dev/null; then
            print_info "Redeploying with OpenTofu..."
            cd terraform
            tofu plan
            read -p "Apply changes? (y/N): " apply_choice
            if [[ $apply_choice =~ ^[Yy]$ ]]; then
                tofu apply
                print_status "Deployment completed"
            else
                print_warning "Deployment skipped"
            fi
            cd ..
        else
            print_warning "OpenTofu not found. Skipping deployment."
        fi
        
        print_status "Full upgrade completed"
        ;;
    4)
        print_info "Available backups:"
        ls -la backup-* 2>/dev/null || print_warning "No backups found"
        echo ""
        read -p "Enter backup directory name: " backup_name
        
        if [ -d "$backup_name" ]; then
            print_info "Rolling back to $backup_name..."
            cp -r "$backup_name"/* ./
            npm install
            print_status "Rollback completed"
        else
            print_error "Backup directory not found"
        fi
        ;;
    5)
        print_info "Checking for updates..."
        
        # Check npm packages
        print_info "Checking npm packages..."
        npm outdated
        
        # Check Node.js version
        NODE_VERSION=$(node --version)
        print_info "Current Node.js version: $NODE_VERSION"
        
        # Check if newer Node.js is available
        print_info "Checking for Node.js updates..."
        curl -s https://nodejs.org/dist/index.json | jq -r '.[0].version' | sed 's/v//' > /tmp/latest_node.txt
        LATEST_NODE=$(cat /tmp/latest_node.txt)
        CURRENT_NODE=$(node --version | sed 's/v//')
        
        if [ "$CURRENT_NODE" != "$LATEST_NODE" ]; then
            print_warning "Newer Node.js available: v$LATEST_NODE (current: v$CURRENT_NODE)"
        else
            print_status "Node.js is up to date"
        fi
        
        # Check OpenTofu version
        if command -v tofu &> /dev/null; then
            TOFU_VERSION=$(tofu version | head -n1)
            print_info "Current OpenTofu version: $TOFU_VERSION"
        else
            print_warning "OpenTofu not installed"
        fi
        ;;
    6)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
print_status "Upgrade process completed!"
echo ""
print_info "Next steps:"
echo "  - Test the application: npm run dev"
echo "  - Check logs for any issues"
echo "  - Verify email functionality"
echo ""
print_info "Backup location: $BACKUP_DIR"
