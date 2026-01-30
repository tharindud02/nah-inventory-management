# Development Workflow Guide

This guide explains how to switch between normal development mode (real APIs) and demo mode (mock data).

## 🚀 Quick Start

### Normal Development (Real APIs)
```bash
npm run dev
```
- Uses real MarketCheck API calls
- Requires valid API keys
- Shows live data
- Good for testing integrations

### Demo Development (Mock Data)
```bash
npm run dev:demo
```
- Uses stored demo data from JSON files
- No API keys required
- Instant responses, no network latency
- Perfect for development and testing

## 📋 Complete Workflow

### 1. Initial Setup (One-time)

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.demo .env.local
# Edit .env.local with your real API keys if needed
```

### 2. Normal Development Flow

```bash
# Step 1: Start with real APIs
npm run dev

# Step 2: Test with real data
# Test your features with live MarketCheck data

# Step 3: Capture real responses (optional)
npm run demo:capture
# This saves real API responses as demo data

# Step 4: Switch to demo mode
# Stop the server (Ctrl+C)
npm run dev:demo
```

### 3. Demo Mode Development Flow

```bash
# Step 1: Start in demo mode
npm run dev:demo

# Step 2: Develop features
# Work with instant, predictable responses

# Step 3: Test with real data
# Stop demo server (Ctrl+C)
npm run dev

# Step 4: Verify with real APIs
# Test your features with live data
```

## 🔄 Switching Between Modes

### From Normal → Demo Mode
```bash
# 1. Stop current server (Ctrl+C)
# 2. Start demo mode
npm run dev:demo
```

### From Demo → Normal Mode
```bash
# 1. Stop current server (Ctrl+C)
# 2. Start normal mode
npm run dev
```

## 🛠️ Development Commands

| Command | Purpose | Mode | API Calls |
|---------|---------|------|-----------|
| `npm run dev` | Normal development | Real | Live MarketCheck APIs |
| `npm run dev:demo` | Demo development | Mock | JSON files |
| `npm run demo:capture` | Capture real responses | Real | Saves API responses |
| `npm run demo:compare` | Compare demo vs real | Analysis | Shows differences |
| `npm run demo:test-api` | Test API connectivity | Real | Tests MarketCheck |

## 📊 When to Use Each Mode

### Use Normal Mode (`npm run dev`) when:
- ✅ Testing new API integrations
- ✅ Verifying real data formats
- ✅ Debugging API-specific issues
- ✅ Final testing before deployment
- ✅ Checking API rate limits and errors

### Use Demo Mode (`npm run dev:demo`) when:
- ✅ Developing UI components
- ✅ Working offline/no internet
- ✅ Need fast, predictable responses
- ✅ Testing error handling scenarios
- ✅ Demonstrating features to stakeholders
- ✅ Running automated tests

## 🎯 Best Practices

### Development Workflow
1. **Start in Demo Mode** for UI development
2. **Switch to Normal Mode** for API integration testing
3. **Capture Real Data** to update demo responses
4. **Return to Demo Mode** for continued development

### Updating Demo Data
```bash
# 1. Capture fresh data
npm run demo:capture

# 2. Review what changed
npm run demo:compare

# 3. Test with updated demo data
npm run dev:demo
```

### Environment Variables
```bash
# .env.local
DEMO_MODE=false          # For normal mode
# DEMO_MODE=true         # For demo mode (or use npm run dev:demo)

# API Keys (only needed for normal mode)
MARKETCHECK_API_KEY=your_key_here
MARKETCHECK_BASE_URL=https://api.marketcheck.com
```

## 🐛 Troubleshooting

### Demo Mode Issues
```bash
# Check demo data exists
ls demo-data/api/

# Verify demo data format
npm run demo:compare

# Recapture demo data
npm run demo:capture
```

### Normal Mode Issues
```bash
# Test API connectivity
npm run demo:test-api

# Check API keys
echo $MARKETCHECK_API_KEY

# Verify network connection
curl -I https://api.marketcheck.com
```

### Switching Issues
```bash
# Clear any cached responses
rm -rf .next/cache

# Restart fresh
npm run dev:demo  # or npm run dev
```

## 📱 Example Development Session

```bash
# Morning: Start with demo mode for UI work
npm run dev:demo
# Develop new components, test layouts

# Afternoon: Test with real APIs
# Stop server (Ctrl+C)
npm run dev
# Test integrations, verify data flow

# Update demo data with latest responses
npm run demo:capture

# Evening: Back to demo mode for continued development
# Stop server (Ctrl+C)
npm run dev:demo
# Continue development with fresh demo data
```

## 🔍 Mode Detection

The app automatically detects the mode:

```typescript
// In your API routes
import { DEMO_MODE } from '@/lib/demo-mode';

if (DEMO_MODE) {
  // Return demo data
} else {
  // Make real API calls
}
```

## 📝 Environment Files

- `.env.demo` - Demo mode template
- `.env.local` - Your actual environment (don't commit)
- `.env.example` - Example configuration

## 🎉 Success Indicators

### Normal Mode Working
- ✅ Real API responses with live data
- ✅ Network requests in browser dev tools
- ✅ API rate limiting visible
- ✅ Real-time data updates

### Demo Mode Working
- ✅ Instant responses (no network delay)
- ✅ Consistent, predictable data
- ✅ No network requests in dev tools
- ✅ Demo banner or indicator in UI

---

**💡 Pro Tip**: Keep both modes working smoothly by regularly updating demo data with `npm run demo:capture` after testing with real APIs.
