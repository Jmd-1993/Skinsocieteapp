import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/app/lib/notification-service';

export async function POST(request: NextRequest) {
  try {
    const { notificationId, action } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    await NotificationService.trackNotificationOpen(notificationId, action);
    
    return NextResponse.json({
      success: true,
      message: 'Notification interaction tracked'
    });
    
  } catch (error) {
    console.error('Track notification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track notification' },
      { status: 500 }
    );
  }
}