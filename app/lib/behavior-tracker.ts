import { prisma } from './db';
import { NotificationService } from './notification-service';

export class BehaviorTracker {
  
  // Track user login
  static async trackLogin(userId: string, deviceType?: string) {
    const now = new Date();
    
    await prisma.userBehaviorTracking.upsert({
      where: { userId },
      create: {
        userId,
        lastLoginAt: now,
        deviceType,
        sessionsThisWeek: 1
      },
      update: {
        lastLoginAt: now,
        deviceType,
        sessionsThisWeek: { increment: 1 }
      }
    });
    
    // Check for re-engagement opportunity
    await this.checkReengagementTriggers(userId);
  }
  
  // Track routine completion
  static async trackRoutineCompletion(userId: string, routineType: 'morning' | 'evening') {
    const now = new Date();
    const field = `${routineType}RoutineStreak`;
    
    const behavior = await prisma.userBehaviorTracking.upsert({
      where: { userId },
      create: {
        userId,
        lastRoutineAt: now,
        [field]: 1,
        totalRoutinesCompleted: 1
      },
      update: {
        lastRoutineAt: now,
        [field]: { increment: 1 },
        totalRoutinesCompleted: { increment: 1 }
      }
    });
    
    // Check for gamification triggers
    await this.checkGamificationTriggers(userId, behavior);
  }
  
  // Track booking activity
  static async trackBooking(userId: string) {
    await prisma.userBehaviorTracking.upsert({
      where: { userId },
      create: {
        userId,
        lastBookingAt: new Date()
      },
      update: {
        lastBookingAt: new Date()
      }
    });
  }
  
  // Track purchase activity
  static async trackPurchase(userId: string, amount: number, categories: string[]) {
    await prisma.userBehaviorTracking.upsert({
      where: { userId },
      create: {
        userId,
        lastPurchaseAt: new Date(),
        preferredCategories: categories
      },
      update: {
        lastPurchaseAt: new Date(),
        preferredCategories: categories
      }
    });
    
    // Check for product recommendation opportunities
    await this.checkProductRecommendations(userId, categories);
  }
  
  // Track social post creation
  static async trackSocialPost(userId: string) {
    await prisma.userBehaviorTracking.upsert({
      where: { userId },
      create: {
        userId,
        lastPostAt: new Date()
      },
      update: {
        lastPostAt: new Date()
      }
    });
  }
  
  // Check for users who need routine reminders
  static async checkRoutineReminders() {
    const now = new Date();
    const morningTime = '07:30';
    const eveningTime = '21:00';
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Morning reminders
    if (currentTime === morningTime) {
      const users = await this.getUsersNeedingMorningReminder();
      for (const user of users) {
        await NotificationService.sendRoutineReminder('morning', [user.id]);
      }
    }
    
    // Evening reminders  
    if (currentTime === eveningTime) {
      const users = await this.getUsersNeedingEveningReminder();
      for (const user of users) {
        await NotificationService.sendRoutineReminder('evening', [user.id]);
      }
    }
  }
  
  // Check for users who need re-engagement
  static async checkReengagementOpportunities() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const inactiveUsers = await prisma.userBehaviorTracking.findMany({
      where: {
        lastLoginAt: { lt: threeDaysAgo },
        notificationOptOut: false
      },
      include: { user: true }
    });
    
