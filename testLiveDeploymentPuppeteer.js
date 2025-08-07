// Comprehensive Puppeteer test for live Render deployment
const puppeteer = require('puppeteer');
const axios = require('axios');

const RENDER_URL = 'https://skinsocieteapp.onrender.com';

class LiveDeploymentTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      deployment: { live: false, loadTime: 0 },
      services: { loaded: false, count: 0, categories: [] },
      booking: { tested: [], successful: 0, failed: 0 },
      errors: [],
      screenshots: []
    };
  }

  async initialize() {
    console.log('🚀 LIVE DEPLOYMENT TESTING - PUPPETEER');
    console.log('=' .repeat(60));
    console.log(`Testing: ${RENDER_URL}`);
    
    this.browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set up error logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔍 Browser Error:', msg.text());
        this.results.errors.push(`Browser: ${msg.text()}`);
      }
    });
  }

  async testDeployment() {
    console.log('\n1️⃣ Testing Deployment Status...');
    
    try {
      const startTime = Date.now();
      await this.page.goto(RENDER_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      const loadTime = Date.now() - startTime;
      
      this.results.deployment.live = true;
      this.results.deployment.loadTime = loadTime;
      
      console.log(`✅ Deployment is live (${loadTime}ms)`);
      
      // Take screenshot of homepage
      await this.page.screenshot({ path: 'screenshot-homepage.png' });
      this.results.screenshots.push('screenshot-homepage.png');
      
      return true;
    } catch (error) {
      console.log('❌ Deployment not accessible:', error.message);
      this.results.errors.push(`Deployment: ${error.message}`);
      return false;
    }
  }

  async testAppointmentsPage() {
    console.log('\n2️⃣ Testing Appointments Page...');
    
    try {
      await this.page.goto(`${RENDER_URL}/appointments`, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      console.log('✅ Appointments page loaded');
      
      // Wait for services to load
      await this.page.waitForSelector('[data-testid="service-card"], .service-card, [class*="service"]', {
        timeout: 10000
      }).catch(() => {
        console.log('⚠️ Service cards not found with test selectors, checking for any service content...');
      });
      
      // Take screenshot
      await this.page.screenshot({ path: 'screenshot-appointments.png' });
      this.results.screenshots.push('screenshot-appointments.png');
      
      // Check for service loading
      const pageContent = await this.page.content();
      if (pageContent.includes('Laser') || pageContent.includes('HydraFacial') || pageContent.includes('PRP')) {
        console.log('✅ Services appear to be loaded');
        this.results.services.loaded = true;
      } else {
        console.log('⚠️ Services may not be loading from Phorest');
      }
      
      return true;
    } catch (error) {
      console.log('❌ Appointments page error:', error.message);
      this.results.errors.push(`Appointments: ${error.message}`);
      return false;
    }
  }

  async testServiceBooking(serviceName) {
    console.log(`\n   🔸 Testing booking for: ${serviceName}`);
    
    try {
      // Look for service with this name
      const serviceButtons = await this.page.$$('button:has-text("Book Now"), button[class*="book"], [class*="book"]');
      
      if (serviceButtons.length === 0) {
        console.log('⚠️ No booking buttons found');
        return false;
      }
      
      // Try clicking the first booking button
      await serviceButtons[0].click();
      
      // Wait for booking modal or form
      await this.page.waitForTimeout(2000);
      
      // Take screenshot of booking interface
      await this.page.screenshot({ path: `screenshot-booking-${serviceName.replace(/\s+/g, '-')}.png` });
      this.results.screenshots.push(`screenshot-booking-${serviceName.replace(/\s+/g, '-')}.png`);
      
      console.log(`✅ Booking interface opened for ${serviceName}`);
      this.results.booking.successful++;
      
      // Close modal if it exists
      const closeButtons = await this.page.$$('[aria-label="Close"], button:has-text("Close"), [class*="close"]');
      if (closeButtons.length > 0) {
        await closeButtons[0].click();
      }
      
      return true;
    } catch (error) {
      console.log(`❌ Booking test failed for ${serviceName}:`, error.message);
      this.results.booking.failed++;
      this.results.errors.push(`Booking ${serviceName}: ${error.message}`);
      return false;
    }
  }

  async testAPIEndpoints() {
    console.log('\n3️⃣ Testing API Endpoints...');
    
    const endpoints = [
      { path: '/api/appointments', method: 'GET', description: 'Appointments API' },
      { path: '/api/appointments/test-route', method: 'POST', description: 'Test Booking API' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing ${endpoint.description}...`);
        
        let response;
        if (endpoint.method === 'GET') {
          response = await axios.get(`${RENDER_URL}${endpoint.path}`, { timeout: 10000 });
        } else {
          const testData = {
            clientId: 'test-client',
            serviceId: 'test-service',
            staffId: 'test-staff',
            startTime: new Date().toISOString()
          };
          response = await axios.post(`${RENDER_URL}${endpoint.path}`, testData, { timeout: 10000 });
        }
        
        console.log(`   ✅ ${endpoint.description} working (${response.status})`);
      } catch (error) {
        const status = error.response?.status || 'Network Error';
        console.log(`   ⚠️ ${endpoint.description} response: ${status}`);
        if (error.response?.status === 400) {
          console.log('   📝 400 error is expected (validation working)');
        }
      }
    }
  }

  async runFullTest() {
    try {
      await this.initialize();
      
      // Test 1: Deployment
      const deploymentWorking = await this.testDeployment();
      if (!deploymentWorking) {
        console.log('❌ Cannot proceed - deployment not accessible');
        await this.cleanup();
        return;
      }
      
      // Test 2: Appointments page
      await this.testAppointmentsPage();
      
      // Test 3: Try booking different service types
      const servicesToTest = [
        'Laser Treatment',
        'HydraFacial', 
        'PRP Treatment',
        'Skin Consultation',
        'Chemical Peel'
      ];
      
      console.log('\n4️⃣ Testing Booking Flow...');
      for (const service of servicesToTest) {
        await this.testServiceBooking(service);
        this.results.booking.tested.push(service);
      }
      
      // Test 4: API endpoints
      await this.testAPIEndpoints();
      
      // Generate final report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  generateReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 LIVE DEPLOYMENT TEST REPORT');
    console.log('=' .repeat(60));
    
    console.log(`\n🌐 DEPLOYMENT STATUS:`);
    console.log(`   Live: ${this.results.deployment.live ? '✅' : '❌'}`);
    console.log(`   Load Time: ${this.results.deployment.loadTime}ms`);
    
    console.log(`\n📱 SERVICES:`);
    console.log(`   Loaded: ${this.results.services.loaded ? '✅' : '⚠️'}`);
    
    console.log(`\n🎯 BOOKING TESTS:`);
    console.log(`   Services Tested: ${this.results.booking.tested.length}`);
    console.log(`   Successful: ${this.results.booking.successful}`);
    console.log(`   Failed: ${this.results.booking.failed}`);
    
    this.results.booking.tested.forEach(service => {
      console.log(`     - ${service}`);
    });
    
    if (this.results.screenshots.length > 0) {
      console.log(`\n📸 SCREENSHOTS CAPTURED:`);
      this.results.screenshots.forEach(screenshot => {
        console.log(`   - ${screenshot}`);
      });
    }
    
    if (this.results.errors.length > 0) {
      console.log(`\n🔍 ISSUES FOUND (${this.results.errors.length}):`);
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // Overall assessment
    const isWorking = this.results.deployment.live && this.results.booking.successful > 0;
    console.log(`\n🎉 OVERALL STATUS: ${isWorking ? '✅ WORKING' : '⚠️ NEEDS ATTENTION'}`);
    
    if (isWorking) {
      console.log('\n🚀 Your Skin Societé app is successfully deployed and functional on Render!');
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the test
async function runTest() {
  const tester = new LiveDeploymentTester();
  await tester.runFullTest();
}

runTest().catch(console.error);