#!/bin/bash

# Work Progress Tests Runner
# This script runs all work progress tests to verify project development status

echo "🚀 Starting Work Progress Tests..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if bun is available
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
    echo "📦 Using bun as package manager"
else
    PACKAGE_MANAGER="npm"
    echo "📦 Using npm as package manager"
fi

# Check if Cypress is installed
if [ ! -d "node_modules/cypress" ]; then
    echo "📦 Installing dependencies..."
    $PACKAGE_MANAGER install
fi

echo ""
echo "🔍 Running all work progress tests..."
echo "===================================="

# Run all work progress tests
echo "Running work progress tests..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run test:work-progress:bun
else
    npm run test:work-progress
fi

# Check if tests passed
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All work progress tests completed successfully!"
    echo "================================================"
    echo "🎉 All tasks have been verified and completed!"
    echo ""
    echo "📋 Test Summary:"
    echo "  ✅ Task 1: Project Structure Setup"
    echo "  ✅ All work progress requirements met"
    echo "  ✅ Project is ready for next development phase"
    echo ""
    echo "🚀 Project development is on track!"
    echo ""
    echo "💡 Available test commands:"
    if [ "$PACKAGE_MANAGER" = "bun" ]; then
        echo "   bun run test:work-progress:bun        - Run all work progress tests"
        echo "   bun run test:work-progress-open       - Open Cypress for work progress tests"
        echo "   bun run test:task-001:bun             - Run Task 1 tests (simple)"
        echo "   bun run test:task-001-full:bun        - Run Task 1 tests (full)"
        echo "   bun run test:task-001-open            - Open Cypress for Task 1 tests"
    else
        echo "   npm run test:work-progress            - Run all work progress tests"
        echo "   npm run test:work-progress-open       - Open Cypress for work progress tests"
        echo "   npm run test:task-001                 - Run Task 1 tests (simple)"
        echo "   npm run test:task-001-full            - Run Task 1 tests (full)"
        echo "   npm run test:task-001-open            - Open Cypress for Task 1 tests"
    fi
else
    echo ""
    echo "❌ Some work progress tests failed!"
    echo "=================================="
    echo "Some tasks are not completed. Please review the test output above."
    echo ""
    echo "📋 Common issues to check:"
    echo "  - Ensure all required tasks are completed"
    echo "  - Check that all required files and folders exist"
    echo "  - Verify that all configurations are correct"
    echo "  - Ensure all applications can start properly"
    echo ""
    echo "🔧 For detailed debugging, run:"
    if [ "$PACKAGE_MANAGER" = "bun" ]; then
        echo "   bun run test:work-progress-open"
        echo "   Or: bun run cypress open"
    else
        echo "   npm run test:work-progress-open"
        echo "   Or: npx cypress open"
    fi
    echo "   Then select tests from: cypress/work-progress-tests/"
    echo ""
    echo "📚 For documentation, see:"
    echo "   cypress/work-progress-tests/README.md"
    exit 1
fi
