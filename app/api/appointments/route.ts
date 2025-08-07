import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, logError, AppError, ErrorTypes } from '@/app/lib/error-handler';
import { emailService, BookingEmailData } from '@/app/lib/email-service';
import { format, parseISO } from 'date-fns';

interface BookingRequest {
  clientId: string;
  serviceId: string;
  staffId: string;
  startTime: string;
  notes?: string;
  clientName?: string;
  clientEmail?: string;
  serviceName?: string;
  staffName?: string;
  duration?: number;
  price?: number;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
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
    console.log('🔧 Importing Phorest service...');
    const { default: phorestService } = await import('@/app/services/phorestService.js');
    console.log('✅ Phorest service imported successfully');

    console.log(`🎯 Creating booking for client ${clientId}`);
    console.log(`📅 Service: ${serviceId}, Staff: ${staffId}, Time: ${startTime} (Perth time → UTC conversion)`);
    console.log(`🌏 Timezone: Perth (UTC+8) time will be converted to UTC for Phorest API`);

    // Use the new correct booking method
    const booking = await phorestService.createBooking(
      clientId,
      serviceId, 
      staffId,
      startTime
    );

    console.log('✅ Booking created successfully:', booking);

    // Send email notifications (non-blocking)
    if (body.clientEmail) {
      const appointmentDateTime = parseISO(startTime);
      const emailData: BookingEmailData = {
        clientName: body.clientName || 'Valued Client',
        clientEmail: body.clientEmail,
        serviceName: body.serviceName || 'Treatment',
        staffName: body.staffName || 'Your Practitioner',
        appointmentDate: format(appointmentDateTime, 'EEEE, MMMM d, yyyy'),
        appointmentTime: format(appointmentDateTime, 'h:mm a'),
        duration: body.duration || 60,
        clinicName: body.clinicName || 'Skin Societé',
        clinicAddress: body.clinicAddress,
        clinicPhone: body.clinicPhone,
        notes: notes,
        price: body.price
      };

      // Send emails asynchronously (don't wait for them)
      emailService.sendBookingConfirmation(emailData).catch(error => {
        console.error('Failed to send confirmation email:', error);
        // Don't throw - the booking was successful even if email fails
      });

      emailService.sendBookingNotificationToStaff(emailData).catch(error => {
        console.error('Failed to send staff notification:', error);
        // Don't throw - the booking was successful even if email fails
      });
    }

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
        emailSent: !!body.clientEmail,
        ...booking
      }
    });

  } catch (error: any) {
    // Log the error with context
    console.error('❌ Booking API error:', error);
    
    logError(error, { 
      endpoint: 'POST /api/appointments',
      error: error.message || 'Unknown error'
    });
    
    // Handle the error and get user-friendly response
    const apiError = handleApiError(error);
    
    // Customize error messages for specific booking scenarios
    if (error.message?.includes('STAFF_NOT_WORKING') || error.message?.includes('SLOT_UNAVAILABLE')) {
      apiError.message = 'The requested staff member is not rostered for the selected time. Please choose a different time when they are working.';
      apiError.status = 400;
    } else if (error.message?.includes('STAFF_DOUBLE_BOOKED')) {
      apiError.message = 'The requested time slot is already booked';
      apiError.status = 409;
    } else if (error.message?.includes('CLIENT_NOT_FOUND')) {
      apiError.message = 'Client not found. Please check the client details.';
      apiError.status = 404;
    } else if (error.message?.includes('SERVICE_NOT_FOUND')) {
      apiError.message = 'Service not found. Please check the service selection.';
      apiError.status = 404;
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: apiError.message,
        code: apiError.code,
        details: process.env.NODE_ENV === 'development' ? apiError.details : undefined
      },
      { status: apiError.status || 500 }
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