    for (const behavior of inactiveUsers) {
      await NotificationService.sendBehavioralTrigger(
        'reengagement',
        behavior.userId,
        { daysSinceLastLogin: Math.floor((Date.now() - behavior.lastLoginAt!.getTime()) / (24 * 60 * 60 * 1000)) }
      );
    }
  }
  
  // Check for booking reminders
  static async checkBookingReminders() {
    const sixWeeksAgo = new Date(Date.now() - 6 * 7 * 24 * 60 * 60 * 1000);
    
    const usersNeedingBooking = await prisma.userBehaviorTracking.findMany({
      where: {
        OR: [
          { lastBookingAt: { lt: sixWeeksAgo } },
          { lastBookingAt: null }
        ],
        notificationOptOut: false
      },
      include: { user: true }
    });
    
    for (const behavior of usersNeedingBooking) {
      await NotificationService.sendBehavioralTrigger(
        'booking_reminder',
        behavior.userId,
        {}
      );
    }
  }
  
  // Analyze user preferences and send personalized content
  static async sendPersonalizedTips() {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        behaviorTracking: true,
        notificationPreferences: true
      },
      where: {
        behaviorTracking: {
          notificationOptOut: false
        }
      }
    });
    
    for (const user of users) {
      if (!user.profile || !user.notificationPreferences?.personalizedContent) continue;
      
      const skinConcerns = user.profile.skinConcerns;
      if (skinConcerns.length > 0) {
        const randomConcern = skinConcerns[Math.floor(Math.random() * skinConcerns.length)];
        
        await NotificationService.sendPersonalizedContent(
          'skin_tip',
          { userId: user.id },
          {
            skinConcern: randomConcern,
            tip: this.getTipForConcern(randomConcern),
            tipId: 'tip-' + randomConcern.toLowerCase()
          }
        );
      }
    }
  }
  
  // Private helper methods
  private static async checkReengagementTriggers(userId: string) {
    const behavior = await prisma.userBehaviorTracking.findUnique({
      where: { userId }
    });
    
    if (behavior?.lastLoginAt) {
      const daysSinceLastLogin = Math.floor(
        (Date.now() - behavior.lastLoginAt.getTime()) / (24 * 60 * 60 * 1000)
      );
      
      if (daysSinceLastLogin >= 7) {
        await NotificationService.sendBehavioralTrigger(
          'reengagement',
          userId,
          { daysSinceLastLogin }
        );
      }
    }
  }
  
  private static async checkGamificationTriggers(userId: string, behavior: any) {
    // Check for streak milestones
    if (behavior.morningRoutineStreak === 7 || behavior.eveningRoutineStreak === 7) {
      await NotificationService.sendGamificationNotification(
        'milestone',
        userId,
        {
          milestone: '7-day streak',
          remaining: 100 // points to next reward
        }
      );
    }
    
    // Check for tier upgrades (simplified logic)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { include: { loyaltyTier: true } } }
    });
    
    if (user?.profile) {
      const totalPoints = user.profile.totalPoints;
      let newTier = '';
      
      if (totalPoints >= 2000 && user.profile.loyaltyTier?.name !== 'VIP Goddess') {
        newTier = 'VIP Goddess';
      } else if (totalPoints >= 1000 && user.profile.loyaltyTier?.name !== 'Skincare Guru') {
        newTier = 'Skincare Guru';
      } else if (totalPoints >= 500 && user.profile.loyaltyTier?.name !== 'Beauty Enthusiast') {
        newTier = 'Beauty Enthusiast';
      }
      
      if (newTier) {
        await NotificationService.sendGamificationNotification(
          'tier_upgrade',
          userId,
          { newTier }
        );
      }
    }
  }
  
  private static async checkProductRecommendations(userId: string, categories: string[]) {
    // Simplified product recommendation logic
    const products = await prisma.product.findMany({
      where: {
        category: {
          name: { in: categories }
        },
        featured: true
      },
      take: 1
    });
    
    if (products.length > 0) {
      const product = products[0];
      await NotificationService.sendBehavioralTrigger(
        'product_recommendation',
        userId,
        {
          productId: product.id,
          productName: product.name,
          productImage: product.featuredImage,
          skinType: 'your skin type' // Would get from user profile
        }
      );
    }
  }
  
  private static async getUsersNeedingMorningReminder() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    return prisma.user.findMany({
      where: {
        notificationPreferences: {
          routineReminders: true
        },
        behaviorTracking: {
          OR: [
            { lastRoutineAt: { lt: todayStart } },
            { lastRoutineAt: null }
          ]
        }
      }
    });
  }
  
  private static async getUsersNeedingEveningReminder() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    return prisma.user.findMany({
      where: {
        notificationPreferences: {
          routineReminders: true
        },
        behaviorTracking: {
          OR: [
            { lastRoutineAt: { lt: todayStart } },
            { lastRoutineAt: null }
          ]
        }
      }
    });
  }
  
  private static getTipForConcern(concern: string): string {
    const tips: Record<string, string> = {
      acne: "Gentle cleansing twice daily with salicylic acid can help reduce breakouts",
      dryness: "Layer a hydrating serum under your moisturizer for extra hydration",
      aging: "Retinol at night and vitamin C in the morning are anti-aging powerhouses",
      sensitivity: "Look for fragrance-free products with ceramides and niacinamide",
      hyperpigmentation: "Consistent sunscreen use prevents dark spots from getting worse"
    };
    
    return tips[concern.toLowerCase()] || "Consistency is key to seeing results in your skincare routine";
  }
}