#!/usr/bin/env node

/**
 * Test Puppeteer Installation
 * 
 * This script tests that Puppeteer is properly installed and working
 */

const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('🎯 Testing Puppeteer Installation\n');

  try {
    console.log('📦 Puppeteer version:', require('puppeteer/package.json').version);
    
    console.log('\n🚀 Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('✅ Browser launched successfully');

    const page = await browser.newPage();
    console.log('✅ New page created');

    // Test navigation
    console.log('\n🌐 Testing navigation to example.com...');
    await page.goto('https://example.com');
    const title = await page.title();
    console.log('✅ Page title:', title);

    // Test screenshot capability
    console.log('\n📸 Testing screenshot capability...');
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('✅ Screenshot saved as test-screenshot.png');

    await browser.close();
    console.log('\n✅ Browser closed successfully');

    console.log('\n🎉 Puppeteer is working correctly!');
    console.log('\n📋 Puppeteer MCP Features Available:');
    console.log('   - Browser automation');
    console.log('   - Web scraping');
    console.log('   - Screenshot capture');
    console.log('   - PDF generation');
    console.log('   - Form automation');
    console.log('   - Testing automation');

  } catch (error) {
    console.error('❌ Puppeteer test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testPuppeteer();
}

module.exports = { testPuppeteer };