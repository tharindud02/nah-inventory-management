#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Test VIN numbers - updated with more common vehicles
const TEST_VINS = [
  "WA1BBAFY7P2183119", // User provided VIN (Audi)
  "1HGCM82633A123456", // Honda Accord (current demo)
  "JTDKB20U993045678", // Toyota
  "1N4AL3AP9JC123456", // Nissan Altima
  "2T3BF4DV9AW123456", // Toyota RAV4
  "1C4RJFAG5FC123456", // Jeep Grand Cherokee
  "1G1YY1G8G55123456", // Chevrolet Malibu
  "5YJ3E1EA7JF123456", // Tesla Model 3
  "1FTFW1ET5DF123456", // Ford F-150
  "4T1BF1FK9EU123456", // Toyota Camry
];

// API endpoints to test
const API_ENDPOINTS = [
  {
    path: "/api/vindata/valuation",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER" },
  },
  {
    path: "/api/vindata/mmr",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER" },
  },
  {
    path: "/api/vindata/market-comps",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER" },
  },
  {
    path: "/api/vindata/sold-comps",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER", state: "CA" },
  },
  {
    path: "/api/vindata/demand-score",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER" },
  },
  {
    path: "/api/vindata/market-days-supply",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER" },
  },
  {
    path: "/api/vindata/estimated-market-value",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER" },
  },
  {
    path: "/api/vindata/inventory-stats",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER", state: "CA" },
  },
  {
    path: "/api/vindata/access-report",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER" },
  },
  {
    path: "/api/vindata/access-report/aamva",
    method: "GET",
    params: { vin: "VIN_PLACEHOLDER" },
  },
  {
    path: "/api/vindata/consumer-interest",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER" },
  },
  {
    path: "/api/vindata/generate-report",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER" },
  },
  {
    path: "/api/cars/vehicle-specs/neovin",
    method: "POST",
    body: { vin: "VIN_PLACEHOLDER" },
  },
];

// Base URL for local development server
const BASE_URL = "http://localhost:3000";

async function makeRequest(endpoint, vin) {
  const url = `${BASE_URL}${endpoint.path}`;
  const options = {
    method: endpoint.method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (endpoint.method === "POST" && endpoint.body) {
    const body = JSON.stringify(endpoint.body).replace("VIN_PLACEHOLDER", vin);
    options.body = body;
  } else if (endpoint.method === "GET" && endpoint.params) {
    const params = new URLSearchParams(endpoint.params)
      .toString()
      .replace("VIN_PLACEHOLDER", vin);
    return fetch(`${url}?${params}`, options);
  }

  return fetch(url, options);
}

async function captureResponse(endpoint, vin) {
  try {
    console.log(`Testing ${endpoint.path} with VIN: ${vin}`);

    const response = await makeRequest(endpoint, vin);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error ${response.status}: ${errorText}`);

      // Try to parse error as JSON for more details
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.details) {
          console.log(`   Details: ${errorJson.details}`);
        }
      } catch (e) {
        // Not JSON, just show the text
      }

      return null;
    }

    const data = await response.json();
    console.log(`✅ Success for ${endpoint.path}`);
    return data;
  } catch (error) {
    console.log(`❌ Network error for ${endpoint.path}:`, error.message);
    return null;
  }
}

function saveDemoData(apiPath, response, vin) {
  if (!response) return;

  // Convert API path to file path
  const filePath = path.join(
    process.cwd(),
    "demo-data",
    apiPath.replace("/api/", "") + ".json",
  );

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save the response with metadata - FORCE OVERWRITE
  const demoData = {
    ...response,
    _metadata: {
      captured_at: new Date().toISOString(),
      vin: vin,
      source: "real_api_response",
    },
  };

  fs.writeFileSync(filePath, JSON.stringify(demoData, null, 2));
  console.log(`💾 Saved: ${filePath}`);
}

function compareWithExisting(apiPath, newResponse) {
  if (!newResponse) return;

  const filePath = path.join(
    process.cwd(),
    "demo-data",
    apiPath.replace("/api/", "") + ".json",
  );

  if (!fs.existsSync(filePath)) {
    console.log(`📝 New file: ${apiPath}`);
    return;
  }

  try {
    const existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Remove metadata for comparison
    const existingClean = { ...existingData };
    const newClean = { ...newResponse };
    delete existingClean._metadata;
    delete newClean._metadata;

    const isEqual = JSON.stringify(existingClean) === JSON.stringify(newClean);

    if (isEqual) {
      console.log(`✅ No changes: ${apiPath}`);
    } else {
      console.log(
        `🔄 Updated: ${apiPath} (Real API response structure differs from demo)`,
      );
    }
  } catch (error) {
    console.log(`⚠️  Could not compare: ${apiPath} - ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Starting API response capture...\n");
  console.log(
    "Make sure your development server is running on http://localhost:3000",
  );
  console.log("And that DEMO_MODE is NOT enabled (use normal npm run dev)\n");

  // Test with the first VIN that works
  let workingVin = null;

  for (const vin of TEST_VINS) {
    console.log(`\n🔍 Testing VIN: ${vin}`);

    // Test a simple endpoint first
    const testResponse = await captureResponse(API_ENDPOINTS[0], vin);
    if (testResponse && testResponse.success) {
      workingVin = vin;
      console.log(`✅ Working VIN found: ${vin}`);
      break;
    } else {
      console.log(`❌ VIN ${vin} failed, trying next...`);
    }
  }

  if (!workingVin) {
    console.log("\n❌ No working VIN found. Please:");
    console.log("1. Make sure the dev server is running (npm run dev)");
    console.log("2. Check that API keys are configured");
    console.log("3. Verify network connectivity");
    process.exit(1);
  }

  console.log(`\n📡 Capturing responses with VIN: ${workingVin}\n`);

  // Capture all responses
  const results = [];

  for (const endpoint of API_ENDPOINTS) {
    const response = await captureResponse(endpoint, workingVin);

    if (response && response.success) {
      saveDemoData(endpoint.path, response, workingVin);
      compareWithExisting(endpoint.path, response);
      results.push({ endpoint: endpoint.path, status: "success" });
    } else {
      console.log(`⚠️  Failed to capture: ${endpoint.path}`);
      results.push({ endpoint: endpoint.path, status: "failed", response });
    }
  }

  // Summary
  console.log("\n📊 Summary:");
  console.log(`Total endpoints tested: ${API_ENDPOINTS.length}`);
  console.log(
    `Successful captures: ${results.filter((r) => r.status === "success").length}`,
  );
  console.log(
    `Failed captures: ${results.filter((r) => r.status === "failed").length}`,
  );

  // Show failed endpoints
  const failed = results.filter((r) => r.status === "failed");
  if (failed.length > 0) {
    console.log("\n❌ Failed endpoints:");
    failed.forEach((f) => {
      console.log(`  - ${f.endpoint}`);
      if (f.response) {
        console.log(
          `    Error: ${JSON.stringify(f.response).substring(0, 100)}...`,
        );
      }
    });
  }

  console.log("\n✅ Demo data update complete!");
  console.log("\nTo use the updated demo data:");
  console.log("1. Stop the dev server");
  console.log("2. Run: npm run dev:demo");
}

// Run the script
main().catch(console.error);
