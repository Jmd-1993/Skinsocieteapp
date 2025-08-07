#!/usr/bin/env node

/**
 * Production API Test
 * 
 * Direct testing of the Skin Societe booking API endpoints to verify
 * staff filtering functionality without requiring browser authentication
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class ProductionAPITester {
  constructor() {
    this.baseUrl = 'https://skinsocieteapp.onrender.com';
    this.results = {
      availabilityAPI: null,
      staffFiltering: null,
      serviceFiltering: null,
      errors: []
    };
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = {
              status: res.statusCode,
              headers: res.headers,
              body: body,
              data: body ? JSON.parse(body) : null
            };
            resolve(result);
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body,
              data: null,
              parseError: e.message
            });
          }
        });
      });

      req.on('error', reject);

      if (data && method !== 'GET') {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async testAvailabilityAPI() {
    console.log('\n📅 Testing availability API...');
    
    try {
      // Test availability endpoint with Cottesloe branch and injectable service
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const testDate = tomorrow.toISOString().split('T')[0];
      
      const requestData = {
        date: testDate,
        serviceId: 'gyyUxf51abS0lB-A_3PDFA', // Dermal Filler service ID
        branchId: 'wQbnBjP6ztI8nuVpNT6MsQ', // Cottesloe branch ID
        duration: 60
      };

      console.log('🔍 Testing with data:', requestData);

      const response = await this.makeRequest('/api/appointments/availability', 'POST', requestData);
      
      console.log(`📊 API Response Status: ${response.status}`);
      
      if (response.status === 200 && response.data) {
        const data = response.data;
        console.log('✅ Availability API Response:', {
          success: data.success,
          slotsFound: data.slots?.length || 0,
          staffFound: data.staff?.length || 0,
          mockData: data.mockData
        });

        // Analyze staff filtering
        if (data.staff && Array.isArray(data.staff)) {
          console.log('\n👥 Staff Analysis:');
          console.log(`   Total staff returned: ${data.staff.length}`);
          
          if (data.staff.length <= 2) {
            console.log('✅ Staff filtering appears to be working (≤2 staff returned)');
          } else {
            console.log('⚠️  Potential staff filtering issue (>2 staff returned)');
          }
          
          data.staff.forEach((staff, index) => {
            console.log(`   ${index + 1}. ${staff.name || staff.staffName || 'Unknown'} (ID: ${staff.id || staff.staffId})`);
          });

          // Check for specific staff names
          const staffNames = data.staff.map(s => (s.name || s.staffName || '').toLowerCase());
          const hasIsabelle = staffNames.some(name => name.includes('isabelle'));
          const hasMel = staffNames.some(name => name.includes('mel'));
          
          console.log(`   Isabelle found: ${hasIsabelle ? 'YES' : 'NO'}`);
          console.log(`   Mel found: ${hasMel ? 'YES' : 'NO'}`);

          this.results.staffFiltering = {
            success: true,
            totalStaff: data.staff.length,
            isFilteredCorrectly: data.staff.length <= 2,
            hasIsabelle,
            hasMel,
            staffList: data.staff.map(s => ({
              name: s.name || s.staffName,
              id: s.id || s.staffId
            }))
          };
        } else {
          console.log('⚠️  No staff data in response');
          this.results.staffFiltering = {
            success: false,
            reason: 'No staff data returned'
          };
        }

        // Analyze availability slots
        if (data.slots && Array.isArray(data.slots)) {
          console.log(`\n🕒 Time Slots: ${data.slots.length} found`);
          const availableSlots = data.slots.filter(slot => slot.available);
          console.log(`   Available slots: ${availableSlots.length}`);
          
          if (availableSlots.length > 0) {
            console.log('   Sample available times:');
            availableSlots.slice(0, 3).forEach(slot => {
              console.log(`     ${slot.time} with ${slot.staffName} (${slot.staffId})`);
            });
          }
        }

        this.results.availabilityAPI = {
          success: true,
          status: response.status,
          data: data
        };

      } else if (response.status === 401) {
        console.log('🔐 API requires authentication');
        this.results.availabilityAPI = {
          success: false,
          status: response.status,
          reason: 'Authentication required'
        };
      } else {
        console.log('❌ API request failed:', response.status, response.body);
        this.results.availabilityAPI = {
          success: false,
          status: response.status,
          error: response.body
        };
      }

    } catch (error) {
      console.error('❌ Availability API test failed:', error.message);
      this.results.availabilityAPI = {
        success: false,
        error: error.message
      };
    }
  }

  async testServiceQualificationFiltering() {
    console.log('\n💉 Testing service qualification filtering...');
    
    // Test with different service types to verify qualification-based staff filtering
    const testServices = [
      {
        id: 'gyyUxf51abS0lB-A_3PDFA',
        name: 'Dermal Filler',
        type: 'Injectable',
        expectedStaff: 'Should show only qualified staff (Isabelle)'
      },
      {
        id: 'hydrating-facial',
        name: 'Hydrating Facial', 
        type: 'Facial',
        expectedStaff: 'Should show both Isabelle and Mel'
      }
    ];

    for (const service of testServices) {
      console.log(`\n🧪 Testing ${service.name} (${service.type})...`);
      
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const testDate = tomorrow.toISOString().split('T')[0];
        
        const requestData = {
          date: testDate,
          serviceId: service.id,
          branchId: 'wQbnBjP6ztI8nuVpNT6MsQ',
          duration: 60
        };

        const response = await this.makeRequest('/api/appointments/availability', 'POST', requestData);
        
        if (response.status === 200 && response.data?.staff) {
          const staffCount = response.data.staff.length;
          console.log(`   Staff returned: ${staffCount}`);
          console.log(`   Expected: ${service.expectedStaff}`);
          
          if (service.type === 'Injectable' && staffCount === 1) {
            console.log('✅ Injectable qualification filtering working correctly');
          } else if (service.type === 'Facial' && staffCount === 2) {
            console.log('✅ Regular service staff availability working correctly');
          } else {
            console.log(`⚠️  Unexpected staff count for ${service.type} service`);
          }
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ Error testing ${service.name}:`, error.message);
      }
    }
  }

  async testDirectStaffEndpoint() {
    console.log('\n👥 Testing direct staff endpoint...');
    
    try {
      // Try to access staff endpoint directly
      const response = await this.makeRequest('/api/staff');
      
      console.log(`📊 Staff endpoint status: ${response.status}`);
      
      if (response.status === 200 && response.data) {
        console.log('✅ Staff endpoint accessible');
        console.log(`   Total staff: ${response.data.length || 'Unknown'}`);
      } else {
        console.log('⚠️  Staff endpoint not accessible or different structure');
      }
    } catch (error) {
      console.log('❌ Staff endpoint test failed:', error.message);
    }
  }

  async generateAPIReport() {
    console.log('\n📊 Generating API test report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      testTarget: this.baseUrl,
      testType: 'Production API Testing',
      results: this.results,
      summary: {
        apiAccessible: this.results.availabilityAPI?.success || false,
        staffFilteringVerified: this.results.staffFiltering?.isFilteredCorrectly || false,
        authenticationRequired: false,
        criticalFindings: []
      }
    };

    // Analyze results for critical findings
    if (this.results.availabilityAPI?.status === 401) {
      report.summary.authenticationRequired = true;
      report.summary.criticalFindings.push('API requires authentication - cannot test staff filtering');
    }

    if (this.results.staffFiltering?.totalStaff > 2) {
      report.summary.criticalFindings.push(`Staff filtering may not be working - returned ${this.results.staffFiltering.totalStaff} staff instead of ≤2`);
    }

    if (!this.results.staffFiltering?.hasIsabelle) {
      report.summary.criticalFindings.push('Isabelle not found in staff list - may indicate filtering issue');
    }

    // Save report
    const reportPath = path.join(__dirname, `api-test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Display results
    console.log('\n🎯 PRODUCTION API TEST REPORT');
    console.log('='.repeat(50));
    
    console.log(`🌐 API Base URL: ${this.baseUrl}`);
    console.log(`📅 Test Date: ${new Date().toLocaleDateString()}`);
    
    if (this.results.availabilityAPI) {
      console.log(`\n📅 Availability API:`);
      console.log(`   Status: ${this.results.availabilityAPI.success ? 'SUCCESS' : 'FAILED'}`);
      if (this.results.availabilityAPI.status) {
        console.log(`   HTTP Status: ${this.results.availabilityAPI.status}`);
      }
    }

    if (this.results.staffFiltering) {
      console.log(`\n👥 Staff Filtering:`);
      console.log(`   Status: ${this.results.staffFiltering.success ? 'TESTED' : 'FAILED'}`);
      if (this.results.staffFiltering.totalStaff !== undefined) {
        console.log(`   Total Staff: ${this.results.staffFiltering.totalStaff}`);
        console.log(`   Correctly Filtered: ${this.results.staffFiltering.isFilteredCorrectly ? 'YES' : 'NO'}`);
        console.log(`   Isabelle Present: ${this.results.staffFiltering.hasIsabelle ? 'YES' : 'NO'}`);
        console.log(`   Mel Present: ${this.results.staffFiltering.hasMel ? 'YES' : 'NO'}`);
      }
    }

    if (report.summary.criticalFindings.length > 0) {
      console.log('\n🚨 CRITICAL FINDINGS:');
      report.summary.criticalFindings.forEach((finding, index) => {
        console.log(`${index + 1}. ${finding}`);
      });
    } else {
      console.log('\n✅ No critical issues detected in API testing');
    }

    console.log(`\n📄 Detailed Report: ${reportPath}`);
    console.log('='.repeat(50));

    return report;
  }

  async run() {
    console.log('🧪 Starting Production API Testing');
    console.log('Target: Skin Societe Booking System APIs');
    console.log('Focus: Staff filtering and availability verification');
    
    try {
      await this.testAvailabilityAPI();
      await this.testServiceQualificationFiltering();
      await this.testDirectStaffEndpoint();
      
    } catch (error) {
      console.error('💥 API testing failed:', error.message);
      this.results.errors.push(`API testing failed: ${error.message}`);
    } finally {
      await this.generateAPIReport();
    }
  }
}

// Run the API test
if (require.main === module) {
  const tester = new ProductionAPITester();
  tester.run().catch(console.error);
}

module.exports = { ProductionAPITester };