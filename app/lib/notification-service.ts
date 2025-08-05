import { messaging } from './firebase-admin';
import { prisma } from './db';
import { currentUser } from '@clerk/nextjs/server';

export interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  deepLink?: string;
  actionButtons?: Array<{
    text: string;
    action: string;
    deepLink?: string;
  }>;
  data?: Record<string, string>;
}

export interface NotificationTarget {
  userId?: string;
  userIds?: string[];
  tiers?: string[];
  skinTypes?: string[];
  skinConcerns?: string[];
  lastActiveWithin?: number; // hours
  hasNotCompletedRoutineToday?: boolean;
}

export class NotificationService {
  
  // Send notification to specific user(s)
  static async sendNotification(
    target: NotificationTarget,
    payload: NotificationPayload,
    templateId?: string,
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
  ) {
    try {
      const users = await this.getTargetUsers(target);
      const results = [];
      
      for (const user of users) {
        const preferences = await this.getUserPreferences(user.id);
        
        // Check if user has opted out or is in quiet hours
        if (!this.canSendNotification(user, preferences, priority)) {
          continue;
        }
        
        // Send to all user's devices
        for (const token of [...preferences.fcmTokens, ...preferences.apnsTokens]) {
          const platform = preferences.fcmTokens.includes(token) ? 'android' : 'ios';
          
          try {
            const message = this.buildMessage(token, payload, platform);
            const response = await messaging.send(message);
            
            // Log sent notification
            await this.logSentNotification({
              userId: user.id,
              templateId: templateId || 'manual',
              title: payload.title,
              body: payload.body,
              imageUrl: payload.imageUrl,
              deepLink: payload.deepLink,
              platform,
              deviceToken: token,
              delivered: true,
            });
            
            results.push({ userId: user.id, token, success: true, messageId: response });
          } catch (error) {
            console.error(`Failed to send notification to ${user.id}:`, error);
            results.push({ userId: user.id, token, success: false, error: error.message });
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  }
  
  // Routine reminder notifications
  static async sendRoutineReminder(
    type: 'morning' | 'evening',
    userIds?: string[]
  ) {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); // HH:MM
    
    const target: NotificationTarget = userIds ? { userIds } : {
      hasNotCompletedRoutineToday: true
    };
    
    const templates = {
      morning: {
        title: "Good morning! ☀️",
        body: "Ready to start your day with glowing skin? Don't forget your morning routine!",
        deepLink: "app://routine/morning",
        actionButtons: [
          { text: "Complete Routine", action: "complete_routine", deepLink: "app://routine/morning" },
          { text: "Skip Today", action: "skip_routine" }
        ]
      },
      evening: {
        title: "Time for your evening routine! 🌙",
        body: "End your day right with your skincare ritual. Your skin will thank you!",
        deepLink: "app://routine/evening",
        actionButtons: [
          { text: "Complete Routine", action: "complete_routine", deepLink: "app://routine/evening" },
          { text: "Remind Later", action: "remind_later" }
        ]
      }
    };
    
    return this.sendNotification(target, templates[type], `routine_${type}`, 'NORMAL');
  }
  
  // Gamification notifications
  static async sendGamificationNotification(
    type: 'challenge_available' | 'streak_protection' | 'milestone' | 'tier_upgrade',
    userId: string,
    data: any
  ) {
    const templates = {
      challenge_available: {
        title: "New Challenge: Hydration Hero! 💧",
        body: "Complete your moisturizing routine for 7 days. Reward: 300 points + free consultation",
        deepLink: `app://challenges/${data.challengeId}`,
        actionButtons: [
          { text: "Join Challenge", action: "join_challenge", deepLink: `app://challenges/${data.challengeId}` },
          { text: "View Details", action: "view_challenge" }
        ]
      },
      streak_protection: {
        title: `Your ${data.streakDays}-day streak is at risk! ⚠️`,
        body: "You haven't logged your routine yet. Keep that momentum going!",
        deepLink: "app://routine",
        actionButtons: [
          { text: "Log Routine", action: "log_routine", deepLink: "app://routine" },
          { text: "Remind Later", action: "remind_later" }
        ]
      },
      milestone: {
        title: "Achievement Unlocked! 🎉",
        body: `You've reached ${data.milestone}! You're ${data.remaining} points away from your next reward.`,
        deepLink: "app://rewards",
        actionButtons: [
          { text: "View Rewards", action: "view_rewards", deepLink: "app://rewards" },
          { text: "Keep Going", action: "continue" }
        ]
      },
      tier_upgrade: {
        title: "Congratulations! 👑",
        body: `You've reached ${data.newTier} status! Enjoy your new perks and exclusive benefits.`,
        deepLink: "app://profile/tier",
        actionButtons: [
          { text: "View Perks", action: "view_perks", deepLink: "app://profile/tier" },
          { text: "Share Achievement", action: "share_achievement" }
        ]
      }
    };
    
    return this.sendNotification(
      { userId },
      templates[type],
      `gamification_${type}`,
      'HIGH'
    );
  }
  
  // Behavioral trigger notifications
  static async sendBehavioralTrigger(
    type: 'reengagement' | 'booking_reminder' | 'product_recommendation',
    userId: string,
    data: any
  ) {
    const templates = {
      reengagement: {
        title: "We miss you! 💚",
        body: "Your skin misses its routine too. Come back and continue your glow journey!",
        deepLink: "app://routine",
        actionButtons: [
          { text: "Continue Journey", action: "open_app", deepLink: "app://routine" },
          { text: "Update Preferences", action: "preferences" }
        ]
      },
      booking_reminder: {
        title: "Time for your next glow-up session? ✨",
        body: "It's been 6 weeks since your last appointment. Book now for optimal results!",
        deepLink: "app://appointments/book",
        actionButtons: [
          { text: "Book Now", action: "book_appointment", deepLink: "app://appointments/book" },
          { text: "View Services", action: "view_services" }
        ]
      },
      product_recommendation: {
        title: "Perfect for your routine! 🎯",
        body: `Based on your ${data.skinType} skin, we think you'd love ${data.productName}`,
        deepLink: `app://products/${data.productId}`,
        imageUrl: data.productImage,
        actionButtons: [
          { text: "View Product", action: "view_product", deepLink: `app://products/${data.productId}` },
          { text: "Add to Cart", action: "add_to_cart" }
        ]
      }
    };
    
    return this.sendNotification(
      { userId },
      templates[type],
      `behavioral_${type}`,
      'NORMAL'
    );
  }
  
  // Personalized content notifications
  static async sendPersonalizedContent(
    type: 'skin_tip' | 'weather_advice' | 'seasonal_advice',
    target: NotificationTarget,
    data: any
  ) {
    const templates = {
      skin_tip: {
        title: `Managing ${data.skinConcern}? 💡`,
        body: `Here's today's expert tip: ${data.tip}`,
        deepLink: `app://tips/${data.tipId}`,
        actionButtons: [
          { text: "Read More", action: "read_tip", deepLink: `app://tips/${data.tipId}` },
          { text: "Save Tip", action: "save_tip" }
        ]
      },
      weather_advice: {
        title: "Weather Alert! ☀️",
        body: `UV index is ${data.uvIndex} today - don't forget SPF! Your skin will thank you.`,
        deepLink: "app://products/sunscreen",
        actionButtons: [
          { text: "Shop SPF", action: "shop_spf", deepLink: "app://products/sunscreen" },
          { text: "Set Reminder", action: "set_reminder" }
        ]
      },
      seasonal_advice: {
        title: `${data.season} Skincare Tips 🍂`,
        body: `${data.season} is here! Time to switch to ${data.recommendation}`,
        deepLink: "app://seasonal-guide",
        actionButtons: [
          { text: "View Guide", action: "view_guide", deepLink: "app://seasonal-guide" },
          { text: "Update Routine", action: "update_routine" }
        ]
      }
    };
    
    return this.sendNotification(
      target,
      templates[type],
      `personalized_${type}`,
      'NORMAL'
    );
  }
  
  // Appointment notifications
  static async sendAppointmentNotification(
    type: 'reminder' | 'post_care',
    userId: string,
    appointmentData: any
  ) {
    const templates = {
      reminder: {
        title: "Appointment Reminder 📅",
        body: `Your ${appointmentData.serviceName} appointment is tomorrow at ${appointmentData.time}`,
        deepLink: `app://appointments/${appointmentData.id}`,
        actionButtons: [
          { text: "View Details", action: "view_appointment", deepLink: `app://appointments/${appointmentData.id}` },
          { text: "Reschedule", action: "reschedule" }
        ]
      },
      post_care: {
        title: "Post-Treatment Care 💆‍♀️",
        body: "Follow these care instructions for optimal results from your recent treatment",
        deepLink: `app://aftercare/${appointmentData.serviceId}`,
        actionButtons: [
          { text: "View Instructions", action: "view_aftercare", deepLink: `app://aftercare/${appointmentData.serviceId}` },
          { text: "Set Reminders", action: "set_aftercare_reminders" }
        ]
      }
    };
    
    return this.sendNotification(
      { userId },
      templates[type],
      `appointment_${type}`,
      'HIGH'
    );
  }
  
  // User preference management
  static async updateUserPreferences(userId: string, preferences: any) {
    return prisma.userNotificationPreferences.upsert({
      where: { userId },
      create: { userId, ...preferences },
      update: preferences
    });
  }
  
  static async registerDeviceToken(userId: string, token: string, platform: 'ios' | 'android') {
    const preferences = await this.getUserPreferences(userId);
    
    const field = platform === 'ios' ? 'apnsTokens' : 'fcmTokens';
    const currentTokens = preferences[field] || [];
    
    if (!currentTokens.includes(token)) {
      const updatedTokens = [...currentTokens, token];
      
      await prisma.userNotificationPreferences.upsert({
        where: { userId },
        create: {
          userId,
          [field]: updatedTokens
        },
        update: {
          [field]: updatedTokens
        }
      });
    }
  }
  
  // Analytics and tracking
  static async trackNotificationOpen(notificationId: string, actionTaken?: string) {
    await prisma.sentNotification.update({
      where: { id: notificationId },
      data: {
        opened: true,
        actionTaken,
      }
    });
    
    // Update user behavior score
    const notification = await prisma.sentNotification.findUnique({
      where: { id: notificationId },
      include: { user: true }
    });
    
    if (notification) {
      await this.updateUserBehaviorScore(notification.userId, 'notification_opened');
    }
  }
  
  // Private helper methods
  private static async getTargetUsers(target: NotificationTarget) {
    const where: any = {};
    
    if (target.userId) {
      where.id = target.userId;
    } else if (target.userIds) {
      where.id = { in: target.userIds };
    }
    
    if (target.tiers) {
      where.profile = {
        loyaltyTier: { name: { in: target.tiers } }
      };
    }
    
    if (target.skinTypes) {
      where.profile = {
        ...where.profile,
        skinType: { in: target.skinTypes }
      };
    }
    
    if (target.lastActiveWithin) {
      const cutoff = new Date(Date.now() - target.lastActiveWithin * 60 * 60 * 1000);
      where.behaviorTracking = {
        lastLoginAt: { gte: cutoff }
      };
    }
    
    return prisma.user.findMany({
      where,
      include: {
        profile: { include: { loyaltyTier: true } },
        behaviorTracking: true
      }
    });
  }
  
  private static async getUserPreferences(userId: string) {
    return prisma.userNotificationPreferences.findUnique({
      where: { userId }
    }) || {
      userId,
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
      maxPerWeek: 15,
      fcmTokens: [],
      apnsTokens: []
    };
  }
  
  private static canSendNotification(user: any, preferences: any, priority: string): boolean {
    const now = new Date();
    
    // Check quiet hours
    if (preferences.quietHoursStart && preferences.quietHoursEnd && priority !== 'URGENT') {
      const currentTime = now.toTimeString().slice(0, 5);
      if (currentTime >= preferences.quietHoursStart && currentTime <= preferences.quietHoursEnd) {
        return false;
      }
    }
    
    // Check daily/weekly limits (unless urgent)
    if (priority !== 'URGENT') {
      // This would check sent notifications count for today/week
      // Simplified for demo
    }
    
    // Check if user has opted out of notifications
    if (user.behaviorTracking?.notificationOptOut) {
      return priority === 'URGENT';
    }
    
    return true;
  }
  
  private static buildMessage(token: string, payload: NotificationPayload, platform: string) {
    const message: any = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl })
      },
      data: {
        deepLink: payload.deepLink || '',
        ...payload.data
      }
    };
    
    if (platform === 'android') {
      message.android = {
        priority: 'high',
        notification: {
          channelId: 'skincare_reminders',
          color: '#E91E63', // Pink brand color
          ...(payload.actionButtons && {
            actions: payload.actionButtons.map(button => ({
              action: button.action,
              title: button.text
            }))
          })
        }
      };
    } else if (platform === 'ios') {
      message.apns = {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
            'mutable-content': 1
          }
        }
      };
    }
    
    return message;
  }
  
  private static async logSentNotification(data: any) {
    return prisma.sentNotification.create({ data });
  }
  
  private static async updateUserBehaviorScore(userId: string, action: string) {
    const behavior = await prisma.userBehaviorTracking.findUnique({
      where: { userId }
    });
    
    if (behavior) {
      let newScore = behavior.avgNotificationResponse;
      
      switch (action) {
        case 'notification_opened':
          newScore = Math.min(1, newScore + 0.1);
          break;
        case 'notification_ignored':
          newScore = Math.max(0, newScore - 0.05);
          break;
      }
      
      await prisma.userBehaviorTracking.update({
        where: { userId },
        data: { avgNotificationResponse: newScore }
      });
    }
  }
}