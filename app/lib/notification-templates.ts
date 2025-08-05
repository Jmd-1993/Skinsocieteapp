import { prisma } from './db';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'ROUTINE_REMINDER' | 'GAMIFICATION' | 'BEHAVIORAL_TRIGGER' | 'PERSONALIZED_CONTENT' | 'APPOINTMENT' | 'PROMOTIONAL';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  title: string;
  body: string;
  deepLink?: string;
  actionButtons?: Array<{
    text: string;
    action: string;
    deepLink?: string;
  }>;
  metadata?: Record<string, any>;
  conditions?: Record<string, any>;
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // ROUTINE REMINDERS
  {
    id: 'morning_routine_basic',
    name: 'Morning Routine - Basic',
    type: 'ROUTINE_REMINDER',
    priority: 'NORMAL',
    title: 'Good morning! ☀️',
    body: "Ready to start your day with glowing skin? Don't forget your morning routine!",
    deepLink: 'app://routine/morning',
    actionButtons: [
      { text: 'Complete Routine', action: 'complete_routine', deepLink: 'app://routine/morning' },
      { text: 'Skip Today', action: 'skip_routine' }
    ]
  },
  {
    id: 'evening_routine_basic',
    name: 'Evening Routine - Basic',
    type: 'ROUTINE_REMINDER',
    priority: 'NORMAL',
    title: 'Time to unwind 🌙',
    body: 'End your day right with your evening skincare routine. Your skin will thank you!',
    deepLink: 'app://routine/evening',
    actionButtons: [
      { text: 'Start Routine', action: 'complete_routine', deepLink: 'app://routine/evening' },
      { text: 'Skip Tonight', action: 'skip_routine' }
    ]
  },
  {
    id: 'weekend_treatment',
    name: 'Weekend Treatment Reminder',
    type: 'ROUTINE_REMINDER',
    priority: 'NORMAL',
    title: 'Weekend self-care time! 🧖‍♀️',
    body: "It's the perfect day for a face mask or special treatment. Treat yourself!",
    deepLink: 'app://treatments',
    actionButtons: [
      { text: 'Browse Treatments', action: 'view_treatments', deepLink: 'app://treatments' },
      { text: 'Maybe Later', action: 'snooze' }
    ]
  },

  // GAMIFICATION
  {
    id: 'streak_celebration',
    name: 'Streak Celebration',
    type: 'GAMIFICATION',
    priority: 'HIGH',
    title: '🔥 Amazing streak!',
    body: "You've completed your routine {streak_days} days in a row! Keep it up, beauty!",
    deepLink: 'app://profile/achievements',
    actionButtons: [
      { text: 'View Achievements', action: 'view_achievements', deepLink: 'app://profile/achievements' },
      { text: 'Share Progress', action: 'share_streak' }
    ],
    conditions: { streak_milestone: true }
  },
  {
    id: 'level_up',
    name: 'Level Up Achievement',
    type: 'GAMIFICATION',
    priority: 'HIGH',
    title: '🎉 Level up!',
    body: "Congratulations! You've reached {tier_name} status. New perks await!",
    deepLink: 'app://profile/tier-benefits',
    actionButtons: [
      { text: 'See Benefits', action: 'view_benefits', deepLink: 'app://profile/tier-benefits' },
      { text: 'Share Achievement', action: 'share_achievement' }
    ],
    conditions: { tier_upgrade: true }
  },
  {
    id: 'challenge_complete',
    name: 'Challenge Completion',
    type: 'GAMIFICATION',
    priority: 'HIGH',
    title: '✨ Challenge conquered!',
    body: "You've completed the {challenge_name} challenge! Claim your reward.",
    deepLink: 'app://challenges/rewards',
    actionButtons: [
      { text: 'Claim Reward', action: 'claim_reward', deepLink: 'app://challenges/rewards' },
      { text: 'Next Challenge', action: 'view_challenges', deepLink: 'app://challenges' }
    ],
    conditions: { challenge_completed: true }
  },

  // BEHAVIORAL TRIGGERS
  {
    id: 'comeback_gentle',
    name: 'Gentle Re-engagement',
    type: 'BEHAVIORAL_TRIGGER',
    priority: 'NORMAL',
    title: 'We miss you! 💕',
    body: "It's been a few days since your last routine. Your skin is waiting for some love!",
    deepLink: 'app://routine',
    actionButtons: [
      { text: 'Resume Routine', action: 'start_routine', deepLink: 'app://routine' },
      { text: 'Customize Settings', action: 'settings', deepLink: 'app://settings' }
    ],
    conditions: { days_inactive: 3 }
  },
  {
    id: 'appointment_follow_up',
    name: 'Post-Appointment Follow-up',
    type: 'BEHAVIORAL_TRIGGER',
    priority: 'NORMAL',
    title: 'How was your treatment? ✨',
    body: "We'd love to hear about your recent visit! Share your experience and get aftercare tips.",
    deepLink: 'app://feedback',
    actionButtons: [
      { text: 'Leave Review', action: 'leave_review', deepLink: 'app://feedback' },
      { text: 'Aftercare Tips', action: 'aftercare', deepLink: 'app://aftercare' }
    ],
    conditions: { appointment_completed: true }
  },
  {
    id: 'booking_reminder',
    name: 'Booking Reminder',
    type: 'BEHAVIORAL_TRIGGER',
    priority: 'NORMAL',
    title: "Time for your next appointment? 📅",
    body: "It's been {weeks_since_last} weeks since your last visit. Ready to book your next treatment?",
    deepLink: 'app://booking',
    actionButtons: [
      { text: 'Book Now', action: 'book_appointment', deepLink: 'app://booking' },
      { text: 'Remind Me Later', action: 'snooze_booking' }
    ],
    conditions: { weeks_since_appointment: 6 }
  },

  // PERSONALIZED CONTENT
  {
    id: 'weather_skincare',
    name: 'Weather-Based Skincare',
    type: 'PERSONALIZED_CONTENT',
    priority: 'NORMAL',
    title: '{weather_condition} weather alert! 🌤️',
    body: "Today's {weather_condition} weather calls for extra {skin_advice}. Adjust your routine accordingly!",
    deepLink: 'app://tips/weather',
    actionButtons: [
      { text: 'See Tips', action: 'view_tips', deepLink: 'app://tips/weather' },
      { text: 'Update Routine', action: 'customize_routine', deepLink: 'app://routine/customize' }
    ]
  },
  {
    id: 'ingredient_spotlight',
    name: 'Ingredient Spotlight',
    type: 'PERSONALIZED_CONTENT',
    priority: 'LOW',
    title: 'Ingredient spotlight: {ingredient} 🧪',
    body: "Perfect for your {skin_type} skin! Learn how {ingredient} can transform your routine.",
    deepLink: 'app://ingredients/{ingredient_id}',
    actionButtons: [
      { text: 'Learn More', action: 'view_ingredient', deepLink: 'app://ingredients/{ingredient_id}' },
      { text: 'Shop Products', action: 'shop_ingredient', deepLink: 'app://shop?ingredient={ingredient_id}' }
    ]
  },
  {
    id: 'progress_insight',
    name: 'Progress Insight',
    type: 'PERSONALIZED_CONTENT',
    priority: 'NORMAL',
    title: 'Your skin journey update 📊',
    body: "After {routine_days} days of consistent care, here's what we've noticed about your progress!",
    deepLink: 'app://progress',
    actionButtons: [
      { text: 'View Progress', action: 'view_progress', deepLink: 'app://progress' },
      { text: 'Adjust Goals', action: 'update_goals', deepLink: 'app://goals' }
    ],
    conditions: { has_progress_photos: true }
  },

  // APPOINTMENTS
  {
    id: 'appointment_reminder_24h',
    name: '24-Hour Appointment Reminder',
    type: 'APPOINTMENT',
    priority: 'HIGH',
    title: 'Appointment tomorrow! 📅',
    body: "Don't forget: {service_name} with {staff_name} at {appointment_time}",
    deepLink: 'app://appointments/{appointment_id}',
    actionButtons: [
      { text: 'View Details', action: 'view_appointment', deepLink: 'app://appointments/{appointment_id}' },
      { text: 'Reschedule', action: 'reschedule', deepLink: 'app://booking/reschedule/{appointment_id}' }
    ]
  },
  {
    id: 'appointment_reminder_2h',
    name: '2-Hour Appointment Reminder',
    type: 'APPOINTMENT',
    priority: 'URGENT',
    title: 'Appointment in 2 hours! ⏰',
    body: "{service_name} at {clinic_name} - {appointment_time}. See you soon!",
    deepLink: 'app://appointments/{appointment_id}',
    actionButtons: [
      { text: 'Get Directions', action: 'directions', deepLink: 'maps://directions?to={clinic_address}' },
      { text: 'Call Clinic', action: 'call_clinic', deepLink: 'tel:{clinic_phone}' }
    ]
  },

  // PROMOTIONAL
  {
    id: 'flash_sale',
    name: 'Flash Sale Alert',
    type: 'PROMOTIONAL',
    priority: 'HIGH',
    title: '⚡ Flash Sale: {discount}% off!',
    body: "Limited time: {discount}% off {product_category}! Sale ends in {hours_remaining} hours.",
    deepLink: 'app://shop/sale',
    actionButtons: [
      { text: 'Shop Sale', action: 'shop_sale', deepLink: 'app://shop/sale' },
      { text: 'Save for Later', action: 'save_sale' }
    ]
  },
  {
    id: 'new_product_launch',
    name: 'New Product Launch',
    type: 'PROMOTIONAL',
    priority: 'NORMAL',
    title: '🆕 New arrival: {product_name}',
    body: "Perfect for {skin_type} skin! Be among the first to try {product_name}.",
    deepLink: 'app://products/{product_id}',
    actionButtons: [
      { text: 'Learn More', action: 'view_product', deepLink: 'app://products/{product_id}' },
      { text: 'Add to Wishlist', action: 'add_wishlist' }
    ]
  },
  {
    id: 'personalized_offer',
    name: 'Personalized Offer',
    type: 'PROMOTIONAL',
    priority: 'NORMAL',
    title: 'Special offer just for you! 🎁',
    body: "Based on your {skin_concerns}, we think you'll love this {offer_type}!",
    deepLink: 'app://offers/{offer_id}',
    actionButtons: [
      { text: 'View Offer', action: 'view_offer', deepLink: 'app://offers/{offer_id}' },
      { text: 'Not Interested', action: 'dismiss_offer' }
    ]
  }
];

