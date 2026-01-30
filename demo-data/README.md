# Demo Data System

This directory contains mock API responses for development and testing purposes.

## Structure

```
demo-data/
├── api/
│   ├── auth/
│   │   └── signin.json
│   ├── cars/
│   │   └── vehicle-specs/
│   │       └── neovin.json
│   └── vindata/
│       ├── access-report.json
│       ├── access-report/
│       │   └── aamva.json
│       ├── consumer-interest.json
│       ├── demand-score.json
│       ├── estimated-market-value.json
│       ├── generate-report.json
│       ├── inventory-stats.json
│       ├── market-comps.json
│       ├── market-days-supply.json
│       ├── mmr.json
│       ├── sold-comps.json
│       └── valuation.json
└── README.md
```

## How to Use Demo Mode

### Option 1: Using the npm script (Recommended)

```bash
npm run dev:demo
```

This will start the development server with demo mode enabled.

### Option 2: Using environment variables

1. Copy the demo environment file:
   ```bash
   cp .env.demo .env.local
   ```

2. Ensure `DEMO_MODE=true` is set in your `.env.local` file

3. Start the development server normally:
   ```bash
   npm run dev
   ```

## How It Works

When demo mode is enabled (`DEMO_MODE=true`), all API routes will return mock data from the corresponding JSON files in this directory instead of making real API calls.

The mapping is:
- API Route: `/api/vindata/valuation`
- Demo File: `demo-data/api/vindata/valuation.json`

## Adding New Demo Data

To add demo data for a new API endpoint:

1. Create a JSON file in the appropriate directory following the API path structure
2. The JSON file should contain the exact response structure that the real API returns
3. Use the `createDemoDataFile` helper function from `src/lib/demo-mode.ts`:

```javascript
import { createDemoDataFile } from '@/lib/demo-mode';

const demoData = {
  success: true,
  data: {
    // Your mock data here
  }
};

createDemoDataFile('/api/your-endpoint', demoData);
```

## Benefits of Demo Mode

- **No API Key Required**: Develop without needing real API credentials
- **Offline Development**: Work without internet connectivity
- **Consistent Data**: Always get the same predictable responses for testing
- **Cost Savings**: Avoid API usage costs during development
- **Fast Response**: No network latency, instant responses

## Demo Data Guidelines

1. **Realistic Data**: Use realistic values that match production scenarios
2. **Edge Cases**: Include data for testing edge cases and error scenarios
3. **Update Regularly**: Keep demo data updated to match API changes
4. **Documentation**: Document any special scenarios or test cases in the demo data

## Switching Between Modes

You can switch between demo mode and real API mode by:

1. Stopping the development server
2. Either:
   - Run `npm run dev` for real API mode
   - Run `npm run dev:demo` for demo mode
3. Restart the development server

The app will automatically detect the mode and serve either demo data or make real API calls accordingly.
