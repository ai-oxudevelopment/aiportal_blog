# Baseline Performance Measurement Instructions

**Feature**: 001-ssr-performance-optimization
**Date**: 2025-01-09
**Phase**: Phase 1 - Setup & Baseline Measurement

## Purpose

This document provides instructions for measuring the baseline performance of the AI Portal blog before implementing SSR optimization. These measurements will be compared to post-optimization measurements to validate the 20+ point Performance score improvement requirement (SC-008).

## Prerequisites

1. **Dev server running**: `cd frontend && yarn dev` (running at http://localhost:8080)
2. **Or Docker container running**: See Docker deployment instructions
3. **Lighthouse CLI installed**: `npm install -g lighthouse`
4. **Or use PageSpeed Insights web**: https://pagespeed.web.dev/

## Pages to Test

Test the following pages (prioritized by user traffic):

1. **Home page**: `/`
2. **Speckits list**: `/speckits`
3. **Article detail page**: Any article detail page (e.g., `/speckits/my-article`)

## Measurement Method

### Option 1: Lighthouse CLI (Recommended for Local Testing)

```bash
# Navigate to frontend directory
cd frontend

# Ensure dev server is running
yarn dev &

# Wait for server to start, then run Lighthouse
# Test home page
lighthouse http://localhost:8080 \
  --view \
  --preset=mobile \
  --quiet \
  --output=json \
  --output-html \
  --output-path=../specs/001-ssr-performance-optimization/baseline/pre-optimization/home-mobile.json

# Test speckits list page
lighthouse http://localhost:8080/speckits \
  --view \
  --preset=mobile \
  --quiet \
  --output=json \
  --output-html \
  --output-path=../specs/001-ssr-performance-optimization/baseline/pre-optimization/speckits-mobile.json

# Test an article detail page (replace with actual article slug)
lighthouse http://localhost:8080/speckits/your-article-slug \
  --view \
  --preset=mobile \
  --quiet \
  --output=json \
  --output-html \
  --output-path=../specs/001-ssr-performance-optimization/baseline/pre-optimization/article-mobile.json
```

### Option 2: PageSpeed Insights Web Interface

1. Open https://pagespeed.web.dev/
2. Enter URL: `http://localhost:8080` (or your public URL if testing from production)
3. Click "Analyze"
4. Wait for analysis to complete
5. Download JSON report
6. Save to: `specs/001-ssr-performance-optimization/baseline/pre-optimization/`
7. Repeat for `/speckits` and an article detail page

## Metrics to Record

For each page, record the following metrics from the JSON report:

### Core Web Vitals
- **LCP** (Largest Contentful Paint): Target < 1.5s on 4G mobile
- **FID** (First Input Delay): Target < 100ms
- **CLS** (Cumulative Layout Shift): Target < 0.1

### Performance Metrics
- **FCP** (First Contentful Paint): Target < 1.5s
- **TTI** (Time to Interactive): Target < 1.5s on 4G, < 3s on 3G
- **Speed Index**: Lower is better
- **Performance Score**: Overall score (0-100), target +20 points improvement

### Other Categories
- **Accessibility**: Score (0-100)
- **Best Practices**: Score (0-100)
- **SEO**: Score (0-100)

## Baseline Results Template

After running measurements, fill in this template:

### Home Page (/)

```json
{
  "performance": XX,
  "accessibility": XX,
  "bestPractices": XX,
  "seo": XX,
  "lcp": X.XX,
  "fid": XX,
  "cls": X.XX,
  "fcp": X.XX,
  "tti": X.XX,
  "speedIndex": XX
}
```

### Speckits List (/speckits)

```json
{
  "performance": XX,
  "accessibility": XX,
  "bestPractices": XX,
  "seo": XX,
  "lcp": X.XX,
  "fid": XX,
  "cls": X.XX,
  "fcp": X.XX,
  "tti": X.XX,
  "speedIndex": XX
}
```

### Article Detail (/speckits/[slug])

```json
{
  "performance": XX,
  "accessibility": XX,
  "bestPractices": XX,
  "seo": XX,
  "lcp": X.XX,
  "fid": XX,
  "cls": X.XX,
  "fcp": X.XX,
  "tti": X.XX,
  "speedIndex": XX
}
```

## Network Simulation

For 3G/4G simulation testing, use Chrome DevTools:

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Click **Network throttling** dropdown
4. Select **Fast 4G** (for 4G simulation)
5. Select **Fast 3G** or **Slow 3G** (for 3G simulation)
6. Reload page and record TTI from Performance tab

## Important Notes

- **Consistency**: Use same measurement method for pre and post optimization
- **Multiple runs**: Run each test 2-3 times and use the median result
- **Clear cache**: Clear browser cache before each test run
- **Warm cache**: For cached performance, run test twice and record second run
- **Screen recording**: Consider recording screen to capture any visual issues

## Next Steps

After completing baseline measurements:

1. Save all JSON reports to `specs/001-ssr-performance-optimization/baseline/pre-optimization/`
2. Fill in baseline results in this document
3. Proceed with Phase 2: Foundational Infrastructure
4. After implementation complete, repeat measurements for post-optimization comparison

## Validation Criteria

Post-optimization validation requires:

- ✅ Performance score improved by 20+ points (SC-008)
- ✅ LCP < 1.5s on 4G mobile (SC-001)
- ✅ FCP < 1.5s on 4G mobile (SC-010)
- ✅ CLS < 0.1 (SC-009)
- ✅ TTI < 1.5s on 4G, < 3s on 3G (SC-001, SC-002)

---

**Status**: Ready for measurement
**Task Reference**: T001, T030 (post-optimization)
