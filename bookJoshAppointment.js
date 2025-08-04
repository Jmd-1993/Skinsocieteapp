// bookJoshAppointment.js
import phorestService from './app/services/phorestService.js';

async function bookAppointmentForJosh() {
  console.log('🗓️ Booking Appointment for Josh Mills\n');
  console.log('📱 Phone: 61406529251');
  console.log('📧 Email: josh@skinsociete.com.au');
  console.log('🆔 Client ID: EKig-KWT5NYu4b150Fra8w');
  console.log('📍 Location: Skin Societé Cottesloe');
  console.log('━'.repeat(50));

  try {
    // Initialize and set Cottesloe branch
    await phorestService.getBranches();
    
    // Josh's client ID from our search
    const joshClientId = 'EKig-KWT5NYu4b150Fra8w';
    
    // Step 1: Get Josh's details to confirm
    console.log('\n1️⃣ Confirming client details...');
    const joshClient = await phorestService.getClientById(joshClientId);
    console.log(`✅ Client: ${joshClient.firstName} ${joshClient.lastName}`);
    console.log(`   Mobile: ${joshClient.mobile}`);
    console.log(`   Email: ${joshClient.email}`);
    
    // Step 2: Get available services
    console.log('\n2️⃣ Getting available services...');
    const services = await phorestService.getServices();
    console.log(`Found ${services.length} services available`);
    
    // Show consultation and popular services
    const consultationServices = services.filter(s => 
      s.name.toLowerCase().includes('consult') || 
      s.name.toLowerCase().includes('consultation') ||
      s.name.toLowerCase().includes('skin analysis')
    );
    
    const selectedService = consultationServices[0] || services[0];
    
    console.log('\nAvailable services:');
    services.slice(0, 10).forEach((service, index) => {
      const marker = service.serviceId === selectedService.serviceId ? '👉' : '  ';
      console.log(`${marker} ${index + 1}. ${service.name}`);
      console.log(`      Price: $${service.price || 'POA'} | Duration: ${service.duration || 30} mins`);
      console.log(`      ID: ${service.serviceId}`);
    });
    
    console.log(`\n✅ Selected service: ${selectedService.name}`);
    
    // Step 3: Get staff members
    console.log('\n3️⃣ Getting available staff...');
    const staff = await phorestService.getStaff();
    
    let selectedStaffId = null;
    if (staff.length > 0) {
      console.log(`Found ${staff.length} staff members:`);
      staff.forEach(member => {
        console.log(`   - ${member.firstName} ${member.lastName} (ID: ${member.staffId})`);
      });
      selectedStaffId = staff[0].staffId;
    } else {
      console.log('⚠️  No staff members found. Booking without staff assignment.');
    }
    
    // Step 4: Find next available slot
    console.log('\n4️⃣ Finding next available appointment slot...');
    
    // Get appointments for next 7 days to check availability
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    // Try to get existing appointments first
    console.log('   Checking existing appointments...');
    try {
      const appointments = await phorestService.getAppointments({
        from_date: today.toISOString().split('T')[0],
        to_date: nextWeek.toISOString().split('T')[0],
        size: 100
      });
      
      console.log(`   Found ${appointments.appointments.length} existing appointments this week`);
    } catch (error) {
      console.log('   Note: Could not fetch existing appointments');
    }
    
    // Find a good appointment time - tomorrow at 10 AM
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1); // Tomorrow
    appointmentDate.setHours(10, 0, 0, 0); // 10:00 AM
    
    // If tomorrow is weekend, push to Monday
    if (appointmentDate.getDay() === 0) appointmentDate.setDate(appointmentDate.getDate() + 1); // Sunday -> Monday
    if (appointmentDate.getDay() === 6) appointmentDate.setDate(appointmentDate.getDate() + 2); // Saturday -> Monday
    
    console.log(`\n   Proposed appointment time: ${appointmentDate.toLocaleString()}`);
    
    // Step 5: Create the appointment
    console.log('\n5️⃣ Creating appointment...');
    
    const appointmentData = {
      clientId: joshClientId,
      serviceId: selectedService.serviceId,
      startTime: appointmentDate.toISOString(),
      duration: selectedService.duration || 30,
      notes: 'VIP appointment - Skin Societé owner Josh Mills'
    };
    
    // Add staff if available
    if (selectedStaffId) {
      appointmentData.staffId = selectedStaffId;
    }
    
    console.log('\n📋 Appointment Details:');
    console.log(JSON.stringify(appointmentData, null, 2));
    
    try {
      const appointment = await phorestService.createAppointment(appointmentData);
      
      console.log('\n✅ APPOINTMENT BOOKED SUCCESSFULLY!');
      console.log('━'.repeat(50));
      console.log('📅 Confirmed Appointment:');
      console.log(`   Client: ${joshClient.firstName} ${joshClient.lastName}`);
      console.log(`   Service: ${selectedService.name}`);
      console.log(`   Date/Time: ${new Date(appointment.startTime).toLocaleString()}`);
      console.log(`   Duration: ${appointment.duration} minutes`);
      console.log(`   Location: Skin Societé Cottesloe`);
      if (appointment.staffName) {
        console.log(`   Staff: ${appointment.staffName}`);
      }
      console.log(`   Appointment ID: ${appointment.appointmentId}`);
      console.log(`   Status: ${appointment.status || 'Confirmed'}`);
      console.log('━'.repeat(50));
      console.log('\n🎉 Josh Mills has been successfully booked for his appointment!');
      
    } catch (bookingError) {
      console.log('\n⚠️  Appointment creation encountered an issue:', bookingError.message);
      
      if (bookingError.message.includes('400')) {
        console.log('\nThis might be because:');
        console.log('   1. The time slot is already booked');
        console.log('   2. The service requires specific setup');
        console.log('   3. Staff member is not available at this time');
        console.log('   4. The branch may have specific booking rules');
        
        console.log('\n💡 To successfully book:');
        console.log('   1. Check available time slots first');
        console.log('   2. Ensure staff is assigned to the service');
        console.log('   3. Verify service is bookable online');
        console.log('   4. Use Phorest admin panel for complex bookings');
      }
    }
    
    // Step 6: Show Josh's upcoming appointments
    console.log('\n6️⃣ Retrieving Josh\'s appointments...');
    try {
      const joshAppointments = await phorestService.getClientAppointments(joshClientId, {
        size: 10
      });
      
      if (joshAppointments.length > 0) {
        console.log(`\n📅 Josh has ${joshAppointments.length} appointment(s):`);
        joshAppointments.forEach(apt => {
          const aptDate = new Date(apt.startTime);
          const status = apt.cancelled ? '❌ Cancelled' : '✅ Active';
          console.log(`   ${status} ${apt.serviceName || 'Service'} - ${aptDate.toLocaleString()}`);
          if (apt.staffName) console.log(`        with ${apt.staffName}`);
        });
      } else {
        console.log('   No appointments found for Josh');
      }
    } catch (error) {
      console.log('   Could not retrieve appointments:', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the booking
bookAppointmentForJosh().catch(error => {
  console.error('\n💥 Fatal Error:', error.message);
});