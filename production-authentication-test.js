#!/usr/bin/env node

/**
 * Production Authentication Test
 * 
 * Tests authentication flow and attempts to access the booking functionality
 * once authenticated to verify staff filtering and booking workflow
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AuthenticationTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshots = [];
    this.results = {
      authenticationFlow: null,
      afterAuthBookingAccess: null,
      staffFiltering: null,
      bookingWorkflow: null,
      errors: []
    };
  }

  async setupBrowser() {
    console.log('🚀 Setting up browser...');
    this.browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Monitor important network requests
    this.page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/') && (url.includes('appointment') || url.includes('staff') || url.includes('auth'))) {
        console.log(`📡 API Response: ${response.status()} ${url}`);
      }
    });

    // Monitor console for booking-related messages
    this.page.on('console', msg => {
      const text = msg.text();
      if (text.includes('staff') || text.includes('appointment') || text.includes('booking') || text.includes('error')) {
        console.log(`🟡 Console: ${msg.type().toUpperCase()} - ${text}`);
        if (msg.type() === 'error') {
          this.results.errors.push(text);
        }
      }
    });

    console.log('✅ Browser setup complete');
  }

  async takeScreenshot(name) {
    const filename = `auth-test-${name}-${Date.now()}.png`;
    await this.page.screenshot({
      path: path.join(__dirname, filename),
      fullPage: true
    });
    this.screenshots.push(filename);
    console.log(`📷 Screenshot: ${filename}`);
    return filename;
  }

  async testSignInFlow() {
    console.log('\n🔐 Testing sign-in flow...');
    
    try {
      await this.page.goto('https://skinsocieteapp.onrender.com/appointments', {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      await this.takeScreenshot('01-initial-page');

      // Wait for page to stabilize
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Look for sign in button
      const signInButton = await this.page.$('button');
      const buttons = await this.page.$$('button');
      
      console.log(`🔍 Found ${buttons.length} buttons on page`);
      
      let signInFound = false;
      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].evaluate(el => el.innerText);
        console.log(`   Button ${i + 1}: "${buttonText}"`);
        
        if (buttonText && buttonText.toLowerCase().includes('sign in')) {
          console.log('🎯 Found Sign In button, clicking...');
          await buttons[i].click();
          signInFound = true;
          break;
        }
      }

      if (!signInFound) {
        console.log('⚠️  No Sign In button found, checking current state...');
        await this.takeScreenshot('02-no-signin-found');
        
        // Check if we're already on an auth page or if auth is different
        const pageUrl = this.page.url();
        const pageText = await this.page.evaluate(() => document.body.innerText.substring(0, 1000));
        
        console.log(`Current URL: ${pageUrl}`);
        console.log(`Page contains: ${pageText.substring(0, 200)}...`);
        
        this.results.authenticationFlow = {
          success: false,
          reason: 'No sign in button found',
          currentUrl: pageUrl,
          hasContent: pageText.length > 0
        };
        
        return false;
      }

      // Wait for auth redirect
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const newUrl = this.page.url();
      console.log(`🔗 After sign in click: ${newUrl}`);
      
      await this.takeScreenshot('03-after-signin-click');
      
      // Check if we're on an auth provider page
      if (newUrl.includes('clerk') || newUrl.includes('auth') || newUrl !== 'https://skinsocieteapp.onrender.com/appointments') {
        console.log('✅ Successfully redirected to authentication page');
        
        // Look for auth options (Google, email, etc.)
        const pageText = await this.page.evaluate(() => document.body.innerText);
        const hasGoogleAuth = pageText.toLowerCase().includes('google');
        const hasEmailAuth = pageText.toLowerCase().includes('email') || pageText.toLowerCase().includes('continue');
        
        console.log('🔍 Auth options available:', {
          hasGoogleAuth,
          hasEmailAuth,
          pageText: pageText.substring(0, 300)
        });
        
        this.results.authenticationFlow = {
          success: true,
          redirectedToAuth: true,
          finalUrl: newUrl,
          authOptions: { hasGoogleAuth, hasEmailAuth }
        };
        
        return true;
      } else {
        console.log('⚠️  No auth redirect occurred');
        this.results.authenticationFlow = {
          success: false,
          reason: 'No auth redirect after clicking sign in',
          finalUrl: newUrl
        };
        return false;
      }
      
    } catch (error) {
      console.error('❌ Sign in flow failed:', error.message);
      this.results.authenticationFlow = {
        success: false,
        error: error.message
      };
      return false;
    }
  }

  async testWithoutAuthentication() {
    console.log('\n🔓 Testing functionality without authentication...');
    
    try {
      // Go back to appointments page
      await this.page.goto('https://skinsocieteapp.onrender.com/appointments', {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for loading to complete
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      await this.takeScreenshot('04-without-auth');

      // Analyze what's available without auth
      const pageAnalysis = await this.page.evaluate(() => {
        const pageText = document.body.innerText.toLowerCase();
        
        // Look for various elements and content
        const analysis = {
          // Service-related content
          hasServiceContent: pageText.includes('service') || pageText.includes('treatment'),
          hasBookingContent: pageText.includes('book') || pageText.includes('appointment'),
          
          // Staff-related content
          mentionsStaff: pageText.includes('staff') || pageText.includes('practitioner'),
          mentionsIsabelle: pageText.includes('isabelle'),
          mentionsMel: pageText.includes('mel'),
          mentionsCottesloe: pageText.includes('cottesloe'),
          
          // Specific errors or messages
          hasLoadingMessage: pageText.includes('loading'),
          hasPhorestMessage: pageText.includes('phorest'),
          hasInvalidBookingError: pageText.includes('booking details are invalid'),
          
          // UI elements
          hasSkeletonLoaders: document.querySelectorAll('[class*="skeleton"], [class*="animate-pulse"]').length,
          buttonCount: document.querySelectorAll('button').length,
          
          // Mode selectors
          hasConcernMode: pageText.includes('by concern'),
          hasGalleryMode: pageText.includes('gallery view'),
          hasListMode: pageText.includes('list view'),
          
          // Get actual button texts
          buttonTexts: Array.from(document.querySelectorAll('button')).map(btn => btn.innerText).slice(0, 10),
          
          // Status messages
          statusMessages: Array.from(document.querySelectorAll('div')).map(div => div.innerText)
            .filter(text => text && (text.includes('Loading') || text.includes('Booking') || text.includes('Phorest')))
            .slice(0, 5)
        };
        
        return analysis;
      });
      
      console.log('🔍 Page analysis (without auth):', {
        hasServices: pageAnalysis.hasServiceContent,
        mentionsStaff: pageAnalysis.mentionsStaff,
        hasLoading: pageAnalysis.hasLoadingMessage,
        skeletonCount: pageAnalysis.hasSkeletonLoaders,
        buttonCount: pageAnalysis.buttonCount
      });
      
      if (pageAnalysis.buttonTexts.length > 0) {
        console.log('📋 Available buttons:', pageAnalysis.buttonTexts);
      }
      
      if (pageAnalysis.statusMessages.length > 0) {
        console.log('📄 Status messages:', pageAnalysis.statusMessages);
      }
      
      // Try to interact with available mode selectors
      console.log('\n🎯 Testing mode selectors...');
      
      const modeButtons = ['By Concern', 'Gallery View', 'List View'];
      
      for (const mode of modeButtons) {
        try {
          const button = await this.page.$(`button:has-text("${mode}")`);
          if (button) {
            console.log(`✅ Found "${mode}" button, clicking...`);
            await button.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await this.takeScreenshot(`05-mode-${mode.replace(/\s+/g, '-').toLowerCase()}`);
          } else {
            // Try alternative selector
            const buttons = await this.page.$$('button');
            for (let btn of buttons) {
              const text = await btn.evaluate(el => el.innerText);
              if (text && text.includes(mode)) {
                console.log(`✅ Found "${mode}" button via text search, clicking...`);
                await btn.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                break;
              }
            }
          }
        } catch (e) {
          console.log(`⚠️  Could not interact with "${mode}" button`);
        }
      }
      
      this.results.afterAuthBookingAccess = {
        success: true,
        analysis: pageAnalysis
      };
      
      return pageAnalysis;
      
    } catch (error) {
      console.error('❌ Without auth test failed:', error.message);
      this.results.afterAuthBookingAccess = {
        success: false,
        error: error.message
      };
      return null;
    }
  }

  async checkStaffFilteringImplementation() {
    console.log('\n👥 Analyzing staff filtering implementation...');
    
    try {
      // Check the page source for staff filtering logic
      const staffImplementation = await this.page.evaluate(() => {
        const pageSource = document.documentElement.innerHTML;
        
        return {
          // Look for staff-related code in the page source
          hasStaffFiltering: pageSource.includes('staff') && pageSource.includes('filter'),
          hasCottesloeLogic: pageSource.includes('cottesloe') || pageSource.includes('Cottesloe'),
          hasIsabelleReference: pageSource.includes('isabelle') || pageSource.includes('Isabelle'),
          hasMelReference: pageSource.includes('mel') || pageSource.includes('Mel'),
          
          // Look for API endpoints
          hasStaffAPI: pageSource.includes('/api/staff') || pageSource.includes('staff'),
          hasAvailabilityAPI: pageSource.includes('/api/appointments/availability'),
          
          // Check for branch/location filtering
          hasBranchFiltering: pageSource.includes('branch') && pageSource.includes('filter'),
          
          // Look for Phorest integration mentions
          hasPhorestIntegration: pageSource.includes('phorest') || pageSource.includes('Phorest'),
          
          // Check for specific Cottesloe branch ID
          hasCottesloeBranchId: pageSource.includes('wQbnBjP6ztI8nuVpNT6MsQ'),
          
          // Check for qualification filtering
          hasQualificationFiltering: pageSource.includes('qualification') || pageSource.includes('injectable'),
          
          // Sample of relevant code (first 1000 chars containing 'staff' or 'filter')
          relevantCodeSample: pageSource.split('\n')
            .filter(line => line.toLowerCase().includes('staff') || line.toLowerCase().includes('filter'))
            .slice(0, 5)
            .join('\n')
            .substring(0, 500)
        };
      });
      
      console.log('👥 Staff filtering implementation analysis:', {
        hasFiltering: staffImplementation.hasStaffFiltering,
        hasCottesloe: staffImplementation.hasCottesloeLogic,
        hasStaffAPI: staffImplementation.hasStaffAPI,
        hasBranchId: staffImplementation.hasCottesloeBranchId,
        hasQualifications: staffImplementation.hasQualificationFiltering
      });
      
      if (staffImplementation.relevantCodeSample) {
        console.log('📝 Code sample containing staff/filter logic:');
        console.log(staffImplementation.relevantCodeSample);
      }
      
      this.results.staffFiltering = {
        success: true,
        implementation: staffImplementation
      };
      
      return staffImplementation;
      
    } catch (error) {
      console.error('❌ Staff filtering analysis failed:', error.message);
      this.results.staffFiltering = {
        success: false,
        error: error.message
      };
      return null;
    }
  }

  async generateReport() {
    console.log('\n📊 Generating comprehensive report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      testUrl: 'https://skinsocieteapp.onrender.com/appointments',
      results: this.results,
      screenshots: this.screenshots,
      summary: {
        authenticationRequired: this.results.authenticationFlow?.redirectedToAuth || false,
        bookingPageAccessible: this.results.afterAuthBookingAccess?.success || false,
        staffFilteringImplemented: this.results.staffFiltering?.success || false,
        criticalIssues: [],
        recommendations: []
      }
    };
    
    // Analyze for critical issues
    if (this.results.afterAuthBookingAccess?.analysis?.hasInvalidBookingError) {
      report.summary.criticalIssues.push('CRITICAL: "Booking details are invalid" error present');
    }
    
    if (this.results.staffFiltering?.implementation?.hasStaffFiltering === false) {
      report.summary.criticalIssues.push('Staff filtering not implemented in frontend code');
    }
    
    if (!this.results.staffFiltering?.implementation?.hasCottesloeBranchId) {
      report.summary.criticalIssues.push('Cottesloe branch ID not found in code - may affect staff filtering');
    }
    
    // Generate recommendations
    if (report.summary.authenticationRequired) {
      report.summary.recommendations.push('Implement automated test user creation/login for complete booking flow testing');
    }
    
    if (this.results.afterAuthBookingAccess?.analysis?.hasSkeletonLoaders > 0) {
      report.summary.recommendations.push('Services are loading dynamically - increase wait times in tests');
    }
    
    if (this.results.staffFiltering?.implementation?.hasPhorestIntegration) {
      report.summary.recommendations.push('Phorest integration detected - staff filtering likely depends on API responses');
    }
    
    // Save report
    const reportPath = path.join(__dirname, `auth-test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('\n🎯 PRODUCTION AUTHENTICATION & BOOKING TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`🌐 Test URL: ${report.testUrl}`);
    console.log(`🔐 Authentication Required: ${report.summary.authenticationRequired ? 'YES' : 'NO'}`);
    console.log(`📱 Booking Page Accessible: ${report.summary.bookingPageAccessible ? 'YES' : 'NO'}`);
    console.log(`👥 Staff Filtering Code Found: ${report.summary.staffFilteringImplemented ? 'YES' : 'NO'}`);
    
    if (this.results.authenticationFlow?.authOptions) {
      console.log('\n🔓 Authentication Options:');
      console.log(`   Google Auth: ${this.results.authenticationFlow.authOptions.hasGoogleAuth ? 'Available' : 'Not detected'}`);
      console.log(`   Email Auth: ${this.results.authenticationFlow.authOptions.hasEmailAuth ? 'Available' : 'Not detected'}`);
    }
    
    if (this.results.afterAuthBookingAccess?.analysis) {
      const analysis = this.results.afterAuthBookingAccess.analysis;
      console.log('\n📊 Page Content Analysis:');
      console.log(`   Service Content: ${analysis.hasServiceContent ? 'Present' : 'Missing'}`);
      console.log(`   Staff Mentions: ${analysis.mentionsStaff ? 'Present' : 'Missing'}`);
      console.log(`   Cottesloe Mentions: ${analysis.mentionsCottesloe ? 'Present' : 'Missing'}`);
      console.log(`   Isabelle Mentions: ${analysis.mentionsIsabelle ? 'Present' : 'Missing'}`);
      console.log(`   Mel Mentions: ${analysis.mentionsMel ? 'Present' : 'Missing'}`);
      console.log(`   Loading Skeletons: ${analysis.hasSkeletonLoaders}`);
    }
    
    if (this.results.staffFiltering?.implementation) {
      const impl = this.results.staffFiltering.implementation;
      console.log('\n👥 Staff Filtering Implementation:');
      console.log(`   Has Filtering Logic: ${impl.hasStaffFiltering ? 'YES' : 'NO'}`);
      console.log(`   Cottesloe Branch ID: ${impl.hasCottesloeBranchId ? 'FOUND' : 'MISSING'}`);
      console.log(`   Qualification Filtering: ${impl.hasQualificationFiltering ? 'YES' : 'NO'}`);
      console.log(`   Phorest Integration: ${impl.hasPhorestIntegration ? 'YES' : 'NO'}`);
    }
    
    if (report.summary.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      report.summary.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    if (report.summary.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.summary.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    if (this.screenshots.length > 0) {
      console.log('\n📷 Screenshots Captured:');
      this.screenshots.forEach(screenshot => {
        console.log(`   ${screenshot}`);
      });
    }
    
    console.log(`\n📄 Full report: ${reportPath}`);
    console.log('='.repeat(60));
    
    return report;
  }

  async run() {
    console.log('🧪 Starting Production Authentication & Booking Test');
    
    try {
      await this.setupBrowser();
      
      // Test sign in flow
      const signInSuccess = await this.testSignInFlow();
      
      // Test functionality without authentication
      await this.testWithoutAuthentication();
      
      // Check staff filtering implementation
      await this.checkStaffFilteringImplementation();
      
    } catch (error) {
      console.error('💥 Test failed:', error.message);
      this.results.errors.push(`Test execution failed: ${error.message}`);
    } finally {
      await this.generateReport();
      
      if (this.browser) {
        await this.browser.close();
        console.log('🔒 Browser closed');
      }
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new AuthenticationTester();
  tester.run().catch(console.error);
}

module.exports = { AuthenticationTester };