#!/usr/bin/env node

/**
 * Migration script to copy data.json to public/data.json
 * Usage: node scripts/migrate-data.js [path-to-data-file]
 */

const fs = require('fs')
const path = require('path')

const sourceFile = process.argv[2] || 'data (1).json'
const targetFile = path.join(__dirname, '..', 'public', 'data.json')

try {
  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error(`Error: Source file "${sourceFile}" not found.`)
    console.log(`Usage: node scripts/migrate-data.js [path-to-data-file]`)
    process.exit(1)
  }

  // Read source file
  const data = fs.readFileSync(sourceFile, 'utf8')
  
  // Validate JSON
  JSON.parse(data)
  
  // Ensure public directory exists
  const publicDir = path.dirname(targetFile)
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  
  // Copy to public directory
  fs.writeFileSync(targetFile, data)
  
  console.log(`✅ Successfully copied ${sourceFile} to ${targetFile}`)
} catch (error) {
  console.error(`Error: ${error.message}`)
  process.exit(1)
}
