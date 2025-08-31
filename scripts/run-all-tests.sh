#!/bin/bash

# All Tests Runner
# This script runs all tests (work-progress, e2e, accessibility) and reports results

echo "🚀 Starting All Tests Verification..."
echo "===================================="

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
echo "🔍 Running all tests..."
echo "======================"

# Initialize test results
WORK_PROGRESS_RESULT=0
E2E_RESULT=0
ACCESSIBILITY_RESULT=0

# Run work progress tests
echo "1️⃣ Running work progress tests..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run test:work-progress:bun
    WORK_PROGRESS_RESULT=$?
else
    npm run test:work-progress
    WORK_PROGRESS_RESULT=$?
fi

if [ $WORK_PROGRESS_RESULT -eq 0 ]; then
    echo "✅ Work progress tests passed"
else
    echo "❌ Work progress tests failed"
fi

echo ""

# Run E2E tests
echo "2️⃣ Running E2E tests..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run test:e2e
    E2E_RESULT=$?
else
    npm run test:e2e
    E2E_RESULT=$?
fi

if [ $E2E_RESULT -eq 0 ]; then
    echo "✅ E2E tests passed"
else
    echo "❌ E2E tests failed"
fi

echo ""

# Run accessibility tests
echo "3️⃣ Running accessibility tests..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run test:accessibility
    ACCESSIBILITY_RESULT=$?
else
    npm run test:accessibility
    ACCESSIBILITY_RESULT=$?
fi

if [ $ACCESSIBILITY_RESULT -eq 0 ]; then
    echo "✅ Accessibility tests passed"
else
    echo "❌ Accessibility tests failed"
fi

echo ""
echo "📊 Test Results Summary"
echo "======================="

# Calculate total results
TOTAL_FAILED=$((WORK_PROGRESS_RESULT + E2E_RESULT + ACCESSIBILITY_RESULT))

if [ $TOTAL_FAILED -eq 0 ]; then
    echo "🎉 All tests passed successfully!"
    echo "================================"
    echo "✅ Work Progress Tests: PASSED"
    echo "✅ E2E Tests: PASSED"
    echo "✅ Accessibility Tests: PASSED"
    echo ""
    echo "🚀 Project is ready for production!"
    echo ""
    echo "💡 Next steps:"
    echo "   - Review any warnings or suggestions"
    echo "   - Consider running performance tests"
    echo "   - Update documentation if needed"
    exit 0
else
    echo "❌ Some tests failed!"
    echo "===================="
    
    if [ $WORK_PROGRESS_RESULT -ne 0 ]; then
        echo "❌ Work Progress Tests: FAILED"
        echo "   - Check that all tasks are completed"
        echo "   - Verify project structure and configuration"
    else
        echo "✅ Work Progress Tests: PASSED"
    fi
    
    if [ $E2E_RESULT -ne 0 ]; then
        echo "❌ E2E Tests: FAILED"
        echo "   - Check application functionality"
        echo "   - Verify user flows and interactions"
    else
        echo "✅ E2E Tests: PASSED"
    fi
    
    if [ $ACCESSIBILITY_RESULT -ne 0 ]; then
        echo "❌ Accessibility Tests: FAILED"
        echo "   - Check WCAG compliance"
        echo "   - Verify keyboard navigation and screen reader support"
    else
        echo "✅ Accessibility Tests: PASSED"
    fi
    
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   - Run individual test suites for detailed error messages"
    echo "   - Check application logs and console output"
    echo "   - Verify that all dependencies are installed"
    echo ""
    echo "💡 Individual test commands:"
    if [ "$PACKAGE_MANAGER" = "bun" ]; then
        echo "   bun run test:work-progress:bun"
        echo "   bun run test:e2e"
        echo "   bun run test:accessibility"
    else
        echo "   npm run test:work-progress"
        echo "   npm run test:e2e"
        echo "   npm run test:accessibility"
    fi
    
    exit 1
fi
