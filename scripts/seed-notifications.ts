#!/usr/bin/env tsx

import { NotificationTemplateSeeder } from '../app/lib/notification-templates';

async function main() {
  console.log('🚀 Starting notification template seeding...');
  
  try {
    await NotificationTemplateSeeder.seedTemplates();
    console.log('✅ Notification templates seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed notification templates:', error);
    process.exit(1);
  }
}

main();