import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Direct Phorest API integration without service class to avoid TDZ issues
const PHOREST_CONFIG = {
  baseURL: 'https://platform-us.phorest.com/third-party-api-server/api/business',
  businessId: 'IX2it2QrF0iguR-LpZ6BHQ',
  auth: {
    username: 'global/josh@skinsociete.com.au',
    password: 'ROW^pDL%kxSq'
  }
};

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
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Simple booking endpoint called');
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

    console.log(`🎯 Creating booking for client ${clientId}`);
    console.log(`📅 Service: ${serviceId}, Staff: ${staffId}, Time: ${startTime}`);

    // Create axios instance for direct Phorest API calls
    const phorestApi = axios.create({
      baseURL: PHOREST_CONFIG.baseURL,
      auth: PHOREST_CONFIG.auth,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Get the first branch (Cottesloe) for testing
    console.log('🏢 Getting branches...');
    const branchesResponse = await phorestApi.get(`/${PHOREST_CONFIG.businessId}/branch`);
    const branches = branchesResponse.data._embedded?.branches || [];
    const cottesloeBranch = branches.find(b => b.name.includes('Cottesloe')) || branches[0];
    
    if (!cottesloeBranch) {
      throw new Error('No branch found');
    }

    console.log(`✅ Using branch: ${cottesloeBranch.name} (${cottesloeBranch.branchId})`);

    // Create booking payload
    const bookingPayload = {
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

    console.log('📋 Booking payload:', JSON.stringify(bookingPayload, null, 2));

    // Attempt to create the booking
    try {
      const bookingResponse = await phorestApi.post(
        `/${PHOREST_CONFIG.businessId}/branch/${cottesloeBranch.branchId}/booking`, 
        bookingPayload
      );
      
      console.log('🎉 Booking successful!');
      
      return NextResponse.json({
        success: true,
        message: 'Appointment booked successfully',
        booking: {
          id: bookingResponse.data.id || bookingResponse.data.appointmentId || 'generated-id',
          clientId,
          serviceId,
          staffId,
          startTime,
          status: 'confirmed',
          branchId: cottesloeBranch.branchId,
          branchName: cottesloeBranch.name,
          emailSent: false,
          phorestResponse: bookingResponse.data
        }
      });
      
    } catch (bookingError: any) {
      console.log('📝 Booking failed (business rule validation):');
      
      if (bookingError.response) {
        const errorData = bookingError.response.data;
        console.log(`   Status: ${bookingError.response.status}`);
        console.log(`   Error: ${JSON.stringify(errorData, null, 2)}`);
        
        // Return a user-friendly booking error
        let userMessage = 'Booking could not be completed';
        
        if (errorData.detail === 'STAFF_NOT_WORKING') {
          userMessage = 'The selected staff member is not available at this time. Please choose a different time slot.';
        } else if (errorData.detail === 'SLOT_UNAVAILABLE') {
          userMessage = 'This time slot is no longer available. Please select a different time.';
        } else if (errorData.detail?.includes('DEPOSIT')) {
          userMessage = 'This service requires a deposit. Please contact the clinic to complete your booking.';
        }
        
        return NextResponse.json({
          success: false,
          error: userMessage,
          code: 'BOOKING_VALIDATION_FAILED',
          details: {
            phorestError: errorData.detail,
            errorCode: errorData.errorCode
          }
        }, { status: 400 });
      }
      
      throw bookingError; // Re-throw unexpected errors
    }

  } catch (error: any) {
    console.error('❌ Simple booking API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}