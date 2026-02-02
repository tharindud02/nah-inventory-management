import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const DEMO_MODE = process.env.DEMO_MODE === "true";

export interface DemoResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
}

export function getDemoData(apiPath: string): DemoResponse {
  try {
    // Convert API path to file path
    // Example: /api/vindata/valuation -> demo-data/api/vindata/valuation.json
    const filePath = path.join(
      process.cwd(),
      "demo-data",
      apiPath.replace("/api/", "") + ".json",
    );

    const fileContent = readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    return data;
  } catch (error) {
    return {
      success: false,
      error: "Demo data not found",
      details: `No demo data available for ${apiPath}`,
    };
  }
}

export function handleDemoMode(
  request: NextRequest,
  apiPath: string,
): NextResponse | null {
  if (!DEMO_MODE) {
    return null;
  }

  // For POST requests, we might want to return different data based on the request body
  // For now, we'll return the same demo data regardless of the request
  const demoResponse = getDemoData(apiPath);

  return NextResponse.json(demoResponse, {
    status: demoResponse.success ? 200 : 404,
  });
}

// Helper function to create demo data for new APIs
export function createDemoDataFile(apiPath: string, data: any): void {
  try {
    const filePath = path.join(
      process.cwd(),
      "demo-data",
      apiPath.replace("/api/", "") + ".json",
    );

    // Ensure directory exists
    const dir = path.dirname(filePath);
    require("fs").mkdirSync(dir, { recursive: true });

    require("fs").writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {}
}

// Middleware to check if demo mode is active
export function demoModeMiddleware(request: NextRequest): boolean {
  return DEMO_MODE;
}
