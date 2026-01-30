#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Find all API route files
const apiDir = path.join(process.cwd(), 'src/app/api');

function addDemoModeToRoute(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has demo mode
  if (content.includes('handleDemoMode')) {
    console.log(`✓ Already has demo mode: ${filePath}`);
    return;
  }
  
  // Extract the API path from the file path
  const apiPath = filePath.replace(process.cwd(), '').replace('/src/app', '').replace('/route.ts', '');
  
  // Find the import statements
  const importRegex = /import\s+.*\s+from\s+["']next\/server["'];?/;
  const importMatch = content.match(importRegex);
  
  if (!importMatch) {
    console.log(`✗ Could not find Next.js server import: ${filePath}`);
    return;
  }
  
  // Add demo mode import after the Next.js import
  const newImport = importMatch[0] + '\nimport { handleDemoMode } from "@/lib/demo-mode";';
  const updatedContent = content.replace(importRegex, newImport);
  
  // Find the POST function
  const postFunctionRegex = /export\s+async\s+function\s+POST\(request:\s*NextRequest\)\s*{/;
  const postMatch = updatedContent.match(postFunctionRegex);
  
  if (!postMatch) {
    console.log(`✗ Could not find POST function: ${filePath}`);
    return;
  }
  
  // Add demo mode check at the beginning of POST function
  const demoCheck = `export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "${apiPath}");
  if (demoResponse) {
    return demoResponse;
  }`;
  
  const finalContent = updatedContent.replace(postFunctionRegex, demoCheck);
  
  // Write the updated file
  fs.writeFileSync(filePath, finalContent, 'utf-8');
  console.log(`✓ Added demo mode to: ${filePath}`);
}

function findRouteFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item === 'route.ts') {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
console.log('Adding demo mode support to all API routes...\n');

const routeFiles = findRouteFiles(apiDir);
routeFiles.forEach(addDemoModeToRoute);

console.log(`\nDone! Processed ${routeFiles.length} API route files.`);
console.log('\nTo use demo mode:');
console.log('1. Run: npm run dev:demo');
console.log('2. Or copy .env.demo to .env.local and set DEMO_MODE=true');
