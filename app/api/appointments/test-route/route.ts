import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation
    if (!body.clientId || !body.serviceId || !body.staffId || !body.startTime) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'clientId, serviceId, staffId, and startTime are required'
        },
        { status: 400 }
      );
    }

    console.log('📝 Test booking received:', {
      clientId: body.clientId,
      serviceId: body.serviceId,
      staffId: body.staffId,
      startTime: body.startTime
    });

    // Simulate successful booking without calling external APIs
    const mockBooking = {
      id: `booking-${Date.now()}`,
      clientId: body.clientId,
      serviceId: body.serviceId,
      staffId: body.staffId,
      startTime: body.startTime,
      status: 'confirmed',
      notes: body.notes || '',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Test booking created successfully',
      booking: mockBooking
    });

  } catch (error) {
    console.error('Test booking error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Test booking failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}