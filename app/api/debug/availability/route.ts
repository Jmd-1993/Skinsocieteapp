import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug availability endpoint called');
    
    // Import Phorest service
    const { default: phorestService } = await import('@/app/services/phorestService.js');
    
    const testDate = '2025-08-11'; // Monday
    const staffId = 'X-qh_VV3E41h9tghKPiRyg'; // Isabelle
    const duration = 60;
    
    console.log(`🧪 Testing availability generation for ${staffId} on ${testDate}`);
    
    // Test business hours calculation
    const businessHours = phorestService.getBusinessHours(testDate);
    console.log('🏢 Business hours:', businessHours);
    
    // Test time slot generation
    const timeSlots = phorestService.generateTimeSlots(testDate, businessHours.start, businessHours.end, duration);
    console.log(`🕐 Time slots generated: ${timeSlots.length}`);
    
    // Test full availability
    const availability = await phorestService.getStaffAvailability(staffId, testDate, duration);
    console.log('📊 Full availability result:', availability);
    
    return NextResponse.json({
      debug: true,
      testDate,
      staffId,
      duration,
      businessHours,
      timeSlotsCount: timeSlots.length,
      timeSlotsSample: timeSlots.slice(0, 5),
      availability: availability,
      dayOfWeek: new Date(testDate).getDay(),
      dateObject: new Date(testDate).toString()
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    
    return NextResponse.json({
      debug: true,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}