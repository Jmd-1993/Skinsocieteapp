// testBookingStructure.js
import phorestService from './app/services/phorestService.js';

async function testBookingWithCorrectStructure() {
  console.log('🔧 Testing Correct Booking Structure for Josh Mills\n');
  
  try {
    await phorestService.getBranches();
    
    const joshClientId = 'EKig-KWT5NYu4b150Fra8w';
    const services = await phorestService.getServices();
    const selectedService = services[0]; // 2ml Dermal Filler
    
    console.log('Selected service:', selectedService.name);
    console.log('Service ID:', selectedService.serviceId);
    
    // Based on Phorest API documentation, try different structures
    const appointmentTime = new Date();
    appointmentTime.setDate(appointmentTime.getDate() + 1);
    appointmentTime.setHours(10, 0, 0, 0);
    
    // Structure 1: Standard booking structure
    console.log('\n1️⃣ Trying standard booking structure...');
    const bookingData1 = {
      clientId: joshClientId,
      appointments: [{
        serviceId: selectedService.serviceId,
        startTime: appointmentTime.toISOString(),
        duration: selectedService.duration || 60
      }],
      notes: 'Test booking for Josh Mills via API'
    };
    
    console.log('Booking structure 1:');
    console.log(JSON.stringify(bookingData1, null, 2));
    
    try {
      const booking1 = await phorestService.createAppointment(bookingData1);
      console.log('✅ SUCCESS with structure 1!');
      console.log('Booking created:', booking1);
      return;
    } catch (error) {
      console.log('❌ Structure 1 failed:', error.message);
    }
    
    // Structure 2: Services array format
    console.log('\n2️⃣ Trying services array structure...');
    const bookingData2 = {
      clientId: joshClientId,
      services: [{
        serviceId: selectedService.serviceId,
        startTime: appointmentTime.toISOString(),
        duration: selectedService.duration || 60
      }]
    };
    
    console.log('Booking structure 2:');
    console.log(JSON.stringify(bookingData2, null, 2));
    
    try {
      const booking2 = await phorestService.createAppointment(bookingData2);
      console.log('✅ SUCCESS with structure 2!');
      console.log('Booking created:', booking2);
      return;
    } catch (error) {
      console.log('❌ Structure 2 failed:', error.message);
    }
    
    // Structure 3: Flat structure
    console.log('\n3️⃣ Trying flat structure...');
    const bookingData3 = {
      clientId: joshClientId,
      serviceId: selectedService.serviceId,
      startTime: appointmentTime.toISOString(),
      duration: selectedService.duration || 60,
      notes: 'Test booking for Josh Mills'
    };
    
    console.log('Booking structure 3:');
    console.log(JSON.stringify(bookingData3, null, 2));
    
    try {
      const booking3 = await phorestService.createAppointment(bookingData3);
      console.log('✅ SUCCESS with structure 3!');
      console.log('Booking created:', booking3);
      return;
    } catch (error) {
      console.log('❌ Structure 3 failed:', error.message);
    }
    
    // Structure 4: Complete booking structure
    console.log('\n4️⃣ Trying complete booking structure...');
    const bookingData4 = {
      client: {
        clientId: joshClientId
      },
      appointments: [{
        service: {
          serviceId: selectedService.serviceId
        },
        startTime: appointmentTime.toISOString(),
        endTime: new Date(appointmentTime.getTime() + (selectedService.duration || 60) * 60000).toISOString()
      }],
      notes: 'VIP booking for Josh Mills'
    };
    
    console.log('Booking structure 4:');
    console.log(JSON.stringify(bookingData4, null, 2));
    
    try {
      const booking4 = await phorestService.createAppointment(bookingData4);
      console.log('✅ SUCCESS with structure 4!');
      console.log('Booking created:', booking4);
      return;
    } catch (error) {
      console.log('❌ Structure 4 failed:', error.message);
    }
    
    console.log('\n⚠️  All structures failed. The booking API may require:');
    console.log('   1. Staff assignment');
    console.log('   2. Payment information');
    console.log('   3. Specific permission levels');
    console.log('   4. Different authentication scopes');
    console.log('\n💡 Recommendation: Contact Phorest support for exact booking API structure');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBookingWithCorrectStructure();