#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findJsonFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function compareObjects(obj1, obj2, path = '') {
  const differences = [];
  
  // Remove metadata if present
  const cleanObj1 = { ...obj1 };
  const cleanObj2 = { ...obj2 };
  delete cleanObj1._metadata;
  delete cleanObj2._metadata;
  
  const keys1 = Object.keys(cleanObj1);
  const keys2 = Object.keys(cleanObj2);
  
  // Check for missing keys
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      differences.push({
        type: 'missing_in_obj2',
        path: `${path}.${key}`,
        value: cleanObj1[key]
      });
    }
  }
  
  for (const key of keys2) {
    if (!keys1.includes(key)) {
      differences.push({
        type: 'missing_in_obj1',
        path: `${path}.${key}`,
        value: cleanObj2[key]
      });
    }
  }
  
  // Check for value differences
  for (const key of keys1) {
    if (keys2.includes(key)) {
      const val1 = cleanObj1[key];
      const val2 = cleanObj2[key];
      
      if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
        const nestedDiffs = compareObjects(val1, val2, `${path}.${key}`);
        differences.push(...nestedDiffs);
      } else if (val1 !== val2) {
        differences.push({
          type: 'value_mismatch',
          path: `${path}.${key}`,
          value1: val1,
          value2: val2
        });
      }
    }
  }
  
  return differences;
}

function formatDifferences(differences) {
  if (differences.length === 0) {
    return '✅ No differences found';
  }
  
  let output = '\n📋 Differences found:\n';
  
  differences.forEach(diff => {
    switch (diff.type) {
      case 'missing_in_obj1':
        output += `  ➕ Added: ${diff.path} = ${JSON.stringify(diff.value)}\n`;
        break;
      case 'missing_in_obj2':
        output += `  ➖ Removed: ${diff.path} = ${JSON.stringify(diff.value)}\n`;
        break;
      case 'value_mismatch':
        output += `  🔄 Changed: ${diff.path}\n`;
        output += `    Old: ${JSON.stringify(diff.value1)}\n`;
        output += `    New: ${JSON.stringify(diff.value2)}\n`;
        break;
    }
  });
  
  return output;
}

function analyzeStructure(obj, path = '') {
  const analysis = {
    path,
    type: Array.isArray(obj) ? 'array' : typeof obj,
    keys: typeof obj === 'object' && obj !== null ? Object.keys(obj) : [],
    size: Array.isArray(obj) ? obj.length : (typeof obj === 'object' && obj !== null ? Object.keys(obj).length : 0)
  };
  
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    analysis.children = {};
    for (const key of obj.keys) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        analysis.children[key] = analyzeStructure(obj[key], `${path}.${key}`);
      }
    }
  }
  
  return analysis;
}

function main() {
  console.log('🔍 Comparing demo data with real API responses...\n');
  
  const demoDataDir = path.join(process.cwd(), 'demo-data');
  const jsonFiles = findJsonFiles(demoDataDir);
  
  console.log(`Found ${jsonFiles.length} demo data files\n`);
  
  // Check if we have real responses to compare with
  const realResponsesDir = path.join(process.cwd(), 'real-responses');
  let hasRealResponses = false;
  
  if (fs.existsSync(realResponsesDir)) {
    hasRealResponses = true;
    console.log('📁 Found real responses directory\n');
  }
  
  for (const file of jsonFiles) {
    const relativePath = path.relative(demoDataDir, file);
    const apiPath = '/api/' + relativePath.replace('.json', '');
    
    console.log(`📄 Analyzing: ${apiPath}`);
    
    try {
      const demoData = JSON.parse(fs.readFileSync(file, 'utf-8'));
      
      // Check if it has metadata (indicating it's from real API)
      if (demoData._metadata) {
        console.log(`  ✅ This file contains real API response data`);
        console.log(`  📅 Captured: ${demoData._metadata.captured_at}`);
        console.log(`  🚗 VIN: ${demoData._metadata.vin}`);
      } else {
        console.log(`  ⚠️  This file contains simulated demo data`);
      }
      
      // Analyze structure
      const structure = analyzeStructure(demoData.data || demoData);
      console.log(`  🏗️  Structure: ${structure.type} with ${structure.size} top-level items`);
      
      // If we have real responses, compare them
      if (hasRealResponses) {
        const realFile = path.join(realResponsesDir, relativePath);
        if (fs.existsSync(realFile)) {
          const realData = JSON.parse(fs.readFileSync(realFile, 'utf-8'));
          const differences = compareObjects(demoData, realData);
          console.log(formatDifferences(differences));
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`  ❌ Error reading file: ${error.message}\n`);
    }
  }
  
  if (!hasRealResponses) {
    console.log('\n💡 To compare with real responses:');
    console.log('1. Run: npm run dev (normal mode, not demo mode)');
    console.log('2. Run: node scripts/capture-real-responses.js');
    console.log('3. This script will create real responses for comparison');
  }
}

// Run the script
main().catch(console.error);
