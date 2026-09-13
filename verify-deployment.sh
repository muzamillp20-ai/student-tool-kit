#!/bin/bash

# GitHub Pages Deployment Verification Script
# Run this script to verify your deployment is working correctly

echo "🔍 GitHub Pages Deployment Verification"
echo "========================================"
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ ERROR: dist folder does not exist"
    echo "   Run: npm run build"
    exit 1
fi

echo "✅ dist folder exists"

# Check if index.html exists
if [ ! -f "dist/index.html" ]; then
    echo "❌ ERROR: dist/index.html does not exist"
    exit 1
fi

echo "✅ dist/index.html exists"

# Check if assets folder exists
if [ ! -d "dist/assets" ]; then
    echo "❌ ERROR: dist/assets folder does not exist"
    exit 1
fi

echo "✅ dist/assets folder exists"

# Check for JavaScript files
JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
if [ "$JS_COUNT" -eq 0 ]; then
    echo "❌ ERROR: No JavaScript files found in dist/assets"
    exit 1
fi

echo "✅ Found $JS_COUNT JavaScript file(s)"

# Check for CSS files
CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)
if [ "$CSS_COUNT" -eq 0 ]; then
    echo "❌ ERROR: No CSS files found in dist/assets"
    exit 1
fi

echo "✅ Found $CSS_COUNT CSS file(s)"

# Check if index.html references the correct base path
if grep -q "/student-tool-kit/assets" dist/index.html; then
    echo "✅ index.html references correct base path"
else
    echo "❌ ERROR: index.html does not reference /student-tool-kit/assets"
    echo "   Check vite.config.js has: base: '/student-tool-kit/'"
    exit 1
fi

# Check if workflow file exists
if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo "❌ ERROR: .github/workflows/deploy.yml does not exist"
    exit 1
fi

echo "✅ GitHub Actions workflow exists"

# Check if workflow references dist folder
if grep -q "path: './dist'" .github/workflows/deploy.yml; then
    echo "✅ Workflow uploads dist folder"
else
    echo "❌ ERROR: Workflow does not upload dist folder"
    exit 1
fi

echo ""
echo "========================================"
echo "✅ ALL CHECKS PASSED!"
echo "========================================"
echo ""
echo "📋 Next Steps:"
echo "1. Go to: https://github.com/muzamillp20-ai/student-tool-kit/settings/pages"
echo "2. Change 'Source' to: GitHub Actions"
echo "3. Push your changes to main branch"
echo "4. Wait for deployment to complete"
echo "5. Visit: https://muzamillp20-ai.github.io/student-tool-kit/"
echo ""
echo "🔍 If the page is still blank:"
echo "- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"
echo "- Check browser console (F12) for errors"
echo "- Check Network tab for 404 errors"
echo ""
