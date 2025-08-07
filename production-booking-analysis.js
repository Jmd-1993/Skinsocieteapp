#!/usr/bin/env node

/**
 * Production Booking Analysis
 * 
 * Analyzes the Skin Societe booking page to understand:
 * - Authentication requirements
 * - Page structure and loading behavior
 * - Available booking interfaces
 * - Staff filtering implementation
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class BookingAnalyzer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.analysis = {
      pageStructure: null,
      authentication: null,
      bookingInterface: null,
      networkRequests: [],
      errors: []
    };
  }

  async setupBrowser() {
    console.log('🚀 Launching browser for analysis...');
    this.browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    
    // Monitor network requests
    this.page.on('request', request => {
      if (request.url().includes('api') || request.url().includes('appointment')) {
        this.analysis.networkRequests.push({
          url: request.url(),
          method: request.method(),
          type: 'request'
        });
      }
    });

    this.page.on('response', response => {
      if (response.url().includes('api') || response.url().includes('appointment')) {
        this.analysis.networkRequests.push({
          url: response.url(),
          status: response.status(),
          type: 'response'
        });
      }
    });

    // Monitor console messages
    this.page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warn') {
        this.analysis.errors.push(`${type.toUpperCase()}: ${msg.text()}`);
      }
    });

    console.log('✅ Browser setup complete');
  }

  async analyzePageStructure() {
    console.log('\n📊 Analyzing page structure...');
    
    try {
      await this.page.goto('https://skinsocieteapp.onrender.com/appointments', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await this.takeScreenshot('initial-load');

      // Wait for potential dynamic loading
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const pageInfo = await this.page.evaluate(() => {
      const pageText = document.body.innerText;
      
      return {
        title: document.title,
        url: window.location.href,
        bodyText: pageText,
        
        // Authentication indicators
        hasSignInButton: pageText.toLowerCase().includes('sign in'),
        hasLoginForm: document.querySelector('form[action*="login"]') !== null,
        isUserAuthenticated: pageText.toLowerCase().includes('welcome') && !pageText.toLowerCase().includes('sign in'),
        
        // Loading indicators
        hasSkeletonLoaders: document.querySelectorAll('[class*="skeleton"], [class*="loading"], [class*="animate-pulse"]').length,
        
        // Booking elements
        bookingElements: {
          bookButtons: Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.innerText && btn.innerText.toLowerCase().includes('book')).length,
          serviceCards: document.querySelectorAll('[class*="service"], [class*="treatment"]').length,
          appointmentElements: Array.from(document.querySelectorAll('*')).filter(el => 
            el.innerText && el.innerText.toLowerCase().includes('appointment')).length,
        },
        
        // Navigation elements
        hasBookingNavigation: pageText.toLowerCase().includes('book') && 
                            (document.querySelector('nav') || document.querySelector('[role="navigation"]')),
        
        // Content analysis
        pageLength: pageText.length,
        elementCount: document.querySelectorAll('*').length,
        hasContent: pageText.length > 100,
        
        // Specific search for staff/filtering elements
        mentionsStaff: pageText.toLowerCase().includes('staff') || 
                      pageText.toLowerCase().includes('practitioner') ||
                      pageText.toLowerCase().includes('therapist'),
        mentionsIsabelle: pageText.toLowerCase().includes('isabelle'),
        mentionsMel: pageText.toLowerCase().includes('mel'),
        mentionsCottesloe: pageText.toLowerCase().includes('cottesloe'),
      };
    });

    await this.takeScreenshot('after-analysis');

    this.analysis.pageStructure = pageInfo;
    console.log('📊 Page analysis complete:', pageInfo ? {
      hasContent: pageInfo.hasContent,
      isAuthenticated: pageInfo.isUserAuthenticated,
      hasSkeletons: pageInfo.hasSkeletonLoaders > 0,
      bookingElements: pageInfo.bookingElements?.bookButtons > 0,
      mentionsStaff: pageInfo.mentionsStaff
    } : 'No page info available');

      return pageInfo;
    } catch (error) {
      console.error('❌ Page structure analysis failed:', error.message);
      this.analysis.errors.push(`Page structure analysis failed: ${error.message}`);
      return null;
    }
  }

  async testAuthenticationFlow() {
    console.log('\n🔐 Testing authentication flow...');
    
    try {
      // Try to find and click sign in
      const signInExists = await this.page.$('button:has-text("Sign In"), a:has-text("Sign In"), [href*="sign"], [href*="login"]');
      
      if (signInExists) {
        console.log('✅ Sign in button found, clicking...');
        await signInExists.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.takeScreenshot('sign-in-clicked');
        
        const currentUrl = this.page.url();
        console.log('🔗 After sign in click:', currentUrl);
        
        this.analysis.authentication = {
          signInButtonFound: true,
          redirectedToAuth: currentUrl !== 'https://skinsocieteapp.onrender.com/appointments',
          finalUrl: currentUrl
        };
      } else {
        console.log('⚠️  No sign in button found');
        this.analysis.authentication = {
          signInButtonFound: false,
          requiresAuth: false
        };
      }
    } catch (error) {
      console.log('❌ Authentication test failed:', error.message);
      this.analysis.authentication = {
        error: error.message
      };
    }
  }

  async analyzeBookingInterface() {
    console.log('\n🎯 Analyzing booking interface...');
    
    // Go back to appointments page
    await this.page.goto('https://skinsocieteapp.onrender.com/appointments', {
      waitUntil: 'networkidle2'
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const interfaceInfo = await this.page.evaluate(() => {
      // Look for React components or booking interface elements
      const reactElements = document.querySelectorAll('[data-reactroot], [data-react-component]');
      
      // Check for booking-specific elements
      const bookingInterface = {
        hasReactElements: reactElements.length > 0,
        hasBookingModal: document.querySelector('[role="dialog"], .modal, [class*="modal"]') !== null,
        hasServiceSelection: document.querySelectorAll('[class*="service"]').length > 0,
        hasStaffSelection: document.querySelectorAll('[class*="staff"]').length > 0,
        hasTimeSlots: document.querySelectorAll('[class*="slot"], [class*="time"]').length > 0,
        
        // Check for API endpoints in page source
        pageSource: document.documentElement.innerHTML,
        hasAPIReferences: document.documentElement.innerHTML.includes('/api/appointments') ||
                         document.documentElement.innerHTML.includes('availability'),
        
        // Look for specific staff names
        hasIsabelleReference: document.documentElement.innerHTML.toLowerCase().includes('isabelle'),
        hasMelReference: document.documentElement.innerHTML.toLowerCase().includes('mel'),
        
        // Check for error messages
        hasErrorMessages: Array.from(document.querySelectorAll('*')).some(el => 
          el.innerText && el.innerText.toLowerCase().includes('error')),
        
        // Dynamic content indicators  
        hasDynamicContent: document.querySelectorAll('[class*="loading"], [class*="skeleton"]').length > 0
      };
      
      return bookingInterface;
    });
    
    await this.takeScreenshot('interface-analysis');
    
    this.analysis.bookingInterface = interfaceInfo;
    console.log('🎯 Interface analysis:', {
      hasReact: interfaceInfo.hasReactElements,
      hasServices: interfaceInfo.hasServiceSelection,
      hasStaff: interfaceInfo.hasStaffSelection,
      hasAPI: interfaceInfo.hasAPIReferences,
      hasDynamic: interfaceInfo.hasDynamicContent
    });
  }

  async takeScreenshot(name) {
    const filename = `analysis-${name}-${Date.now()}.png`;
    await this.page.screenshot({
      path: path.join(__dirname, filename),
      fullPage: true
    });
    console.log(`📷 Screenshot: ${filename}`);
    return filename;
  }

  async generateReport() {
    console.log('\n📋 Generating Analysis Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      url: 'https://skinsocieteapp.onrender.com/appointments',
      analysis: this.analysis,
      recommendations: []
    };
    
    // Generate recommendations based on analysis
    if (this.analysis.pageStructure) {
      if (this.analysis.pageStructure.isUserAuthenticated === false) {
        report.recommendations.push('Authentication required - implement test user login to test booking flow');
      }
      
      if (this.analysis.pageStructure.hasSkeletonLoaders > 0) {
        report.recommendations.push('Page has loading skeletons - may need to wait longer for content to load');
      }
      
      if (!this.analysis.pageStructure.mentionsStaff) {
        report.recommendations.push('No staff mentions detected - staff filtering may need authentication');
      }
    }
    
    if (this.analysis.networkRequests.length === 0) {
      report.recommendations.push('No API requests detected - booking functionality may not be loading');
    }
    
    const reportPath = path.join(__dirname, `booking-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n🎯 BOOKING PAGE ANALYSIS REPORT');
    console.log('='.repeat(50));
    
    if (this.analysis.pageStructure) {
      const ps = this.analysis.pageStructure;
      console.log(`📄 Page: ${ps.title}`);
      console.log(`🔐 Authentication Required: ${!ps.isUserAuthenticated}`);
      console.log(`⏳ Has Loading Elements: ${ps.hasSkeletonLoaders > 0}`);
      console.log(`📱 Has Booking Elements: ${ps.bookingElements.bookButtons > 0}`);
      console.log(`👥 Mentions Staff: ${ps.mentionsStaff}`);
      console.log(`🏥 Mentions Cottesloe: ${ps.mentionsCottesloe}`);
      console.log(`👩‍⚕️ Mentions Isabelle: ${ps.mentionsIsabelle}`);
      console.log(`👩‍⚕️ Mentions Mel: ${ps.mentionsMel}`);
    }
    
    if (this.analysis.networkRequests.length > 0) {
      console.log('\n🌐 Network Requests:');
      this.analysis.networkRequests.forEach(req => {
        console.log(`   ${req.type}: ${req.method || req.status} ${req.url}`);
      });
    }
    
    if (this.analysis.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      this.analysis.errors.forEach(error => {
        console.log(`   ${error}`);
      });
    }
    
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
    console.log(`\n📄 Full report: ${reportPath}`);
    console.log('='.repeat(50));
    
    return report;
  }

  async run() {
    console.log('🔍 Starting Booking Page Analysis');
    console.log('Target: https://skinsocieteapp.onrender.com/appointments');
    
    try {
      await this.setupBrowser();
      await this.analyzePageStructure();
      await this.testAuthenticationFlow();
      await this.analyzeBookingInterface();
      
    } catch (error) {
      console.error('💥 Analysis failed:', error.message);
      this.analysis.errors.push(`Analysis failed: ${error.message}`);
    } finally {
      await this.generateReport();
      
      if (this.browser) {
        await this.browser.close();
        console.log('🔒 Browser closed');
      }
    }
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new BookingAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = { BookingAnalyzer };