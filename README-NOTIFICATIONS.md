# 🔔 Advanced Notification System

The Skin Societé app includes a comprehensive, intelligent push notification system designed to drive engagement through behavioral triggers and personalized skincare routine optimization.

## 🚀 Features

### Core Notification Types
- **Routine Reminders**: Morning and evening skincare routine notifications
- **Gamification**: Streak celebrations, level-ups, and challenge completions
- **Behavioral Triggers**: Re-engagement, appointment follow-ups, and booking reminders
- **Personalized Content**: Weather-based skincare tips, ingredient spotlights, and progress insights
- **Appointment Reminders**: 24-hour and 2-hour appointment notifications
- **Promotional**: Flash sales, new product launches, and personalized offers

### Smart Features
- **Behavioral Analytics**: Tracks user activity patterns and engagement
- **Intelligent Scheduling**: Sends notifications at optimal times based on user preferences
- **Deep Linking**: Direct navigation to relevant app sections
- **Rich Notifications**: Action buttons and interactive elements
- **A/B Testing**: Template variation testing for optimization
- **Frequency Controls**: User-defined daily and weekly limits

## 🛠 Technical Architecture

### Database Schema
The notification system uses several Prisma models:

```typescript
// Core Models
NotificationTemplate  // Pre-configured notification templates
NotificationHistory   // Sent notification tracking
UserDeviceToken      // FCM device token management
NotificationPreferences // User notification settings

// Analytics Models
UserBehaviorTracking // User activity and engagement data
NotificationAnalytics // Performance metrics and A/B testing
```

### Key Components

#### 1. NotificationService (`/app/lib/notification-service.ts`)
Core service handling:
- Firebase Cloud Messaging (FCM) integration
- Template-based notification sending
- Behavioral trigger processing
- Analytics tracking
- User preference management

#### 2. BehaviorTracker (`/app/lib/notification-service.ts`)
Analytics service for:
- User activity tracking
- Engagement pattern analysis
- Behavioral trigger identification
- Personalization data collection

#### 3. NotificationScheduler (`/app/lib/notification-scheduler.ts`)
Cron-based scheduler for:
- Routine reminder automation
- Gamification trigger processing
- Behavioral analysis and targeting
- Scheduled promotional campaigns

#### 4. NotificationPreferences Component (`/app/components/notifications/NotificationPreferences.tsx`)
React component providing:
- Notification type toggles
- Timing preferences (morning/evening/quiet hours)
- Frequency limits
- Real-time preference updates

### API Endpoints

```typescript
// Device Token Management
POST /api/notifications/register-token
- Registers FCM device tokens for push notifications

// User Preferences
GET /api/notifications/preferences
PUT /api/notifications/preferences
- Manages user notification preferences

// Notification Sending (Admin)
POST /api/notifications/send
- Sends notifications (requires admin API key)

// Analytics Tracking
POST /api/notifications/track
- Tracks notification interactions
```

## 🔧 Setup Instructions

### 1. Firebase Configuration

Create a Firebase project with Cloud Messaging enabled:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Enable Cloud Messaging
4. Generate service account credentials
5. Download the service account JSON file

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Firebase Web Config (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-web-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Admin API for testing
ADMIN_API_KEY=your-secure-admin-key
```

### 3. Database Setup

Run Prisma migrations to create notification tables:

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Notification Templates

Populate the database with pre-configured templates:

```bash
npx tsx scripts/seed-notifications.ts
```

### 5. Start the Scheduler

The notification scheduler runs automatically in production. For development:

```bash
# The scheduler is imported and started in the main app
npm run dev
```

## 📱 Client-Side Integration

### Web Push Notifications

For web browsers, implement service worker registration:

```typescript
// Register service worker for web push
if ('serviceWorker' in navigator && 'PushManager' in window) {
  const registration = await navigator.serviceWorker.register('/sw.js');
  // Get FCM token and register with API
}
```

### Mobile App Integration

For React Native apps:
1. Install `@react-native-firebase/messaging`
2. Configure platform-specific settings
3. Request notification permissions
4. Register device tokens via API

## 🎯 Usage Examples

### Manual Notification Sending

```typescript
import { NotificationService } from '@/app/lib/notification-service';

// Send routine reminder to specific user
await NotificationService.sendRoutineReminder('morning', ['user-id']);

// Send gamification notification for streak
await NotificationService.sendStreakCelebration('user-id', 7);

// Send personalized weather-based tip
await NotificationService.sendWeatherBasedTip('user-id', 'sunny', 'extra SPF protection');
```

### Behavioral Trigger Setup

```typescript
// Track user activity for behavioral triggers
await BehaviorTracker.trackAppOpen('user-id');
await BehaviorTracker.trackRoutineCompletion('user-id', 'morning');
await BehaviorTracker.trackAppointmentBooking('user-id', 'appointment-id');
```

### Custom Template Creation

```typescript
import { NotificationTemplateSeeder } from '@/app/lib/notification-templates';

const customTemplate = {
  id: 'custom_reminder',
  name: 'Custom Reminder',
  type: 'ROUTINE_REMINDER',
  priority: 'NORMAL',
  title: 'Custom Title',
  body: 'Custom message with {variable}',
  deepLink: 'app://custom',
  actionButtons: [
    { text: 'Action', action: 'custom_action', deepLink: 'app://action' }
  ]
};

// Use template with variables
const personalizedTemplate = NotificationTemplateSeeder.interpolateTemplate(
  customTemplate, 
  { variable: 'personalized value' }
);
```

## 📊 Analytics & Monitoring

### Performance Metrics
- Delivery rates and success tracking
- Open rates and interaction analytics
- A/B testing results and optimization
- User preference analysis

### A/B Testing

```typescript
// Test different notification templates
await NotificationService.sendNotificationWithABTest(
  'user-id',
  ['template_a', 'template_b'],
  'experiment_name'
);
```

## 🔐 Security & Privacy

- User consent required for notification permissions
- Granular preference controls for all notification types
- Secure admin API key for notification sending
- Privacy-compliant analytics tracking
- GDPR-friendly data handling

## 🚀 Deployment

### Production Checklist

1. ✅ Configure Firebase project for production
2. ✅ Set up environment variables in deployment platform
3. ✅ Run database migrations
4. ✅ Seed notification templates
5. ✅ Configure cron jobs for scheduler
6. ✅ Set up monitoring and alerting
7. ✅ Test notification delivery end-to-end

### Monitoring

The system includes comprehensive logging:
- Notification send success/failure rates
- User engagement metrics
- Performance monitoring
- Error tracking and alerting

## 🔍 Troubleshooting

### Common Issues

**Notifications not sending:**
- Verify Firebase configuration
- Check device token registration
- Confirm user preferences allow notifications

**Scheduler not running:**
- Check cron job configuration
- Verify database connection
- Review scheduler logs

**Template interpolation errors:**
- Validate template variable syntax
- Check variable data availability
- Review template conditions

For detailed logs, check the application console and Firebase Cloud Messaging delivery reports.

## 🎨 Customization

The notification system is highly customizable:
- Custom notification templates
- Flexible behavioral triggers
- Personalized content rules
- Custom scheduling logic
- Branded notification appearance

Modify templates in `/app/lib/notification-templates.ts` and behavioral logic in `/app/lib/notification-service.ts` to match your specific requirements.