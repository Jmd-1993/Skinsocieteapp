import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/app/lib/notification-service';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const { token, platform } = await request.json();
    
    if (!token || !platform) {
      return NextResponse.json(
        { success: false, error: 'Token and platform are required' },
        { status: 400 }
      );
    }
    
    if (!['ios', 'android'].includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'Platform must be ios or android' },
        { status: 400 }
      );
    }
    
    // Get user ID from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });
    
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    await NotificationService.registerDeviceToken(dbUser.id, token, platform);
    
    return NextResponse.json({
      success: true,
      message: `${platform} token registered successfully`
    });
    
  } catch (error) {
    console.error('Register token API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register token' },
      { status: 500 }
    );
  }
}