const puppeteer = require('puppeteer');

async function testCompleteBookingWorkflow() {
  console.log('🤖 PUPPETEER + CONTEXT7 COMPREHENSIVE BOOKING TEST');
  console.log('================================================\n');
  
  let browser;
  let testResults = {
    phorestAPI: false,
    availabilityEndpoint: false,
    clinicContext: false,
    completeBooking: false,
    appointmentCreated: false
  };

  try {
    // Launch Puppeteer with full visibility
    console.log('🚀 Launching Puppeteer browser...');
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1400, height: 1000 },
      args: ['--start-maximized'],
      devtools: true
    });
    
    const page = await browser.newPage();
    
    // Enable request interception to monitor API calls
    await page.setRequestInterception(true);
    const apiCalls = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/appointments')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
          timestamp: new Date().toISOString()
        });
        console.log(`📡 API Call: ${request.method()} ${request.url()}`);
      }
      request.continue();
    });

    page.on('response', response => {
      if (response.url().includes('/api/appointments')) {
        console.log(`📥 API Response: ${response.status()} ${response.url()}`);
      }
    });

    // Navigate to appointments page
    console.log('🌐 Navigating to https://skinsocieteapp.onrender.com/appointments');
    await page.goto('https://skinsocieteapp.onrender.com/appointments', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    console.log('\n=== STEP 1: VERIFY ENHANCED BOOKING INTERFACE ===');
    
    // Check for enhanced booking components
    const modeButtons = await page.$$('button:contains("By Concern"), button:contains("Gallery View")');
    console.log(`✅ Enhanced UI Mode Buttons: ${modeButtons.length > 0 ? 'FOUND' : 'MISSING'}`);
    
    // Look for booking buttons
    const bookButtons = await page.$$('button[class*="book"], button:contains("Book Now"), button:contains("Book")');
    console.log(`✅ Booking Buttons Available: ${bookButtons.length}`);
    
    if (bookButtons.length === 0) {
      console.log('❌ No booking buttons found. Checking page content...');
      const pageContent = await page.content();
      console.log('Page title:', await page.title());
      
      // Try alternative selectors
      const altButtons = await page.$$('button, .btn, [role="button"]');
      console.log(`🔍 Alternative buttons found: ${altButtons.length}`);
      
      for (let i = 0; i < Math.min(5, altButtons.length); i++) {
        try {
          const buttonText = await altButtons[i].evaluate(el => el.textContent);
          console.log(`   Button ${i + 1}: "${buttonText}"`);
        } catch (e) {}
      }
      
      throw new Error('No booking buttons available');
    }
    
    console.log('\n=== STEP 2: INITIATE BOOKING PROCESS ===');
    
    // Click the first available booking button
    console.log('🔘 Clicking first booking button...');
    await bookButtons[0].click();
    await page.waitForTimeout(2000);
    
    // Check for booking modal or interface
    const modals = await page.$$('[role="dialog"], .modal, .fixed, .booking-modal');
    console.log(`✅ Booking Interface Opened: ${modals.length > 0 ? 'YES' : 'NO'}`);
    
    console.log('\n=== STEP 3: TEST CLINIC CONTEXT ===');
    
    // Look for clinic information
    const clinicInfo = await page.$$('*:contains("Skin Societé"), *:contains("Cottesloe"), *:contains("clinic")');
    console.log(`✅ Clinic Context Visible: ${clinicInfo.length > 0 ? 'YES' : 'NO'}`);
    testResults.clinicContext = clinicInfo.length > 0;
    
    // Check for branch/location selection
    const locationElements = await page.$$('*:contains("branch"), *:contains("location"), *:contains("clinic")');
    if (locationElements.length > 0) {
      console.log('🏥 Clinic/branch context detected');
    }
    
    console.log('\n=== STEP 4: TEST DATE SELECTION ===');
    
    // Look for date picker
    const dateElements = await page.$$('input[type="date"], .calendar, *:contains("Select Date")');
    console.log(`✅ Date Selection Available: ${dateElements.length > 0 ? 'YES' : 'NO'}`);
    
    // Try to select a future date
    const futureDateButtons = await page.$$('button:contains("Mon"), button:contains("Tue"), button:contains("Wed"), button:contains("Thu"), button:contains("Fri")');
    if (futureDateButtons.length > 0) {
      console.log('📅 Clicking future date...');
      await futureDateButtons[0].click();
      await page.waitForTimeout(3000);
      
      // Monitor API calls after date selection
      const availabilityCalls = apiCalls.filter(call => call.url.includes('availability'));
      console.log(`📡 Availability API Calls Made: ${availabilityCalls.length}`);
      testResults.availabilityEndpoint = availabilityCalls.length > 0;
      
      availabilityCalls.forEach(call => {
        console.log(`   - ${call.method} ${call.url}`);
        if (call.postData) {
          console.log(`   - Payload: ${call.postData}`);
        }
      });
    }
    
    console.log('\n=== STEP 5: CHECK APPOINTMENT TIME AVAILABILITY ===');
    
    // Wait for availability to load
    await page.waitForTimeout(5000);
    
    // Look for available time slots
    const timeSlots = await page.$$('button:contains(":"), .time-slot, *:contains("AM"), *:contains("PM")');
    console.log(`⏰ Available Time Slots Found: ${timeSlots.length}`);
    
    if (timeSlots.length === 0) {
      // Check for "no availability" messages
      const noSlots = await page.$$('*:contains("No available"), *:contains("no slots"), *:contains("not available")');
      if (noSlots.length > 0) {
        console.log('❌ "No available slots" message detected - Phorest API issue confirmed');
        
        // Try to get error details
        try {
          const errorText = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            for (let el of elements) {
              if (el.textContent && el.textContent.includes('No available')) {
                return el.textContent;
              }
            }
            return null;
          });
          console.log(`Error message: "${errorText}"`);
        } catch (e) {}
      } else {
        console.log('⏳ Time slots may still be loading...');
      }
    } else {
      console.log('✅ Time slots are available - Phorest integration working!');
      testResults.phorestAPI = true;
      
      // Try to select a time slot
      console.log('🕐 Selecting first available time slot...');
      await timeSlots[0].click();
      await page.waitForTimeout(2000);
    }
    
    console.log('\n=== STEP 6: ATTEMPT COMPLETE BOOKING ===');
    
    // Look for continue/next/confirm buttons
    const continueButtons = await page.$$('button:contains("Continue"), button:contains("Next"), button:contains("Confirm"), button:contains("Book")');
    
    if (continueButtons.length > 0 && timeSlots.length > 0) {
      console.log('➡️  Attempting to continue booking process...');
      await continueButtons[0].click();
      await page.waitForTimeout(3000);
      
      // Check for booking confirmation or success
      const confirmElements = await page.$$('*:contains("confirmed"), *:contains("booked"), *:contains("success")');
      if (confirmElements.length > 0) {
        console.log('🎉 Booking appears to be confirmed!');
        testResults.completeBooking = true;
        
        // Check for booking reference or appointment details
        const bookingRef = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          for (let el of elements) {
            if (el.textContent && (el.textContent.includes('reference') || el.textContent.includes('appointment'))) {
              return el.textContent;
            }
          }
          return null;
        });
        
        if (bookingRef) {
          console.log(`📋 Booking Details: ${bookingRef}`);
          testResults.appointmentCreated = true;
        }
      }
    }
    
    console.log('\n=== COMPREHENSIVE TEST RESULTS ===');
    console.log('📊 Test Summary:');
    console.log(`   ✅ Enhanced UI Components: ${modeButtons.length > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Clinic Context: ${testResults.clinicContext ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Availability API: ${testResults.availabilityEndpoint ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Phorest Integration: ${testResults.phorestAPI ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Complete Booking: ${testResults.completeBooking ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Appointment Created: ${testResults.appointmentCreated ? 'PASS' : 'FAIL'}`);
    
    console.log(`\n📡 Total API Calls Made: ${apiCalls.length}`);
    apiCalls.forEach((call, index) => {
      console.log(`   ${index + 1}. ${call.method} ${call.url} at ${call.timestamp}`);
    });
    
    // Save detailed results
    const detailedResults = {
      timestamp: new Date().toISOString(),
      testResults,
      apiCalls,
      availableTimeSlots: timeSlots.length,
      bookingButtonsFound: bookButtons.length
    };
    
    const fs = require('fs');
    fs.writeFileSync('booking-test-results.json', JSON.stringify(detailedResults, null, 2));
    console.log('\n📁 Detailed results saved to: booking-test-results.json');
    
    if (testResults.phorestAPI && testResults.appointmentCreated) {
      console.log('\n🎯 SUCCESS: Please check your Phorest system for the test appointment!');
      console.log('   ⚠️  IMPORTANT: Verify in Phorest dashboard that a real appointment was created');
    } else {
      console.log('\n⚠️  ISSUES DETECTED: Booking workflow needs attention');
      if (!testResults.phorestAPI) {
        console.log('   🔧 Fix needed: Phorest API availability integration');
      }
      if (!testResults.appointmentCreated) {
        console.log('   🔧 Fix needed: Complete booking to Phorest system');
      }
    }
    
    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser kept open for manual inspection. Press Ctrl+C when done.');
    await new Promise(resolve => {
      process.on('SIGINT', () => {
        console.log('\n👋 Test completed. Browser closing...');
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the comprehensive test
console.log('Starting comprehensive Puppeteer + Context7 booking workflow test...\n');
testCompleteBookingWorkflow().catch(console.error);