import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/app/lib/notification-service';

export async function POST(request: NextRequest) {
  try {
    // This endpoint is for admin/testing purposes
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { target, payload, templateId, priority } = await request.json();
    
    const result = await NotificationService.sendNotification(
      target,
      payload,
      templateId,
      priority
    );
    
    return NextResponse.json({
      success: true,
      results: result,
      message: `Sent ${result.length} notifications`
    });
    
  } catch (error) {
    console.error('Send notification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}