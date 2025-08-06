import { NextRequest, NextResponse } from 'next/server';

interface BookingRequest {
  clientId: string;
  serviceId: string;
  staffId: string;
  startTime: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();
    const { clientId, serviceId, staffId, startTime, notes } = body;

    // Validate required fields
    if (!clientId || !serviceId || !staffId || !startTime) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'clientId, serviceId, staffId, and startTime are required'
        },
        { status: 400 }
      );
    }

    // Import Phorest service with absolute path
    const { default: phorestService } = await import('@/app/services/phorestService.js');

    console.log(`🎯 Creating booking for client ${clientId}`);
    console.log(`📅 Service: ${serviceId}, Staff: ${staffId}, Time: ${startTime}`);

    // Use the new correct booking method
    const booking = await phorestService.createBooking(
      clientId,
      serviceId, 
      staffId,
      startTime
    );

    console.log('✅ Booking created successfully:', booking);

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully',
      booking: {
        id: booking.id || booking.appointmentId,
        clientId,
        serviceId,
        staffId,
        startTime,
        status: booking.status || 'confirmed',
        ...booking
      }
    });

  } catch (error) {
    console.error('❌ Booking API error:', error);
    
    // Extract meaningful error details from Phorest API responses
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific Phorest booking validation errors
      if (error.message.includes('STAFF_NOT_WORKING') || error.message.includes('SLOT_UNAVAILABLE')) {
        errorMessage = 'The requested staff member is not rostered for the selected time. Please choose a different time when they are working. Note: All times are automatically converted to match your local timezone.';
        statusCode = 400;
      } else if (error.message.includes('STAFF_DOUBLE_BOOKED')) {
        errorMessage = 'The requested time slot is already booked';
        statusCode = 409; // Conflict
      } else if (error.message.includes('CLIENT_NOT_FOUND')) {
        errorMessage = 'Client not found. Please check the client details.';
        statusCode = 404;
      } else if (error.message.includes('SERVICE_NOT_FOUND')) {
        errorMessage = 'Service not found. Please check the service selection.';
        statusCode = 404;
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid booking request - please check appointment details';
        statusCode = 400;
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to book appointment',
        message: errorMessage,
        details: error instanceof Error && error.stack ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId parameter is required' },
        { status: 400 }
      );
    }

    // Import Phorest service with absolute path
    const { default: phorestService } = await import('@/app/services/phorestService.js');

    console.log(`📋 Getting appointments for client: ${clientId}`);

    // Get client appointments
    const appointments = await phorestService.getClientAppointments(clientId);

    return NextResponse.json({
      success: true,
      appointments: appointments.map(apt => ({
        id: apt.appointmentId || apt.id,
        serviceId: apt.serviceId,
        serviceName: apt.serviceName,
        staffId: apt.staffId,
        staffName: apt.staffName,
        startTime: apt.startTime,
        endTime: apt.endTime,
        duration: apt.duration,
        status: apt.status,
        notes: apt.notes,
        cost: apt.totalCost || apt.cost
      }))
    });

  } catch (error) {
    console.error('❌ Get appointments API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve appointments',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}