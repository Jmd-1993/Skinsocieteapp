// testPhorestBookingFormats.js - Comprehensive booking structure testing
import phorestService from './app/services/phorestService.js';

async function testComprehensiveBookingFormats() {
  console.log('🔧 Comprehensive Phorest Booking API Testing\n');
  console.log('Testing all possible booking structures based on API patterns...\n');
  
  try {
    await phorestService.getBranches();
    
    const joshClientId = 'EKig-KWT5NYu4b150Fra8w';
    const services = await phorestService.getServices();
    const selectedService = services[0];
    
    console.log(`Testing with:`);
    console.log(`  Client ID: ${joshClientId}`);
    console.log(`  Service: ${selectedService.name}`);
    console.log(`  Service ID: ${selectedService.serviceId}`);
    console.log('━'.repeat(60));
    
    const appointmentTime = new Date();
    appointmentTime.setDate(appointmentTime.getDate() + 2); // Day after tomorrow
    appointmentTime.setHours(14, 0, 0, 0); // 2 PM
    
    // Ensure it's not weekend
    if (appointmentTime.getDay() === 0) appointmentTime.setDate(appointmentTime.getDate() + 1);
    if (appointmentTime.getDay() === 6) appointmentTime.setDate(appointmentTime.getDate() + 2);
    
    console.log(`  Appointment time: ${appointmentTime.toLocaleString()}\n`);
    
    // Test 1: Direct clientId (not nested)
    console.log('1️⃣ Testing direct clientId format...');
    const structure1 = {
      clientId: joshClientId,
      serviceId: selectedService.serviceId,
      startTime: appointmentTime.toISOString(),
      duration: selectedService.duration || 60
    };
    await testBookingStructure('Direct clientId', structure1);
    
    // Test 2: Nested client object
    console.log('2️⃣ Testing nested client object...');
    const structure2 = {
      client: {
        id: joshClientId
      },
      service: {
        id: selectedService.serviceId
      },
      startTime: appointmentTime.toISOString(),
      duration: selectedService.duration || 60
    };
    await testBookingStructure('Nested client object', structure2);
    
    // Test 3: Appointments array with proper structure
    console.log('3️⃣ Testing appointments array...');
    const structure3 = {
      clientId: joshClientId,
      appointments: [
        {
          serviceId: selectedService.serviceId,
          startTime: appointmentTime.toISOString(),
          duration: selectedService.duration || 60
        }
      ]
    };
    await testBookingStructure('Appointments array', structure3);
    
    // Test 4: Full booking object structure
    console.log('4️⃣ Testing full booking structure...');
    const structure4 = {
      booking: {
        clientId: joshClientId,
        appointments: [
          {
            serviceId: selectedService.serviceId,
            startTime: appointmentTime.toISOString(),
            endTime: new Date(appointmentTime.getTime() + (selectedService.duration || 60) * 60000).toISOString()
          }
        ]
      }
    };
    await testBookingStructure('Full booking object', structure4);
    
    // Test 5: Using proper field names based on Phorest patterns
    console.log('5️⃣ Testing Phorest-style field names...');
    const structure5 = {
      clientId: joshClientId,
      branchId: phorestService.branchId,
      appointments: [
        {
          serviceId: selectedService.serviceId,
          startTime: appointmentTime.toISOString(),
          duration: selectedService.duration || 60,
          price: selectedService.price || 0
        }
      ],
      notes: 'API test booking for Josh Mills'
    };
    await testBookingStructure('Phorest-style fields', structure5);
    
    // Test 6: Minimal required fields only
    console.log('6️⃣ Testing minimal required fields...');
    const structure6 = {
      clientId: joshClientId,
      serviceId: selectedService.serviceId,
      startTime: appointmentTime.toISOString()
    };
    await testBookingStructure('Minimal fields', structure6);
    
    // Test 7: With explicit branch and business IDs
    console.log('7️⃣ Testing with explicit IDs...');
    const structure7 = {
      businessId: phorestService.config.businessId,
      branchId: phorestService.branchId,
      clientId: joshClientId,
      appointments: [
        {
          serviceId: selectedService.serviceId,
          startTime: appointmentTime.toISOString(),
          duration: selectedService.duration || 60
        }
      ]
    };
    await testBookingStructure('With explicit IDs', structure7);
    
    // Test 8: Different date format
    console.log('8️⃣ Testing different date formats...');
    const structure8 = {
      clientId: joshClientId,
      serviceId: selectedService.serviceId,
      startTime: appointmentTime.toISOString().split('.')[0] + 'Z', // Remove milliseconds
      duration: selectedService.duration || 60
    };
    await testBookingStructure('Different date format', structure8);
    
    // Test 9: Using timestamp instead of ISO string
    console.log('9️⃣ Testing timestamp format...');
    const structure9 = {
      clientId: joshClientId,
      serviceId: selectedService.serviceId,
      startTime: appointmentTime.getTime(),
      duration: selectedService.duration || 60
    };
    await testBookingStructure('Timestamp format', structure9);
    
    // Test 10: REST-style nested resources
    console.log('🔟 Testing REST-style nested resources...');
    const structure10 = {
      data: {
        attributes: {
          clientId: joshClientId,
          serviceId: selectedService.serviceId,
          startTime: appointmentTime.toISOString(),
          duration: selectedService.duration || 60
        }
      }
    };
    await testBookingStructure('REST-style nested', structure10);
    
    console.log('\n━'.repeat(60));
    console.log('🔍 All test structures completed.');
    console.log('\nIf none worked, the issue might be:');
    console.log('  1. Missing required fields not obvious from docs');
    console.log('  2. API endpoint authentication scope');
    console.log('  3. Business-specific configuration');
    console.log('  4. Timing/availability validation');
    console.log('\n💡 Next step: Contact Phorest dev support with these test results');
    
  } catch (error) {
    console.error('Setup error:', error.message);
  }
}

async function testBookingStructure(name, structure) {
  try {
    console.log(`   Structure: ${JSON.stringify(structure, null, 4)}`);
    
    const booking = await phorestService.createAppointment(structure);
    
    console.log(`✅ SUCCESS with ${name}!`);
    console.log(`   Booking created: ${JSON.stringify(booking, null, 2)}`);
    console.log('━'.repeat(60));
    console.log('🎉 BOOKING SUCCESSFUL! Josh Mills appointment created!');
    return true;
    
  } catch (error) {
    console.log(`❌ ${name} failed: ${error.message}`);
    if (error.message.includes('400')) {
      console.log(`   This suggests field validation issues`);
    } else if (error.message.includes('500')) {
      console.log(`   This suggests server-side processing issues`);
    }
    console.log('');
    return false;
  }
}

testComprehensiveBookingFormats();