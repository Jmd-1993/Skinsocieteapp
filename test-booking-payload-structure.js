import phorestService from './app/services/phorestService.js';

async function investigateBookingRequirements() {
  console.log('🔍 Investigating Phorest Booking API Requirements\n');
  
  try {
    await phorestService.getBranches();
    
    // Get available resources
    const services = await phorestService.getServices();
    const staff = await phorestService.getStaff();
    
    console.log(`📋 Available services: ${services.length}`);
    console.log(`👥 Available staff: ${staff.length}`);
    
    if (services.length === 0 || staff.length === 0) {
      throw new Error('No services or staff available for testing');
    }
    
    const clientId = 'EKig-KWT5NYu4b150Fra8w';
    const serviceId = services[0].serviceId;
    const staffId = staff[0].staffId;
    
    console.log('\n🎯 Test Parameters:');
    console.log(`   Client: ${clientId}`);
    console.log(`   Service: ${services[0].name} (${serviceId})`);
    console.log(`   Staff: ${staff[0].firstName} ${staff[0].lastName} (${staffId})`);
    
    // Try different time slots to find one that works
    const testTimes = [
      '2025-08-12T02:00:00.000Z', // 10 AM Perth time (Tuesday)
      '2025-08-12T04:00:00.000Z', // 12 PM Perth time (Tuesday)
      '2025-08-13T02:00:00.000Z', // 10 AM Perth time (Wednesday)
      '2025-08-13T04:00:00.000Z', // 12 PM Perth time (Wednesday)
      '2025-08-14T02:00:00.000Z', // 10 AM Perth time (Thursday)
    ];
    
    for (const startTime of testTimes) {
      console.log(`\n⏰ Testing time slot: ${startTime} (${new Date(startTime).toLocaleString('en-AU', { timeZone: 'Australia/Perth' })} Perth time)`);
      
      // Test 1: Basic required fields only
      const basicPayload = {
        clientId: clientId,
        clientAppointmentSchedules: [
          {
            clientId: clientId,
            serviceSchedules: [
              {
                serviceId: serviceId,
                startTime: startTime,
                staffId: staffId
              }
            ]
          }
        ]
      };
      
      try {
        console.log('   📦 Testing basic payload...');
        const response = await phorestService.api.post(
          `/${phorestService.config.businessId}/branch/${phorestService.branchId}/booking`, 
          basicPayload
        );
        
        console.log('   ✅ SUCCESS! Basic booking created:', response.data);
        
        // If successful, analyze what fields are returned
        console.log('\n📊 SUCCESS ANALYSIS:');
        console.log('   Response fields:', Object.keys(response.data));
        console.log('   Full response:', JSON.stringify(response.data, null, 2));
        
        return; // Exit on first success
        
      } catch (error) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        
        console.log(`   ❌ Basic payload failed: ${status}`);
        
        if (status === 400) {
          console.log(`   💬 Error: ${errorData?.detail || errorData?.message || 'Unknown'}`);
          console.log(`   🔧 Error Code: ${errorData?.errorCode || 'Unknown'}`);
          
          // If it's a field validation error (not a scheduling conflict), try enhanced payload
          if (!errorData?.detail?.includes('STAFF_NOT_WORKING') && !errorData?.detail?.includes('SLOT_UNAVAILABLE')) {
            console.log('   🧪 Trying enhanced payload with additional fields...');
            
            // Test 2: Enhanced payload with optional fields that might be required
            const enhancedPayload = {
              clientId: clientId,
              branchId: phorestService.branchId,
              businessId: phorestService.config.businessId,
              clientAppointmentSchedules: [
                {
                  clientId: clientId,
                  branchId: phorestService.branchId,
                  serviceSchedules: [
                    {
                      serviceId: serviceId,
                      startTime: startTime,
                      staffId: staffId,
                      duration: 60,
                      notes: 'API test booking - deposit/payment investigation',
                      // Potential deposit/payment related fields
                      price: services[0].price || 0,
                      depositRequired: false,
                      depositAmount: 0,
                      paymentStatus: 'PENDING'
                    }
                  ]
                }
              ],
              notes: 'Test booking for API investigation',
              source: 'API_TEST',
              // Potential booking-level payment fields
              requiresDeposit: false,
              depositAmount: 0,
              paymentMethod: null,
              billingInformation: null
            };
            
            try {
              const enhancedResponse = await phorestService.api.post(
                `/${phorestService.config.businessId}/branch/${phorestService.branchId}/booking`, 
                enhancedPayload
              );
              
              console.log('   ✅ SUCCESS! Enhanced booking created:', enhancedResponse.data);
              
              console.log('\n📊 ENHANCED SUCCESS ANALYSIS:');
              console.log('   Response fields:', Object.keys(enhancedResponse.data));
              console.log('   Full response:', JSON.stringify(enhancedResponse.data, null, 2));
              
              return; // Exit on success
              
            } catch (enhancedError) {
              console.log(`   ❌ Enhanced payload also failed: ${enhancedError.response?.status}`);
              console.log(`   💬 Enhanced error: ${enhancedError.response?.data?.detail || enhancedError.response?.data?.message || 'Unknown'}`);
            }
          }
        } else {
          console.log(`   💬 Non-400 error: ${errorData?.detail || errorData?.message || error.message}`);
        }
      }
    }
    
    console.log('\n❌ All time slots failed. This suggests either:');
    console.log('   1. Staff availability issues (check staff schedules in Phorest)');
    console.log('   2. Service qualification issues (staff may not be qualified for this service)');
    console.log('   3. Branch configuration issues');
    console.log('   4. Missing required fields not obvious from documentation');
    
    // Additional investigation: Try to get staff availability
    console.log('\n🔍 ADDITIONAL INVESTIGATION: Staff Availability');
    
    try {
      const availability = await phorestService.getStaffAvailability(staffId, '2025-08-13');
      console.log('Staff availability for 2025-08-13:', availability);
    } catch (availError) {
      console.log('Could not get staff availability:', availError.message);
    }
    
    // Check if staff is qualified for service
    console.log('\n🔍 ADDITIONAL INVESTIGATION: Staff Service Qualification');
    try {
      const qualifiedStaff = await phorestService.getQualifiedStaffForService(serviceId);
      console.log(`Qualified staff for ${services[0].name}:`, qualifiedStaff.map(s => s.firstName + ' ' + s.lastName));
    } catch (qualError) {
      console.log('Could not check staff qualifications:', qualError.message);
    }
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
  }
}

investigateBookingRequirements();