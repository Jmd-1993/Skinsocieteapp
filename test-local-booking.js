const puppeteer = require('puppeteer');

async function testLocalBooking() {
  console.log('🧪 Testing Local Development Booking System');
  console.log('===============================================\n');
  
  let browser;
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1400, height: 900 },
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Monitor API calls
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/appointments')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
        console.log(`📡 API: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/appointments')) {
        console.log(`📥 Response: ${response.status()} ${response.url()}`);
      }
    });

    console.log('🌐 Testing local development server...');
    await page.goto('http://localhost:3000/appointments', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    await page.waitForTimeout(3000);
    
    // Check for enhanced UI components
    console.log('\n=== Enhanced UI Check ===');
    const modeButtons = await page.$$('button');
    console.log(`Buttons found: ${modeButtons.length}`);
    
    for (let i = 0; i < Math.min(10, modeButtons.length); i++) {
      try {
        const text = await modeButtons[i].evaluate(el => el.textContent);
        console.log(`Button ${i + 1}: "${text}"`);
        if (text.includes('Book') || text.includes('Concern') || text.includes('Gallery')) {
          console.log('✅ Enhanced UI detected!');
        }
      } catch (e) {}
    }
    
    // Look for booking buttons
    const bookButtons = await page.$$('button:contains("Book"), button[class*="book"]');
    if (bookButtons.length > 0) {
      console.log(`\n🔘 Testing booking flow... (${bookButtons.length} booking buttons found)`);
      await bookButtons[0].click();
      await page.waitForTimeout(3000);
      
      // Check for modal
      const modals = await page.$$('.modal, .fixed, [role="dialog"]');
      console.log(`Modal opened: ${modals.length > 0 ? 'YES' : 'NO'}`);
      
      // Look for date selection
      const dateButtons = await page.$$('button:contains("Mon"), button:contains("Tue"), button:contains("Wed")');
      if (dateButtons.length > 0) {
        console.log('📅 Selecting date...');
        await dateButtons[0].click();
        await page.waitForTimeout(5000);
        
        // Check for time slots
        const timeSlots = await page.$$('button:contains(":"), .time-slot');
        console.log(`⏰ Time slots found: ${timeSlots.length}`);
        
        if (timeSlots.length === 0) {
          console.log('❌ No time slots - checking for error messages...');
          const errorMessages = await page.$$('*:contains("No available"), *:contains("no slots")');
          console.log(`Error messages found: ${errorMessages.length}`);
        }
      }
    }
    
    console.log(`\n📊 Total API calls: ${apiCalls.length}`);
    console.log('\n✅ Local test completed. Check browser for visual verification.');
    
    // Keep browser open
    await new Promise(resolve => {
      setTimeout(() => {
        console.log('⏸️ Test complete. Browser will close in 30 seconds...');
        setTimeout(resolve, 30000);
      }, 5000);
    });
    
  } catch (error) {
    console.error('❌ Local test failed:', error.message);
    console.log('\n💡 Make sure local dev server is running: npm run dev');
  } finally {
    if (browser) await browser.close();
  }
}

testLocalBooking();