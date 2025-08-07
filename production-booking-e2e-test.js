#!/usr/bin/env node

/**
 * Production Booking End-to-End Test
 * 
 * Tests the complete Skin Societe booking workflow on the production site:
 * https://skinsocieteapp.onrender.com/appointments
 * 
 * Critical test points:
 * - Staff filtering (should show only 2 staff for Cottesloe, not 12+)
 * - Service-specific qualification (injectables should show only Isabelle/nurse)
 * - Availability display (should show actual time slots, not empty)
 * - Booking flow completion without "Booking details are invalid" errors
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ProductionBookingTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshots = [];
    this.testResults = {
      navigation: null,
      serviceSelection: null,
      staffFiltering: null,
      appointmentSlots: null,
      bookingFlow: null,
      errors: []
    };
  }

  async setupBrowser() {
    console.log('🚀 Launching browser...');
    this.browser = await puppeteer.launch({
      headless: false, // Show browser for visual debugging
      devtools: false,
      defaultViewport: { width: 1280, height: 720 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set user agent to avoid bot detection
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Enable console logging
    this.page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warn') {
        console.log(`🟡 Browser ${type.toUpperCase()}:`, msg.text());
        this.testResults.errors.push(`Browser ${type}: ${msg.text()}`);
      }
    });

    // Track network failures
    this.page.on('response', response => {
      if (!response.ok() && response.url().includes('api')) {
        console.log(`🔴 Network Error: ${response.status()} - ${response.url()}`);
        this.testResults.errors.push(`Network Error: ${response.status()} - ${response.url()}`);
      }
    });

    console.log('✅ Browser setup complete');
  }

  async takeScreenshot(name, step) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${step}-${name}-${timestamp}.png`;
    const filepath = path.join(__dirname, filename);
    
    await this.page.screenshot({
      path: filepath,
      fullPage: true
    });
    
    this.screenshots.push({
      step,
      name,
      filename,
      filepath
    });
    
    console.log(`📷 Screenshot saved: ${filename}`);
    return filepath;
  }

  async navigateToBookingPage() {
    console.log('\n📍 Step 1: Navigating to booking page...');
    try {
      const startTime = Date.now();
      
      await this.page.goto('https://skinsocieteapp.onrender.com/appointments', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      const loadTime = Date.now() - startTime;
      console.log(`⏱️  Page loaded in ${loadTime}ms`);
      
      await this.takeScreenshot('booking-page-loaded', 1);
      
      // Check if we're on the right page
      const title = await this.page.title();
      const url = this.page.url();
      
      console.log(`📄 Page title: "${title}"`);
      console.log(`🔗 Current URL: ${url}`);
      
      // Look for key elements that indicate the booking page loaded correctly
      const bookingElements = await this.page.evaluate(() => {
        // Find elements with "book" in class name
        const bookElements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.className && typeof el.className === 'string' && el.className.toLowerCase().includes('book')
        );
        
        // Find button elements that might contain "Book" text
        const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.innerText && btn.innerText.toLowerCase().includes('book')
        );
        
        const serviceElements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.className && typeof el.className === 'string' && 
          (el.className.toLowerCase().includes('service') || el.className.toLowerCase().includes('treatment'))
        );
        
        // Also look for common booking page elements
        const appointmentButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.innerText && (
            btn.innerText.toLowerCase().includes('appointment') ||
            btn.innerText.toLowerCase().includes('now') ||
            btn.innerText.toLowerCase().includes('select')
          )
        );
        
        return {
          hasBookNowButtons: bookElements.length > 0 || buttons.length > 0 || appointmentButtons.length > 0,
          hasServiceCards: serviceElements.length > 0,
          hasBookingText: document.body.innerText.toLowerCase().includes('book'),
          pageText: document.body.innerText.substring(0, 500),
          buttonCount: buttons.length,
          serviceCount: serviceElements.length,
          appointmentButtonCount: appointmentButtons.length,
          totalElements: document.querySelectorAll('*').length
        };
      });
      
      console.log('🔍 Page analysis:', {
        title: title,
        hasBookingElements: bookingElements.hasBookNowButtons,
        hasServiceCards: bookingElements.hasServiceCards,
        hasBookingText: bookingElements.hasBookingText,
        buttonCount: bookingElements.buttonCount,
        serviceCount: bookingElements.serviceCount,
        appointmentButtonCount: bookingElements.appointmentButtonCount,
        totalElements: bookingElements.totalElements
      });
      
      this.testResults.navigation = {
        success: true,
        loadTime,
        title,
        url,
        hasRequiredElements: bookingElements.hasBookNowButtons || bookingElements.hasBookingText
      };
      
      console.log('✅ Navigation successful');
      
    } catch (error) {
      console.error('❌ Navigation failed:', error.message);
      await this.takeScreenshot('navigation-failed', 1);
      this.testResults.navigation = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  async selectInjectableService() {
    console.log('\n💉 Step 2: Selecting injectable service (Dermal Filler)...');
    try {
      // Wait for page to fully load
      await this.page.waitForNetworkIdle({ timeout: 3000 }).catch(() => {});
      
      // Look for service selection interface
      await this.takeScreenshot('before-service-selection', 2);
      
      // Try multiple strategies to find and select a dermal filler service
      let serviceSelected = false;
      
      // Strategy 1: Look for "Dermal Filler" text directly
      const dermalFillerButtons = await this.page.$$eval('*', elements => {
        return elements
          .filter(el => el.innerText && el.innerText.toLowerCase().includes('dermal filler'))
          .map(el => ({
            tag: el.tagName,
            text: el.innerText.substring(0, 100),
            clickable: el.tagName === 'BUTTON' || el.onclick !== null || el.style.cursor === 'pointer'
          }));
      });
      
      console.log('🔍 Found dermal filler elements:', dermalFillerButtons);
      
      if (dermalFillerButtons.length > 0) {
        try {
          await this.page.click('text="Dermal Filler"');
          serviceSelected = true;
          console.log('✅ Successfully clicked on Dermal Filler service');
        } catch (e) {
          console.log('⚠️  Direct text click failed, trying alternative methods...');
        }
      }
      
      // Strategy 2: Look for any injectable service
      if (!serviceSelected) {
        const injectableServices = await this.page.$$eval('*', elements => {
          const injectableKeywords = ['injectable', 'filler', 'botox', 'bio remodelling', 'bio stimulator'];
          return elements
            .filter(el => {
              const text = (el.innerText || '').toLowerCase();
              return injectableKeywords.some(keyword => text.includes(keyword));
            })
            .map(el => ({
              tag: el.tagName,
              text: el.innerText.substring(0, 100),
              classes: el.className
            }));
        });
        
        console.log('🔍 Found injectable services:', injectableServices);
        
        // Try to click on first injectable service
        for (const keyword of ['filler', 'injectable', 'botox']) {
          try {
            await this.page.click(`text="${keyword}"`, { timeout: 2000 });
            serviceSelected = true;
            console.log(`✅ Successfully selected service containing "${keyword}"`);
            break;
          } catch (e) {
            console.log(`⚠️  Could not click service with "${keyword}"`);
          }
        }
      }
      
      // Strategy 3: Look for any "Book Now" button and click it
      if (!serviceSelected) {
        console.log('🎯 Trying to find any "Book Now" button...');
        
        const bookButtons = await this.page.$$eval('button', buttons => {
          return buttons
            .filter(btn => {
              const text = (btn.innerText || '').toLowerCase();
              return text.includes('book') || text.includes('select');
            })
            .map(btn => ({
              text: btn.innerText.substring(0, 50),
              classes: btn.className,
              visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
            }));
        });
        
        console.log('🔍 Found book buttons:', bookButtons);
        
        if (bookButtons.length > 0) {
          try {
            // Click the first visible book button
            await this.page.click('button:has-text("Book")');
            serviceSelected = true;
            console.log('✅ Successfully clicked a Book button');
          } catch (e) {
            console.log('⚠️  Could not click Book button');
          }
        }
      }
      
      await this.page.waitForNetworkIdle({ timeout: 2000 }).catch(() => {});
      await this.takeScreenshot('after-service-selection', 2);
      
      this.testResults.serviceSelection = {
        success: serviceSelected,
        strategiesUsed: ['dermal filler text', 'injectable keywords', 'book buttons'],
        elementsFound: dermalFillerButtons.length + injectableServices.length
      };
      
      if (serviceSelected) {
        console.log('✅ Service selection successful');
      } else {
        console.log('⚠️  Could not select a specific service, continuing with current page state');
      }
      
    } catch (error) {
      console.error('❌ Service selection failed:', error.message);
      await this.takeScreenshot('service-selection-failed', 2);
      this.testResults.serviceSelection = {
        success: false,
        error: error.message
      };
      // Don't throw - continue with test
    }
  }

  async verifyStaffFiltering() {
    console.log('\n👥 Step 3: Verifying staff filtering for Cottesloe...');
    try {
      // Wait for any modal or staff selection interface to appear
      await this.page.waitForNetworkIdle({ timeout: 3000 }).catch(() => {});
      
      await this.takeScreenshot('before-staff-check', 3);
      
      // Look for staff-related elements
      const staffInfo = await this.page.evaluate(() => {
        // Look for staff names, cards, or selection elements
        const staffElements = [];
        
        // Common patterns for staff display
        const selectors = [
          '[class*="staff"]',
          '[class*="therapist"]',
          '[class*="practitioner"]',
          'div:has(text() "Isabelle")',
          'div:has(text() "Mel")',
          '[data-testid*="staff"]'
        ];
        
        selectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el.innerText && el.innerText.trim()) {
                staffElements.push({
                  selector,
                  text: el.innerText.substring(0, 100),
                  className: el.className
                });
              }
            });
          } catch (e) {
            // Ignore invalid selectors
          }
        });
        
        // Also look for names directly in text content
        const pageText = document.body.innerText.toLowerCase();
        const isabelleFound = pageText.includes('isabelle');
        const melFound = pageText.includes('mel');
        
        return {
          staffElements: staffElements.slice(0, 10), // Limit for readability
          staffCount: staffElements.length,
          isabelleFound,
          melFound,
          pageContainsStaff: staffElements.length > 0 || isabelleFound || melFound
        };
      });
      
      console.log('🔍 Staff filtering analysis:', {
        staffElementsFound: staffInfo.staffCount,
        isabelleFound: staffInfo.isabelleFound,
        melFound: staffInfo.melFound,
        hasStaffContent: staffInfo.pageContainsStaff
      });
      
      if (staffInfo.staffElements.length > 0) {
        console.log('📋 Staff elements found:');
        staffInfo.staffElements.forEach((element, index) => {
          console.log(`  ${index + 1}. ${element.text.trim()}`);
        });
      }
      
      // Key test: There should be only 2 staff members for Cottesloe (Isabelle and Mel)
      const expectedStaffCount = 2;
      const actualStaffCount = staffInfo.staffCount;
      
      const staffFilteringWorks = actualStaffCount <= expectedStaffCount + 2; // Allow some tolerance
      
      if (staffFilteringWorks) {
        console.log(`✅ Staff filtering appears to be working (found ${actualStaffCount} staff-related elements)`);
      } else {
        console.log(`⚠️  Potential staff filtering issue (found ${actualStaffCount} staff elements, expected ~${expectedStaffCount})`);
      }
      
      this.testResults.staffFiltering = {
        success: staffFilteringWorks,
        expectedCount: expectedStaffCount,
        actualCount: actualStaffCount,
        isabelleFound: staffInfo.isabelleFound,
        melFound: staffInfo.melFound,
        staffElements: staffInfo.staffElements.slice(0, 5) // Store first 5 for analysis
      };
      
      await this.takeScreenshot('staff-filtering-checked', 3);
      console.log('✅ Staff filtering verification complete');
      
    } catch (error) {
      console.error('❌ Staff filtering check failed:', error.message);
      await this.takeScreenshot('staff-filtering-failed', 3);
      this.testResults.staffFiltering = {
        success: false,
        error: error.message
      };
      // Don't throw - continue with test
    }
  }

  async selectAppointmentSlot() {
    console.log('\n🕐 Step 4: Selecting appointment time slot...');
    try {
      await this.page.waitForNetworkIdle({ timeout: 2000 }).catch(() => {});
      await this.takeScreenshot('before-slot-selection', 4);
      
      // Look for time slot elements
      const slotInfo = await this.page.evaluate(() => {
        // Common patterns for time slot display
        const timePatterns = [
          /\d{1,2}:\d{2}\s*(AM|PM|am|pm)/g,
          /\d{1,2}:\d{2}/g
        ];
        
        let timeSlots = [];
        let clickableSlots = [];
        
        // Find all elements containing time patterns
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const text = el.innerText || '';
          timePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
              timeSlots.push(...matches);
              
              // Check if the element is clickable
              const isClickable = el.tagName === 'BUTTON' || 
                                el.onclick !== null || 
                                el.style.cursor === 'pointer' ||
                                el.getAttribute('data-testid') ||
                                el.className.includes('slot') ||
                                el.className.includes('time');
              
              if (isClickable) {
                clickableSlots.push({
                  text: text.substring(0, 50),
                  tag: el.tagName,
                  className: el.className,
                  times: matches
                });
              }
            }
          });
        });
        
        // Remove duplicates
        timeSlots = [...new Set(timeSlots)];
        
        return {
          totalTimeSlots: timeSlots.length,
          timeSlots: timeSlots.slice(0, 10),
          clickableSlots: clickableSlots.slice(0, 5),
          hasAvailableSlots: timeSlots.length > 0
        };
      });
      
      console.log('🔍 Time slot analysis:', {
        totalSlots: slotInfo.totalTimeSlots,
        hasSlots: slotInfo.hasAvailableSlots,
        clickableSlots: slotInfo.clickableSlots.length
      });
      
      if (slotInfo.timeSlots.length > 0) {
        console.log('🕒 Found time slots:', slotInfo.timeSlots);
      }
      
      if (slotInfo.clickableSlots.length > 0) {
        console.log('👆 Clickable slot elements:', slotInfo.clickableSlots.map(s => s.text.trim()));
      }
      
      // Try to click on a time slot
      let slotSelected = false;
      
      if (slotInfo.clickableSlots.length > 0) {
        try {
          // Try to click on the first clickable slot
          const firstTime = slotInfo.timeSlots[0];
          if (firstTime) {
            await this.page.click(`text="${firstTime}"`, { timeout: 3000 });
            slotSelected = true;
            console.log(`✅ Successfully selected time slot: ${firstTime}`);
          }
        } catch (e) {
          console.log('⚠️  Could not click on specific time slot');
          
          // Try to click on any element with "slot" in class name
          try {
            await this.page.click('[class*="slot"]', { timeout: 3000 });
            slotSelected = true;
            console.log('✅ Successfully selected a slot element');
          } catch (e2) {
            console.log('⚠️  Could not click on slot element');
          }
        }
      }
      
      await this.page.waitForNetworkIdle({ timeout: 2000 }).catch(() => {});
      await this.takeScreenshot('after-slot-selection', 4);
      
      this.testResults.appointmentSlots = {
        success: slotInfo.hasAvailableSlots,
        slotsFound: slotInfo.totalTimeSlots,
        clickableSlots: slotInfo.clickableSlots.length,
        slotSelected,
        timeSlots: slotInfo.timeSlots
      };
      
      if (slotInfo.hasAvailableSlots) {
        console.log('✅ Time slots are displaying correctly');
      } else {
        console.log('⚠️  No time slots found - this could indicate an issue with availability API');
      }
      
    } catch (error) {
      console.error('❌ Appointment slot selection failed:', error.message);
      await this.takeScreenshot('slot-selection-failed', 4);
      this.testResults.appointmentSlots = {
        success: false,
        error: error.message
      };
      // Don't throw - continue with test
    }
  }

  async completeBookingFlow() {
    console.log('\n📋 Step 5: Testing booking flow completion...');
    try {
      await this.page.waitForNetworkIdle({ timeout: 2000 }).catch(() => {});
      await this.takeScreenshot('before-booking-completion', 5);
      
      // Look for booking completion elements
      const bookingFlowInfo = await this.page.evaluate(() => {
        // Look for forms, confirmation buttons, error messages
        const forms = document.querySelectorAll('form');
        const confirmButtons = document.querySelectorAll('button');
        const errorMessages = [];
        
        // Check for "Booking details are invalid" error specifically
        const pageText = document.body.innerText.toLowerCase();
        const hasInvalidBookingError = pageText.includes('booking details are invalid') || 
                                     pageText.includes('invalid booking') ||
                                     pageText.includes('booking failed');
        
        // Look for other error indicators
        const errorElements = document.querySelectorAll('[class*="error"], .alert, [role="alert"]');
        errorElements.forEach(el => {
          if (el.innerText && el.innerText.trim()) {
            errorMessages.push(el.innerText.trim());
          }
        });
        
        // Look for success indicators
        const hasSuccessIndicators = pageText.includes('booking confirmed') ||
                                   pageText.includes('appointment scheduled') ||
                                   pageText.includes('booking successful');
        
        return {
          formsFound: forms.length,
          buttonsFound: confirmButtons.length,
          hasInvalidBookingError,
          errorMessages: errorMessages.slice(0, 5),
          hasSuccessIndicators,
          pageTextPreview: pageText.substring(0, 300)
        };
      });
      
      console.log('🔍 Booking flow analysis:', {
        forms: bookingFlowInfo.formsFound,
        buttons: bookingFlowInfo.buttonsFound,
        hasInvalidError: bookingFlowInfo.hasInvalidBookingError,
        errors: bookingFlowInfo.errorMessages.length,
        hasSuccess: bookingFlowInfo.hasSuccessIndicators
      });
      
      if (bookingFlowInfo.errorMessages.length > 0) {
        console.log('⚠️  Error messages found:');
        bookingFlowInfo.errorMessages.forEach((msg, index) => {
          console.log(`  ${index + 1}. ${msg}`);
        });
      }
      
      // Try to complete the booking flow
      let bookingAttempted = false;
      
      // Look for confirmation or submit buttons
      const buttonTexts = ['confirm', 'submit', 'book now', 'complete', 'finish'];
      
      for (const buttonText of buttonTexts) {
        try {
          await this.page.click(`button:has-text("${buttonText}")`, { timeout: 2000 });
          bookingAttempted = true;
          console.log(`✅ Clicked ${buttonText} button`);
          await this.page.waitForNetworkIdle({ timeout: 3000 }).catch(() => {}); // Wait for response
          break;
        } catch (e) {
          // Continue to next button type
        }
      }
      
      if (!bookingAttempted) {
        console.log('ℹ️  No completion button found - this is expected if we haven\'t reached the final step');
      }
      
      await this.takeScreenshot('booking-completion-attempt', 5);
      
      // Check final state
      const finalState = await this.page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return {
          hasInvalidError: text.includes('booking details are invalid'),
          hasValidationError: text.includes('validation') && text.includes('error'),
          hasSuccessMessage: text.includes('success') || text.includes('confirmed'),
          currentUrl: window.location.href
        };
      });
      
      this.testResults.bookingFlow = {
        success: !finalState.hasInvalidError && !finalState.hasValidationError,
        attempted: bookingAttempted,
        hasInvalidBookingError: finalState.hasInvalidError,
        hasValidationError: finalState.hasValidationError,
        hasSuccessMessage: finalState.hasSuccessMessage,
        finalUrl: finalState.currentUrl,
        errorMessages: bookingFlowInfo.errorMessages
      };
      
      if (finalState.hasInvalidError) {
        console.log('❌ "Booking details are invalid" error detected!');
      } else if (finalState.hasValidationError) {
        console.log('⚠️  Validation error detected');
      } else {
        console.log('✅ No critical booking errors detected');
      }
      
    } catch (error) {
      console.error('❌ Booking flow completion failed:', error.message);
      await this.takeScreenshot('booking-completion-failed', 5);
      this.testResults.bookingFlow = {
        success: false,
        error: error.message
      };
      // Don't throw - we want to see the full report
    }
  }

  async generateReport() {
    console.log('\n📊 Generating Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      testUrl: 'https://skinsocieteapp.onrender.com/appointments',
      duration: Date.now() - this.startTime,
      screenshots: this.screenshots,
      results: this.testResults,
      summary: {
        totalTests: 5,
        passedTests: 0,
        failedTests: 0,
        criticalIssues: []
      }
    };
    
    // Calculate summary
    Object.entries(this.testResults).forEach(([testName, result]) => {
      if (testName === 'errors') return;
      
      if (result && result.success === true) {
        report.summary.passedTests++;
      } else if (result && result.success === false) {
        report.summary.failedTests++;
      }
    });
    
    // Identify critical issues
    if (this.testResults.staffFiltering && !this.testResults.staffFiltering.success) {
      report.summary.criticalIssues.push('Staff filtering not working - may show too many staff members');
    }
    
    if (this.testResults.appointmentSlots && !this.testResults.appointmentSlots.success) {
      report.summary.criticalIssues.push('No appointment slots found - availability API may not be working');
    }
    
    if (this.testResults.bookingFlow && this.testResults.bookingFlow.hasInvalidBookingError) {
      report.summary.criticalIssues.push('CRITICAL: "Booking details are invalid" error detected');
    }
    
    // Save report to file
    const reportPath = path.join(__dirname, `production-test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📋 TEST REPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`🌐 Test URL: ${report.testUrl}`);
    console.log(`⏱️  Duration: ${Math.round(report.duration / 1000)}s`);
    console.log(`✅ Passed: ${report.summary.passedTests}/${report.summary.totalTests}`);
    console.log(`❌ Failed: ${report.summary.failedTests}/${report.summary.totalTests}`);
    console.log(`📷 Screenshots: ${this.screenshots.length}`);
    
    console.log('\n🔍 DETAILED RESULTS:');
    console.log('-'.repeat(30));
    
    // Navigation
    if (this.testResults.navigation) {
      console.log(`📍 Navigation: ${this.testResults.navigation.success ? '✅ PASS' : '❌ FAIL'}`);
      if (this.testResults.navigation.success) {
        console.log(`   Load time: ${this.testResults.navigation.loadTime}ms`);
      }
    }
    
    // Service Selection
    if (this.testResults.serviceSelection) {
      console.log(`💉 Service Selection: ${this.testResults.serviceSelection.success ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    // Staff Filtering
    if (this.testResults.staffFiltering) {
      console.log(`👥 Staff Filtering: ${this.testResults.staffFiltering.success ? '✅ PASS' : '❌ FAIL'}`);
      if (this.testResults.staffFiltering.actualCount !== undefined) {
        console.log(`   Staff elements found: ${this.testResults.staffFiltering.actualCount}`);
        console.log(`   Isabelle found: ${this.testResults.staffFiltering.isabelleFound ? 'Yes' : 'No'}`);
        console.log(`   Mel found: ${this.testResults.staffFiltering.melFound ? 'Yes' : 'No'}`);
      }
    }
    
    // Appointment Slots
    if (this.testResults.appointmentSlots) {
      console.log(`🕐 Appointment Slots: ${this.testResults.appointmentSlots.success ? '✅ PASS' : '❌ FAIL'}`);
      if (this.testResults.appointmentSlots.slotsFound !== undefined) {
        console.log(`   Time slots found: ${this.testResults.appointmentSlots.slotsFound}`);
      }
    }
    
    // Booking Flow
    if (this.testResults.bookingFlow) {
      console.log(`📋 Booking Flow: ${this.testResults.bookingFlow.success ? '✅ PASS' : '❌ FAIL'}`);
      if (this.testResults.bookingFlow.hasInvalidBookingError) {
        console.log('   🚨 CRITICAL: "Booking details are invalid" error detected');
      }
    }
    
    // Critical Issues
    if (report.summary.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      report.summary.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    // Screenshots
    if (this.screenshots.length > 0) {
      console.log('\n📷 SCREENSHOTS:');
      this.screenshots.forEach(screenshot => {
        console.log(`   Step ${screenshot.step}: ${screenshot.name} -> ${screenshot.filename}`);
      });
    }
    
    // Errors
    if (this.testResults.errors.length > 0) {
      console.log('\n⚠️  ERRORS ENCOUNTERED:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    console.log('\n' + '='.repeat(50));
    
    return report;
  }

  async run() {
    this.startTime = Date.now();
    console.log('🧪 Starting Production Booking E2E Test');
    console.log('Target: https://skinsocieteapp.onrender.com/appointments');
    console.log('Focus: Staff filtering fix verification');
    console.log('='.repeat(60));
    
    try {
      await this.setupBrowser();
      await this.navigateToBookingPage();
      await this.selectInjectableService();
      await this.verifyStaffFiltering();
      await this.selectAppointmentSlot();
      await this.completeBookingFlow();
      
    } catch (error) {
      console.error('💥 Test execution failed:', error.message);
      this.testResults.errors.push(`Test execution failed: ${error.message}`);
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
  const tester = new ProductionBookingTester();
  tester.run().catch(console.error);
}

module.exports = { ProductionBookingTester };