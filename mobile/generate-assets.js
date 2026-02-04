#!/usr/bin/env node

/**
 * Simple script to generate placeholder assets for Expo app
 * Run with: node generate-assets.js
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

// Create a minimal valid PNG (1x1 transparent pixel)
// This is a minimal PNG file that will work as a placeholder
const minimalPNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // Width: 1
  0x00, 0x00, 0x00, 0x01, // Height: 1
  0x08, 0x06, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
  0x1F, 0x15, 0xC4, 0x89, // CRC
  0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // Compressed data
  0x0D, 0x0A, 0x2D, 0xB4, // CRC
  0x00, 0x00, 0x00, 0x00, // IEND chunk length
  0x49, 0x45, 0x4E, 0x44, // IEND
  0xAE, 0x42, 0x60, 0x82  // CRC
]);

const assets = [
  'icon.png',
  'splash.png',
  'adaptive-icon.png',
  'favicon.png'
];

console.log('Generating placeholder assets...');

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, minimalPNG);
    console.log(`Created: ${asset}`);
  } else {
    console.log(`Skipped: ${asset} (already exists)`);
  }
});

console.log('\nPlaceholder assets created!');
console.log('Note: Replace these with proper images before production builds.');
