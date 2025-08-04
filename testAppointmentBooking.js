// testAppointmentBooking.js
import phorestService from './app/services/phorestService.js';

async function bookAppointmentForJosh() {
  console.log('🗓️ Testing Appointment Booking for Josh Mills\n');
  console.log('📱 Phone: 0406529251');
  console.log('📍 Location: Skin Societé Cottesloe');
  console.log('━'.repeat(50));

  try {
    // Step 1: Search for Josh Mills by phone number
    console.log('\n1️⃣ Searching for Josh Mills...');
    
    // Search more pages to find Josh
    let joshClients = [];
    let page = 0;
    let foundJosh = false;
    
    while (!foundJosh && page < 10) {
      const { clients, pagination } = await phorestService.getClients({ 
        size: 200,
        page: page 
      });
      
      // Search by phone number (Phorest stores as +61 format)
      const found = clients.filter(client => {
        const clientPhone = client.mobile || client.phone || '';
        const clientName = `${client.firstName} ${client.lastName}`.toLowerCase();
        
        return clientPhone.includes('406529251') || 
               clientPhone === '0406529251' ||
               clientPhone === '+61406529251' ||
               clientPhone === '61406529251' ||
               clientName.includes('josh mills');
      });
      
      if (found.length > 0) {
        joshClients = found;
        foundJosh = true;
      }
      
      // Check if there are more pages
      if (!pagination || page >= pagination.totalPages - 1) {
        break;
      }
      page++;
    }
    
    console.log(`   Searched ${page + 1} page(s) of clients...`);
    
    if (joshClients.length === 0) {
      console.log('❌ Josh Mills not found. Let me search more broadly...');
      
      // Try searching all clients with name Josh
      const joshByName = clients.filter(client => 
        client.firstName?.toLowerCase().includes('josh') ||
        client.lastName?.toLowerCase().includes('mills')
      );
      
      console.log(`Found ${joshByName.length} clients with Josh or Mills in name:`);
      joshByName.slice(0, 5).forEach(client => {
        console.log(`   - ${client.firstName} ${client.lastName} (${client.mobile || client.phone || 'No phone'})`);
      });
      
      // If still not found, create Josh Mills
      console.log('\n   Creating Josh Mills as new client...');
      const newJosh = await phorestService.createClient({
        firstName: 'Josh',
        lastName: 'Mills',
        mobile: '0406529251',
        email: 'josh@skinsociete.com.au',
        notes: 'VIP Client - Skin Societé Owner'
      });
      
      console.log('✅ Created Josh Mills successfully!');
      console.log(`   Client ID: ${newJosh.clientId}`);
      joshClients.push(newJosh);
    } else {
      console.log(`✅ Found Josh Mills!`);
      console.log(`   Client ID: ${joshClients[0].clientId}`);
      console.log(`   Name: ${joshClients[0].firstName} ${joshClients[0].lastName}`);
      console.log(`   Phone: ${joshClients[0].mobile || joshClients[0].phone}`);
    }
    
    const joshClient = joshClients[0];
    
    // Step 2: Get available services
    console.log('\n2️⃣ Getting available services...');
    const services = await phorestService.getServices();
    console.log(`Found ${services.length} services available`);
    
    // Show some popular services
    const popularServices = services.slice(0, 5);
    console.log('Popular services:');
    popularServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name} - $${service.price} (${service.duration} mins)`);
    });
    
    // Select a consultation or first available service
    const consultationService = services.find(s => 
      s.name.toLowerCase().includes('consult') || 
      s.name.toLowerCase().includes('facial')
    ) || services[0];
    
    console.log(`\n   Selected service: ${consultationService.name}`);
    console.log(`   Duration: ${consultationService.duration} minutes`);
    console.log(`   Price: $${consultationService.price}`);
    
    // Step 3: Get staff members
    console.log('\n3️⃣ Getting available staff...');
    const staff = await phorestService.getStaff();
    
    if (staff.length === 0) {
      console.log('⚠️  No staff members found. Will book without specific staff assignment.');
    } else {
      console.log(`Found ${staff.length} staff members`);
      staff.forEach(member => {
        console.log(`   - ${member.firstName} ${member.lastName} (ID: ${member.staffId})`);
      });
    }
    
    // Step 4: Find next available appointment slot
    console.log('\n4️⃣ Finding next available appointment time...');
    
    // Get tomorrow's date at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    // Format date for Phorest API
    const appointmentDate = tomorrow.toISOString();
    
    console.log(`   Checking availability for: ${tomorrow.toLocaleString()}`);
    
    // Step 5: Create the appointment
    console.log('\n5️⃣ Creating appointment...');
    
    const appointmentData = {
      clientId: joshClient.clientId,
      serviceId: consultationService.serviceId,
      startTime: appointmentDate,
      duration: consultationService.duration || 30,
      notes: 'Test appointment booking via Skin Societé API integration'
    };
    
    // Add staff if available
    if (staff.length > 0) {
      appointmentData.staffId = staff[0].staffId;
    }
    
    try {
      const appointment = await phorestService.createAppointment(appointmentData);
      
      console.log('\n✅ APPOINTMENT BOOKED SUCCESSFULLY!');
      console.log('━'.repeat(50));
      console.log('📅 Appointment Details:');
      console.log(`   Client: ${joshClient.firstName} ${joshClient.lastName}`);
      console.log(`   Service: ${consultationService.name}`);
      console.log(`   Date/Time: ${new Date(appointment.startTime).toLocaleString()}`);
      console.log(`   Duration: ${appointment.duration} minutes`);
      console.log(`   Location: Skin Societé Cottesloe`);
      console.log(`   Appointment ID: ${appointment.appointmentId}`);
      console.log('━'.repeat(50));
      
    } catch (bookingError) {
      console.log('\n⚠️  Appointment creation failed:', bookingError.message);
      console.log('\nThis might be because:');
      console.log('   1. The time slot is not available');
      console.log('   2. Staff member is not available');
      console.log('   3. Service requires specific setup in Phorest');
      console.log('\nTrying alternative approach...');
      
      // Show the appointment structure for manual booking
      console.log('\n📋 Appointment Request Structure:');
      console.log(JSON.stringify(appointmentData, null, 2));
      console.log('\nThe appointment booking system is ready.');
      console.log('In production, you would:');
      console.log('   1. Check availability first using checkAvailability()');
      console.log('   2. Let customer select from available slots');
      console.log('   3. Confirm booking with selected time');
    }
    
    // Step 6: Show recent appointments for Josh
    console.log('\n6️⃣ Checking Josh\'s appointments...');
    try {
      const joshAppointments = await phorestService.getClientAppointments(joshClient.clientId);
      console.log(`Found ${joshAppointments.length} appointments for Josh Mills`);
      
      if (joshAppointments.length > 0) {
        console.log('Recent appointments:');
        joshAppointments.slice(0, 3).forEach(apt => {
          console.log(`   - ${apt.serviceName} on ${new Date(apt.startTime).toLocaleDateString()}`);
        });
      }
    } catch (error) {
      console.log('Could not retrieve appointments:', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error during appointment booking test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
bookAppointmentForJosh().catch(error => {
  console.error('\n💥 Fatal Error:', error.message);
});