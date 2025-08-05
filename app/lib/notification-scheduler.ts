import cron from 'node-cron';
import { BehaviorTracker } from './behavior-tracker';
import { NotificationService } from './notification-service';
import { prisma } from './db';

export class NotificationScheduler {
  private static isRunning = false;
  
  // Start all scheduled notification jobs
  static start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('🔔 Starting notification scheduler...');
    
    // Routine reminders - check every minute
    cron.schedule('* * * * *', async () => {
      try {
        await BehaviorTracker.checkRoutineReminders();
      } catch (error) {
        console.error('Routine reminder check failed:', error);
      }
    });
    
    // Re-engagement check - daily at 10 AM
    cron.schedule('0 10 * * *', async () => {
      try {
        await BehaviorTracker.checkReengagementOpportunities();
      } catch (error) {
        console.error('Re-engagement check failed:', error);
      }
    });
    
    // Booking reminders - weekly on Mondays at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      try {
        await BehaviorTracker.checkBookingReminders();
      } catch (error) {
        console.error('Booking reminder check failed:', error);
      }
    });
    
    // Personalized tips - daily at 2 PM
    cron.schedule('0 14 * * *', async () => {
      try {
        await BehaviorTracker.sendPersonalizedTips();
      } catch (error) {
        console.error('Personalized tips failed:', error);
      }
    });
    
    // Weather-based notifications - daily at 8 AM
    cron.schedule('0 8 * * *', async () => {
      try {
        await this.sendWeatherBasedNotifications();
      } catch (error) {
        console.error('Weather notifications failed:', error);
      }
    });
    
    // Challenge notifications - daily at 11 AM
    cron.schedule('0 11 * * *', async () => {
      try {
        await this.sendChallengeNotifications();
      } catch (error) {
        console.error('Challenge notifications failed:', error);
      }
    });
    
    // Streak protection - every 2 hours from 6 PM to 10 PM
    cron.schedule('0 18,20,22 * * *', async () => {
      try {
        await this.sendStreakProtectionNotifications();
      } catch (error) {
        console.error('Streak protection failed:', error);
      }
    });
    
    // Process scheduled notifications - every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await this.processScheduledNotifications();
      } catch (error) {
        console.error('Scheduled notifications processing failed:', error);
      }
    });
    
    // Cleanup old notifications - daily at midnight
    cron.schedule('0 0 * * *', async () => {
      try {
        await this.cleanupOldNotifications();
      } catch (error) {
        console.error('Notification cleanup failed:', error);
      }
    });
    
    console.log('✅ Notification scheduler started successfully');
  }
  
  // Stop all scheduled jobs
  static stop() {
    this.isRunning = false;
    cron.getTasks().forEach(task => task.stop());
    console.log('🛑 Notification scheduler stopped');
  }
  
  // Schedule a one-time notification
  static async scheduleNotification(
    userId: string,
    templateId: string,
    scheduledFor: Date,
    personalizedContent?: any
  ) {
    return prisma.notificationSchedule.create({
      data: {
        userId,
        templateId,
        scheduledFor,
        timeZone: 'UTC', // Would get from user preferences
        personalizedContent,
        status: 'PENDING'
      }
    });
  }
  
  // Weather-based notifications
  private static async sendWeatherBasedNotifications() {
    // In a real app, you'd integrate with a weather API
    const users = await prisma.user.findMany({
      where: {
        notificationPreferences: {
          personalizedContent: true
        }
      },
      include: {
        profile: true,
        notificationPreferences: true
      }
    });
    
    // Simulate high UV day
    const isHighUVDay = Math.random() > 0.7;
    
    if (isHighUVDay) {
      for (const user of users) {
        await NotificationService.sendPersonalizedContent(
          'weather_advice',
          { userId: user.id },
          {
            uvIndex: '8',
            location: 'your area'
          }
        );
      }
    }
  }
  
  // Challenge notifications
  private static async sendChallengeNotifications() {
    const activeChallenges = await prisma.challenge.findMany({
      where: {
        active: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      }
    });
    
    for (const challenge of activeChallenges) {
      // Find users who haven't joined this challenge
      const eligibleUsers = await prisma.user.findMany({
        where: {
          userChallenges: {
            none: {
              challengeId: challenge.id
            }
          },
          notificationPreferences: {
            gamification: true
          }
        },
        take: 50 // Limit to prevent spam
      });
      
      for (const user of eligibleUsers) {
        await NotificationService.sendGamificationNotification(
          'challenge_available',
          user.id,
          {
            challengeId: challenge.id,
            challengeName: challenge.title,
            challengeReward: `${challenge.points} points`
          }
        );
      }
    }
  }
  
  // Streak protection notifications
  private static async sendStreakProtectionNotifications() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usersWithStreaks = await prisma.userBehaviorTracking.findMany({
      where: {
        OR: [
          { morningRoutineStreak: { gte: 3 } },
          { eveningRoutineStreak: { gte: 3 } }
        ],
        lastRoutineAt: { lt: today }, // Haven't completed routine today
        notificationOptOut: false
      },
      include: { user: true }
    });
    
    for (const behavior of usersWithStreaks) {
      const maxStreak = Math.max(behavior.morningRoutineStreak, behavior.eveningRoutineStreak);
      
      await NotificationService.sendGamificationNotification(
        'streak_protection',
        behavior.userId,
        {
          streakDays: maxStreak
        }
      );
    }
  }
  
  // Process scheduled notifications
  private static async processScheduledNotifications() {
    const now = new Date();
    
    const pendingNotifications = await prisma.notificationSchedule.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: now }
      },
      include: {
        user: true,
        template: true
      },
      take: 100 // Process in batches
    });
    
    for (const scheduled of pendingNotifications) {
      try {
        // Personalize the notification content
        const personalizedPayload = await this.personalizeNotification(
          scheduled.template,
          scheduled.user,
          scheduled.personalizedContent
        );
        
        // Send the notification
        await NotificationService.sendNotification(
          { userId: scheduled.userId },
          personalizedPayload,
          scheduled.templateId,
          scheduled.template.priority as any
        );
        
        // Mark as sent
        await prisma.notificationSchedule.update({
          where: { id: scheduled.id },
          data: {
            status: 'SENT',
            lastAttemptAt: now
          }
        });
        
      } catch (error) {
        console.error(`Failed to send scheduled notification ${scheduled.id}:`, error);
        
        // Update attempt count and status
        await prisma.notificationSchedule.update({
          where: { id: scheduled.id },
          data: {
            attemptCount: { increment: 1 },
            lastAttemptAt: now,
            errorMessage: error.message,
            status: scheduled.attemptCount >= 3 ? 'FAILED' : 'PENDING'
          }
        });
      }
    }
  }
  
  // Personalize notification content based on user data
  private static async personalizeNotification(template: any, user: any, personalizedData: any) {
    let title = template.title;
    let body = template.body;
    
    // Replace placeholders with user data
    const firstName = user.profile?.firstName || 'there';
    
    title = title.replace(/\{firstName\}/g, firstName);
    body = body.replace(/\{firstName\}/g, firstName);
    
    // Add personalized data
    if (personalizedData) {
      Object.keys(personalizedData).forEach(key => {
        const placeholder = `{${key}}`;
        title = title.replace(new RegExp(placeholder, 'g'), personalizedData[key]);
        body = body.replace(new RegExp(placeholder, 'g'), personalizedData[key]);
      });
    }
    
    return {
      title,
      body,
      imageUrl: template.imageUrl,
      deepLink: template.deepLink,
      actionButtons: template.actionButtons
    };
  }
  
  // Cleanup old notifications (keep last 30 days)
  private static async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Delete old sent notifications
    await prisma.sentNotification.deleteMany({
      where: {
        sentAt: { lt: thirtyDaysAgo }
      }
    });
    
    // Delete old completed schedules
    await prisma.notificationSchedule.deleteMany({
      where: {
        status: { in: ['SENT', 'FAILED', 'CANCELLED'] },
        createdAt: { lt: thirtyDaysAgo }
      }
    });
    
    console.log('🧹 Cleaned up old notifications');
  }
}

// Auto-start scheduler in production
if (process.env.NODE_ENV === 'production') {
  NotificationScheduler.start();
}