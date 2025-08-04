import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Import Phorest service (dynamic import for server-side)
    const { default: phorestService } = await import('../../../services/phorestService.js');

    // Sync user data from Phorest
    const syncResult = await phorestService.syncUserData(email, phone);

    if (!syncResult.found) {
      return NextResponse.json({
        success: false,
        message: 'No Phorest account found for this email/phone',
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User data synced successfully',
      data: {
        client: syncResult.client,
        appointments: syncResult.appointments,
        purchases: syncResult.purchases,
        loyaltyStatus: syncResult.loyaltyStatus,
        summary: syncResult.summary
      }
    });

  } catch (error) {
    console.error('User sync API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync user data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Import Phorest service (dynamic import for server-side)
    const { default: phorestService } = await import('../../../services/phorestService.js');

    // Sync user data from Phorest
    const syncResult = await phorestService.syncUserData(email, phone);

    if (!syncResult.found) {
      return NextResponse.json({
        success: false,
        message: 'No Phorest account found for this email/phone',
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User data synced successfully',
      data: {
        client: syncResult.client,
        appointments: syncResult.appointments,
        purchases: syncResult.purchases,
        loyaltyStatus: syncResult.loyaltyStatus,
        summary: syncResult.summary
      }
    });

  } catch (error) {
    console.error('User sync API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync user data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}