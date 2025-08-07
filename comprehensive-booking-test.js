const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class BookingWorkflowTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.networkLogs = [];
        this.errorLogs = [];
        this.screenshots = [];
        this.testResults = {
            timestamp: new Date().toISOString(),
            phases: {},
            errors: [],
            networkAnalysis: {},
            conclusions: []
        };
    }

    async init() {
        console.log('🔧 Initializing Puppeteer...');
        this.browser = await puppeteer.launch({
            headless: false,
            devtools: true,
            slowMo: 100,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1280, height: 720 });
        
        // Enable console logging
        this.page.on('console', msg => {
            console.log('🖥️  Console:', msg.text());
            this.errorLogs.push({
                type: 'console',
                level: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString()
            });
        });

        // Enable error logging
        this.page.on('pageerror', error => {
            console.log('❌ Page Error:', error.message);
            this.errorLogs.push({
                type: 'pageerror',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Enable request/response logging
        this.page.on('request', request => {
            console.log('📡 Request:', request.method(), request.url());
            this.networkLogs.push({
                type: 'request',
                method: request.method(),
                url: request.url(),
                headers: request.headers(),
                postData: request.postData(),
                timestamp: new Date().toISOString()
            });
        });

        this.page.on('response', async response => {
            console.log('📨 Response:', response.status(), response.url());
            let responseData = null;
            try {
                if (response.url().includes('/api/')) {
                    responseData = await response.text();
                }
            } catch (e) {
                console.log('Could not read response data:', e.message);
            }
            
            this.networkLogs.push({
                type: 'response',
                status: response.status(),
                statusText: response.statusText(),
                url: response.url(),
                headers: response.headers(),
                data: responseData,
                timestamp: new Date().toISOString()
            });
        });
    }

    async takeScreenshot(name, description) {
        const filename = `screenshot-${name}-${Date.now()}.png`;
        const filepath = path.join(__dirname, filename);
        await this.page.screenshot({ path: filepath, fullPage: true });
        
        this.screenshots.push({
            name,
            description,
            filename,
            timestamp: new Date().toISOString()
        });
        
        console.log(`📸 Screenshot saved: ${filename}`);
        return filename;
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async phase1_NavigateToBooking() {
        console.log('\n🔄 PHASE 1: Navigate to Booking Page');
        const phaseResults = { success: false, errors: [], details: {} };
        
        try {
            const startTime = Date.now();
            await this.page.goto('https://skinsocieteapp.onrender.com/appointments', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            
            await this.takeScreenshot('1-initial-load', 'Booking page loaded');
            
            // Check if page loaded properly
            const title = await this.page.title();
            const url = this.page.url();
            
            phaseResults.details.title = title;
            phaseResults.details.url = url;
            phaseResults.details.loadTime = Date.now() - startTime;
            
            console.log(`✅ Page loaded: ${title} at ${url}`);
            phaseResults.success = true;
            
        } catch (error) {
            console.log(`❌ Navigation failed: ${error.message}`);
            phaseResults.errors.push(error.message);
            await this.takeScreenshot('1-navigation-failed', 'Navigation error');
        }
        
        this.testResults.phases.navigation = phaseResults;
        return phaseResults.success;
    }

    async phase2_SelectService() {
        console.log('\n🔄 PHASE 2: Select Bio Remodelling Service');
        const phaseResults = { success: false, errors: [], details: {} };
        
        try {
            // Wait for services to load
            await this.wait(3000);
            
            // Look for Bio Remodelling service
            const serviceSelectors = [
                'button:has-text("Bio Remodelling")',
                '[data-service="bio-remodelling"]',
                'button[data-testid*="bio"]',
                '.service-card:has-text("Bio Remodelling")',
                'div:has-text("Bio Remodelling")',
                '.service-option:contains("Bio")',
                'button:contains("Bio Remodelling")'
            ];
            
            let serviceSelected = false;
            let servicesFound = [];
            
            // Check what services are available
            const allButtons = await this.page.$$('button');
            console.log(`Found ${allButtons.length} buttons on page`);
            
            for (const button of allButtons) {
                const text = await this.page.evaluate(el => el.textContent, button);
                if (text && text.trim()) {
                    servicesFound.push(text.trim());
                }
            }
            
            phaseResults.details.availableServices = servicesFound;
            console.log('Available services:', servicesFound);
            
            // Try to find and click Bio Remodelling or any service
            for (const selector of serviceSelectors) {
                try {
                    const element = await this.page.$(selector);
                    if (element) {
                        await element.click();
                        console.log(`✅ Clicked service with selector: ${selector}`);
                        serviceSelected = true;
                        break;
                    }
                } catch (e) {
                    // Try next selector
                }
            }
            
            // If specific service not found, try clicking first available service
            if (!serviceSelected && allButtons.length > 0) {
                try {
                    const firstServiceButton = allButtons.find(async button => {
                        const text = await this.page.evaluate(el => el.textContent, button);
                        return text && (text.includes('Bio') || text.includes('Facial') || text.includes('Treatment'));
                    });
                    
                    if (firstServiceButton) {
                        await firstServiceButton.click();
                        console.log('✅ Clicked first available service');
                        serviceSelected = true;
                    }
                } catch (e) {
                    console.log('Failed to click first service:', e.message);
                }
            }
            
            if (serviceSelected) {
                await this.wait(2000);
                await this.takeScreenshot('2-service-selected', 'Service selected');
                phaseResults.success = true;
            } else {
                phaseResults.errors.push('No service could be selected');
                await this.takeScreenshot('2-service-selection-failed', 'Service selection failed');
            }
            
        } catch (error) {
            console.log(`❌ Service selection failed: ${error.message}`);
            phaseResults.errors.push(error.message);
            await this.takeScreenshot('2-service-selection-error', 'Service selection error');
        }
        
        this.testResults.phases.serviceSelection = phaseResults;
        return phaseResults.success;
    }

    async phase3_VerifyStaff() {
        console.log('\n🔄 PHASE 3: Verify Staff Options for Cottesloe');
        const phaseResults = { success: false, errors: [], details: {} };
        
        try {
            await this.wait(3000);
            
            // Look for staff selection interface
            const staffElements = await this.page.$$eval('*', elements => {
                return elements
                    .filter(el => el.textContent && (
                        el.textContent.includes('Isabelle') || 
                        el.textContent.includes('Mel') ||
                        el.textContent.includes('staff') ||
                        el.textContent.includes('therapist')
                    ))
                    .map(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        textContent: el.textContent.trim(),
                        id: el.id
                    }));
            });
            
            phaseResults.details.staffElements = staffElements;
            console.log('Staff elements found:', staffElements);
            
            // Check specifically for Isabelle and Mel
            const isabelle = staffElements.find(el => el.textContent.includes('Isabelle'));
            const mel = staffElements.find(el => el.textContent.includes('Mel'));
            
            phaseResults.details.isabelleFound = !!isabelle;
            phaseResults.details.melFound = !!mel;
            
            if (isabelle || mel) {
                console.log('✅ Staff members found for Cottesloe');
                phaseResults.success = true;
            } else {
                console.log('❌ Expected staff (Isabelle/Mel) not found');
                phaseResults.errors.push('Expected staff not found');
            }
            
            await this.takeScreenshot('3-staff-verification', 'Staff verification');
            
        } catch (error) {
            console.log(`❌ Staff verification failed: ${error.message}`);
            phaseResults.errors.push(error.message);
            await this.takeScreenshot('3-staff-verification-error', 'Staff verification error');
        }
        
        this.testResults.phases.staffVerification = phaseResults;
        return phaseResults.success;
    }

    async phase4_SelectTimeSlot() {
        console.log('\n🔄 PHASE 4: Select Time Slot');
        const phaseResults = { success: false, errors: [], details: {} };
        
        try {
            await this.wait(3000);
            
            // Look for time slots
            const timeSlots = await this.page.$$eval('*', elements => {
                return elements
                    .filter(el => {
                        const text = el.textContent;
                        return text && (
                            /\d{1,2}:\d{2}/.test(text) ||
                            text.includes('AM') ||
                            text.includes('PM') ||
                            el.className.includes('time') ||
                            el.className.includes('slot')
                        );
                    })
                    .map(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        textContent: el.textContent.trim(),
                        disabled: el.disabled,
                        clickable: el.tagName === 'BUTTON' || el.onclick
                    }));
            });
            
            phaseResults.details.timeSlots = timeSlots;
            console.log(`Found ${timeSlots.length} time-related elements:`, timeSlots);
            
            // Try to click an available time slot
            const availableSlots = timeSlots.filter(slot => !slot.disabled && slot.clickable);
            
            if (availableSlots.length > 0) {
                try {
                    // Click the first available slot
                    const firstSlot = availableSlots[0];
                    const element = await this.page.$(`${firstSlot.tagName.toLowerCase()}:has-text("${firstSlot.textContent}")`);
                    
                    if (element) {
                        await element.click();
                        console.log(`✅ Clicked time slot: ${firstSlot.textContent}`);
                        phaseResults.success = true;
                        phaseResults.details.selectedSlot = firstSlot.textContent;
                    }
                } catch (e) {
                    console.log('Failed to click time slot:', e.message);
                    phaseResults.errors.push(`Failed to click time slot: ${e.message}`);
                }
            } else {
                console.log('❌ No available time slots found');
                phaseResults.errors.push('No available time slots found');
            }
            
            await this.wait(2000);
            await this.takeScreenshot('4-time-slot-selection', 'Time slot selection');
            
        } catch (error) {
            console.log(`❌ Time slot selection failed: ${error.message}`);
            phaseResults.errors.push(error.message);
            await this.takeScreenshot('4-time-slot-error', 'Time slot selection error');
        }
        
        this.testResults.phases.timeSlotSelection = phaseResults;
        return phaseResults.success;
    }

    async phase5_CompleteBooking() {
        console.log('\n🔄 PHASE 5: Complete Booking');
        const phaseResults = { success: false, errors: [], details: {} };
        
        try {
            await this.wait(3000);
            
            // Look for booking/submit buttons
            const bookingButtons = await this.page.$$eval('button', buttons => {
                return buttons
                    .map(btn => ({
                        textContent: btn.textContent.trim(),
                        disabled: btn.disabled,
                        className: btn.className,
                        id: btn.id
                    }))
                    .filter(btn => 
                        btn.textContent.toLowerCase().includes('book') ||
                        btn.textContent.toLowerCase().includes('confirm') ||
                        btn.textContent.toLowerCase().includes('submit') ||
                        btn.textContent.toLowerCase().includes('complete')
                    );
            });
            
            phaseResults.details.bookingButtons = bookingButtons;
            console.log('Booking buttons found:', bookingButtons);
            
            // Try to complete the booking
            if (bookingButtons.length > 0) {
                const activeButton = bookingButtons.find(btn => !btn.disabled);
                
                if (activeButton) {
                    try {
                        const selector = activeButton.id ? `#${activeButton.id}` : `button:has-text("${activeButton.textContent}")`;
                        await this.page.click(selector);
                        console.log(`✅ Clicked booking button: ${activeButton.textContent}`);
                        
                        await this.wait(5000); // Wait for booking to process
                        
                        // Check for success or error messages
                        const messages = await this.page.$$eval('*', elements => {
                            return elements
                                .filter(el => {
                                    const text = el.textContent.toLowerCase();
                                    return text.includes('success') ||
                                           text.includes('error') ||
                                           text.includes('failed') ||
                                           text.includes('booked') ||
                                           text.includes('confirmed');
                                })
                                .map(el => el.textContent.trim());
                        });
                        
                        phaseResults.details.resultMessages = messages;
                        
                        if (messages.some(msg => msg.toLowerCase().includes('success') || msg.toLowerCase().includes('confirmed'))) {
                            console.log('✅ Booking appears successful');
                            phaseResults.success = true;
                        } else if (messages.some(msg => msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed'))) {
                            console.log('❌ Booking failed with error message');
                            phaseResults.errors.push('Booking failed with error message');
                        } else {
                            console.log('⚠️  Booking status unclear');
                            phaseResults.errors.push('Booking status unclear');
                        }
                        
                    } catch (e) {
                        console.log('Failed to click booking button:', e.message);
                        phaseResults.errors.push(`Failed to click booking button: ${e.message}`);
                    }
                }
            } else {
                console.log('❌ No booking buttons found');
                phaseResults.errors.push('No booking buttons found');
            }
            
            await this.takeScreenshot('5-booking-completion', 'Booking completion attempt');
            
        } catch (error) {
            console.log(`❌ Booking completion failed: ${error.message}`);
            phaseResults.errors.push(error.message);
            await this.takeScreenshot('5-booking-completion-error', 'Booking completion error');
        }
        
        this.testResults.phases.bookingCompletion = phaseResults;
        return phaseResults.success;
    }

    analyzeNetworkData() {
        console.log('\n🔍 ANALYZING NETWORK DATA');
        
        const apiCalls = this.networkLogs.filter(log => log.url.includes('/api/'));
        const bookingCalls = apiCalls.filter(log => log.url.includes('appointment') || log.url.includes('booking'));
        const availabilityCalls = apiCalls.filter(log => log.url.includes('availability'));
        const errorResponses = this.networkLogs.filter(log => log.type === 'response' && log.status >= 400);
        
        this.testResults.networkAnalysis = {
            totalRequests: this.networkLogs.filter(log => log.type === 'request').length,
            totalResponses: this.networkLogs.filter(log => log.type === 'response').length,
            apiCallsCount: apiCalls.length,
            bookingCallsCount: bookingCalls.length,
            availabilityCallsCount: availabilityCalls.length,
            errorResponsesCount: errorResponses.length,
            errorResponses: errorResponses.map(res => ({
                url: res.url,
                status: res.status,
                statusText: res.statusText,
                data: res.data
            })),
            bookingApiCalls: bookingCalls.map(call => ({
                type: call.type,
                method: call.method || 'N/A',
                url: call.url,
                status: call.status || 'N/A',
                data: call.data || call.postData
            }))
        };
        
        console.log('📊 Network Analysis Complete');
        console.log(`- Total API calls: ${apiCalls.length}`);
        console.log(`- Booking-related calls: ${bookingCalls.length}`);
        console.log(`- Availability calls: ${availabilityCalls.length}`);
        console.log(`- Error responses: ${errorResponses.length}`);
    }

    generateConclusions() {
        console.log('\n📋 GENERATING CONCLUSIONS');
        
        const conclusions = [];
        
        // Check each phase
        Object.keys(this.testResults.phases).forEach(phase => {
            const phaseResult = this.testResults.phases[phase];
            if (!phaseResult.success) {
                conclusions.push(`❌ ${phase} failed: ${phaseResult.errors.join(', ')}`);
            } else {
                conclusions.push(`✅ ${phase} completed successfully`);
            }
        });
        
        // Check for specific issues
        if (this.testResults.networkAnalysis.errorResponsesCount > 0) {
            conclusions.push(`🚨 ${this.testResults.networkAnalysis.errorResponsesCount} API errors detected`);
        }
        
        if (this.testResults.networkAnalysis.bookingCallsCount === 0) {
            conclusions.push('⚠️  No booking API calls detected - booking may not be reaching the backend');
        }
        
        this.testResults.conclusions = conclusions;
        
        conclusions.forEach(conclusion => console.log(conclusion));
    }

    async saveReport() {
        const reportFilename = `booking-workflow-test-${Date.now()}.json`;
        const reportPath = path.join(__dirname, reportFilename);
        
        fs.writeFileSync(reportPath, JSON.stringify({
            ...this.testResults,
            networkLogs: this.networkLogs,
            errorLogs: this.errorLogs,
            screenshots: this.screenshots
        }, null, 2));
        
        console.log(`\n📄 Report saved: ${reportFilename}`);
        return reportPath;
    }

    async runCompleteTest() {
        console.log('🚀 Starting Comprehensive Booking Workflow Test\n');
        
        try {
            await this.init();
            
            // Run all phases
            await this.phase1_NavigateToBooking();
            await this.phase2_SelectService();
            await this.phase3_VerifyStaff();
            await this.phase4_SelectTimeSlot();
            await this.phase5_CompleteBooking();
            
            // Analysis
            this.analyzeNetworkData();
            this.generateConclusions();
            
            // Save report
            const reportPath = await this.saveReport();
            
            console.log('\n✅ Test completed successfully!');
            return reportPath;
            
        } catch (error) {
            console.log(`\n❌ Test failed with error: ${error.message}`);
            this.testResults.conclusions.push(`Fatal error: ${error.message}`);
            await this.saveReport();
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Run the test
async function main() {
    const tester = new BookingWorkflowTester();
    try {
        const reportPath = await tester.runCompleteTest();
        console.log(`\nFull report available at: ${reportPath}`);
    } catch (error) {
        console.error('Test execution failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = BookingWorkflowTester;