# Demo Data Scripts

This directory contains scripts to help manage and maintain demo data for development.

## Available Scripts

### 1. Capture Real API Responses

**Command:** `npm run demo:capture`

This script captures real API responses and saves them as demo data. It will:

- Test multiple VIN numbers to find one that works
- Call all API endpoints with the working VIN
- Save the exact responses to the demo-data directory
- Add metadata to track when the data was captured

**Usage:**
```bash
# First, start your dev server in normal mode (not demo mode)
npm run dev

# In another terminal, run the capture script
npm run demo:capture
```

**What it does:**
1. Tests VIN numbers: `WA1BBAFY7P2183119`, `1HGCM82633A123456`, `JTDKB20U993045678`
2. Captures responses from all 13 API endpoints
3. Saves responses with metadata including capture time and VIN used
4. Shows comparison with existing demo data

### 2. Compare Demo Data

**Command:** `npm run demo:compare`

This script analyzes demo data files and shows differences between simulated and real API responses.

**Usage:**
```bash
npm run demo:compare
```

**What it shows:**
- Structure analysis of each demo data file
- Whether data is simulated or from real API
- Detailed differences between files
- Metadata information for captured responses

### 3. Add Demo Mode to New APIs

**Command:** `node scripts/add-demo-mode.js`

This script automatically adds demo mode support to new API routes.

**Usage:**
```bash
node scripts/add-demo-mode.js
```

## Workflow

### Initial Setup

1. **Capture real responses:**
   ```bash
   npm run dev                    # Start server normally
   npm run demo:capture          # Capture real API responses
   ```

2. **Review captured data:**
   ```bash
   npm run demo:compare          # See what was captured
   ```

3. **Use demo mode:**
   ```bash
   npm run dev:demo              # Start server with demo data
   ```

### Updating Demo Data

When APIs change or you want fresh demo data:

1. **Stop demo mode server**
2. **Capture new responses:** `npm run demo:capture`
3. **Restart demo mode:** `npm run dev:demo`

### Adding New APIs

1. **Create the API route normally**
2. **Add demo mode support:** `node scripts/add-demo-mode.js`
3. **Create demo data:** `npm run demo:capture` (or manually create JSON file)

## File Structure

```
scripts/
├── capture-real-responses.js    # Captures real API responses
├── compare-responses.js         # Compares demo vs real data
├── add-demo-mode.js            # Adds demo mode to API routes
└── README.md                   # This file

demo-data/
├── api/
│   ├── auth/
│   ├── cars/
│   └── vindata/
└── README.md                   # Demo data documentation
```

## Test VIN Numbers

The capture script tests these VIN numbers:
- `WA1BBAFY7P2183119` - User provided (Audi)
- `1HGCM82633A123456` - Honda Accord (current demo)
- `JTDKB20U993045678` - Toyota

The script will automatically find the first VIN that works and use it for all endpoints.

## Metadata

Captured responses include metadata:
```json
{
  "_metadata": {
    "captured_at": "2024-01-15T10:30:00.000Z",
    "vin": "WA1BBAFY7P2183119",
    "source": "real_api_response"
  }
}
```

This helps track when data was captured and which VIN was used.

## Troubleshooting

### "No working VIN found"
- Make sure dev server is running (`npm run dev`)
- Check API keys are configured in `.env.local`
- Verify network connectivity to MarketCheck APIs

### "Failed captures"
- Some endpoints might not work with certain VINs
- Check the error messages in the output
- Try running the script again (APIs can be intermittent)

### Demo mode not working
- Ensure `DEMO_MODE=true` is set
- Check that demo JSON files exist and are valid
- Verify file paths match API routes
