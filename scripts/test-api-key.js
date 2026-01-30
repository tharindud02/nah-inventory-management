#!/usr/bin/env node

// Simple script to test MarketCheck API connectivity

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

async function testAPI() {
  console.log("🔑 Testing MarketCheck API connectivity...\n");
  console.log(`API Key: ${MARKETCHECK_API_KEY.substring(0, 8)}...`);
  console.log(`Base URL: ${MARKETCHECK_BASE_URL}\n`);

  // Test with a simple search endpoint - using correct v2 API
  const testUrl = `${MARKETCHECK_BASE_URL}/v2/search/car/active?api_key=${MARKETCHECK_API_KEY}&rows=1`;

  try {
    console.log("📡 Testing basic search endpoint...");
    const response = await fetch(testUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ API Error ${response.status}:`);
      console.log(errorText);

      if (response.status === 401) {
        console.log("\n💡 This suggests your API key is invalid or expired.");
      } else if (response.status === 403) {
        console.log(
          "\n💡 This suggests your API key doesn't have permission for this endpoint.",
        );
      }

      return false;
    }

    const data = await response.json();
    console.log("✅ API connection successful!");
    console.log(`Found ${data.num_found || 0} total listings`);

    // Test valuation with a known good VIN - using correct v2 API with required parameters
    console.log("\n🚗 Testing valuation endpoint...");
    const valuationUrl = `${MARKETCHECK_BASE_URL}/v2/predict/car/us/marketcheck_price?api_key=${MARKETCHECK_API_KEY}&vin=1HGCM82633A123456&miles=15000&zip=90210&dealer_type=franchise`;

    const valuationResponse = await fetch(valuationUrl);

    if (!valuationResponse.ok) {
      const errorText = await valuationResponse.text();
      console.log(`❌ Valuation Error ${valuationResponse.status}:`);
      console.log(errorText);
      return false;
    }

    const valuationData = await valuationResponse.json();
    console.log("✅ Valuation endpoint working!");
    console.log("Sample response structure:");
    console.log(
      JSON.stringify(valuationData, null, 2).substring(0, 500) + "...",
    );

    return true;
  } catch (error) {
    console.log("❌ Network error:", error.message);
    return false;
  }
}

async function testWorkingVINs() {
  console.log("\n🔍 Testing some common VINs that might work...\n");

  const commonVINs = [
    "1HGCM82633A123456", // Honda
    "1N4AL3AP9JC123456", // Nissan
    "2T3BF4DV9AW123456", // Toyota RAV4
    "4T1BF1FK9EU123456", // Toyota Camry
    "1G1YY1G8G55123456", // Chevrolet
  ];

  for (const vin of commonVINs) {
    console.log(`Testing VIN: ${vin}`);
    const valuationUrl = `${MARKETCHECK_BASE_URL}/v2/predict/car/us/marketcheck_price?api_key=${MARKETCHECK_API_KEY}&vin=${vin}&miles=15000&zip=90210&dealer_type=franchise`;

    try {
      const response = await fetch(valuationUrl);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ VIN ${vin} works!`);
        console.log(`   Market value: ${data.marketcheck_price || "N/A"}`);
        return vin; // Return the first working VIN
      } else {
        const errorText = await response.text();
        console.log(`❌ VIN ${vin} failed: ${response.status}`);
        if (errorText.includes("no Route matched")) {
          console.log("   (VIN not found in MarketCheck database)");
        }
      }
    } catch (error) {
      console.log(`❌ Network error for VIN ${vin}: ${error.message}`);
    }

    console.log(""); // Empty line for readability
  }

  return null;
}

async function main() {
  console.log("🧪 MarketCheck API Test Script\n");

  const apiWorks = await testAPI();

  if (apiWorks) {
    const workingVin = await testWorkingVINs();

    if (workingVin) {
      console.log(`\n🎉 Success! Found working VIN: ${workingVin}`);
      console.log("\nYou can now run:");
      console.log("npm run demo:capture");
    } else {
      console.log("\n⚠️  API works but no test VINs found valuation data.");
      console.log("This might be normal - not all VINs have valuation data.");
      console.log("Try running the capture script anyway to see what works.");
    }
  } else {
    console.log("\n❌ API connectivity issues detected.");
    console.log("Please check:");
    console.log("1. Your MarketCheck API key is valid");
    console.log("2. You have internet connectivity");
    console.log("3. Your API plan includes valuation endpoints");
  }
}

// Run the test
main().catch(console.error);