export class NotificationTemplateSeeder {
  static async seedTemplates() {
    console.log('🌱 Seeding notification templates...');
    
    for (const template of NOTIFICATION_TEMPLATES) {
      try {
        await prisma.notificationTemplate.upsert({
          where: { id: template.id },
          update: {
            name: template.name,
            type: template.type,
            priority: template.priority,
            title: template.title,
            body: template.body,
            deepLink: template.deepLink,
            actionButtons: template.actionButtons as any,
            metadata: template.metadata as any,
            conditions: template.conditions as any,
          },
          create: {
            id: template.id,
            name: template.name,
            type: template.type,
            priority: template.priority,
            title: template.title,
            body: template.body,
            deepLink: template.deepLink,
            actionButtons: template.actionButtons as any,
            metadata: template.metadata as any,
            conditions: template.conditions as any,
          },
        });
        
        console.log(`✅ Seeded template: ${template.name}`);
      } catch (error) {
        console.error(`❌ Failed to seed template ${template.name}:`, error);
      }
    }
    
    console.log('🎉 Template seeding completed!');
  }

  static async getTemplate(id: string): Promise<NotificationTemplate | null> {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { id }
      });
      
      if (!template) return null;
      
      return {
        id: template.id,
        name: template.name,
        type: template.type as any,
        priority: template.priority as any,
        title: template.title,
        body: template.body,
        deepLink: template.deepLink || undefined,
        actionButtons: template.actionButtons as any,
        metadata: template.metadata as any,
        conditions: template.conditions as any,
      };
    } catch (error) {
      console.error('Failed to get template:', error);
      return null;
    }
  }

  static async getTemplatesByType(type: NotificationTemplate['type']): Promise<NotificationTemplate[]> {
    try {
      const templates = await prisma.notificationTemplate.findMany({
        where: { type }
      });
      
      return templates.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type as any,
        priority: template.priority as any,
        title: template.title,
        body: template.body,
        deepLink: template.deepLink || undefined,
        actionButtons: template.actionButtons as any,
        metadata: template.metadata as any,
        conditions: template.conditions as any,
      }));
    } catch (error) {
      console.error('Failed to get templates by type:', error);
      return [];
    }
  }

  static interpolateTemplate(template: NotificationTemplate, variables: Record<string, any>): NotificationTemplate {
    const interpolate = (str: string): string => {
      return str.replace(/\{([^}]+)\}/g, (match, key) => {
        return variables[key] || match;
      });
    };

    return {
      ...template,
      title: interpolate(template.title),
      body: interpolate(template.body),
      deepLink: template.deepLink ? interpolate(template.deepLink) : undefined,
      actionButtons: template.actionButtons?.map(button => ({
        ...button,
        text: interpolate(button.text),
        deepLink: button.deepLink ? interpolate(button.deepLink) : undefined,
      })),
    };
  }
}