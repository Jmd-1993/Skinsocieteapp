import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/app/lib/notification-service';
import { prisma } from '@/app/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { notificationPreferences: true }
    });
    
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const preferences = dbUser.notificationPreferences || {
      routineReminders: true,
      gamification: true,
      behavioralTriggers: true,
      personalizedContent: true,
      appointments: true,
      promotional: true,
      morningTime: "07:30",
      eveningTime: "21:00",
      timezone: "UTC",
      maxPerDay: 3,
      maxPerWeek: 15
    };
    
    return NextResponse.json({
      success: true,
      preferences
    });
    
  } catch (error) {
    console.error('Get preferences API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const preferences = await request.json();
    
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });
    
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    await NotificationService.updateUserPreferences(dbUser.id, preferences);
    
    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully'
    });
    
  } catch (error) {
    console.error('Update preferences API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}