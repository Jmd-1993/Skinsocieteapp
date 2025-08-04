import { NextRequest, NextResponse } from 'next/server';
import { userProgressStore } from '@/app/lib/progress-store';

// Create some demo users for a competitive leaderboard
function seedDemoUsers() {
  const demoUsers = [
    {
      userId: 'sarah_beauty',
      displayName: 'Sarah M.',
      points: 2850,
      streak: 12,
      achievements: ['first_100', 'week_warrior', 'first_purchase', 'big_spender'],
      stats: { totalOrders: 8, totalVisits: 4, totalSpent: 1200, daysActive: 15 },
      avatar: '👩‍🦰',
      clinic: 'Cottesloe'
    },
    {
      userId: 'emma_glow',
      displayName: 'Emma K.',
      points: 2340,
      streak: 8,
      achievements: ['first_100', 'week_warrior', 'first_purchase'],
      stats: { totalOrders: 5, totalVisits: 3, totalSpent: 800, daysActive: 12 },
      avatar: '👩‍🦱',
      clinic: 'Perth CBD'
    },
    {
      userId: 'jessica_skin',
      displayName: 'Jessica L.',
      points: 1890,
      streak: 15,
      achievements: ['first_100', 'week_warrior', 'first_visit'],
      stats: { totalOrders: 3, totalVisits: 6, totalSpent: 450, daysActive: 18 },
      avatar: '👩‍🦳',
      clinic: 'Subiaco'
    },
    {
      userId: 'mia_radiant',
      displayName: 'Mia R.',
      points: 1675,
      streak: 5,
      achievements: ['first_100', 'first_purchase'],
      stats: { totalOrders: 4, totalVisits: 2, totalSpent: 600, daysActive: 8 },
      avatar: '👩',
      clinic: 'Fremantle'
    },
    {
      userId: 'chloe_beauty',
      displayName: 'Chloe T.',
      points: 1420,
      streak: 3,
      achievements: ['first_100', 'first_visit'],
      stats: { totalOrders: 2, totalVisits: 4, totalSpent: 300, daysActive: 6 },
      avatar: '👱‍♀️',
      clinic: 'Joondalup'
    },
    {
      userId: 'amy_glow',
      displayName: 'Amy S.',
      points: 1180,
      streak: 7,
      achievements: ['first_100'],
      stats: { totalOrders: 2, totalVisits: 1, totalSpent: 250, daysActive: 9 },
      avatar: '👩‍🦲',
      clinic: 'Cottesloe'
    },
    {
      userId: 'sophie_care',
      displayName: 'Sophie W.',
      points: 980,
      streak: 2,
      achievements: ['first_100'],
      stats: { totalOrders: 1, totalVisits: 2, totalSpent: 150, daysActive: 4 },
      avatar: '🧑‍🦰',
      clinic: 'Perth CBD'
    },
    {
      userId: 'olivia_skin',
      displayName: 'Olivia B.',
      points: 750,
      streak: 4,
      achievements: ['first_100'],
      stats: { totalOrders: 1, totalVisits: 1, totalSpent: 120, daysActive: 5 },
      avatar: '👩‍🦴',
      clinic: 'Subiaco'
    }
  ];

  // Only seed if no demo users exist
  demoUsers.forEach(user => {
    if (!userProgressStore.has(user.userId)) {
      userProgressStore.set(user.userId, {
        userId: user.userId,
        points: user.points,
        streak: user.streak,
        lastActivity: new Date().toISOString(),
        achievements: user.achievements,
        dailyTasks: {},
        stats: user.stats
      });
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    // Seed demo users for competitive leaderboard
    seedDemoUsers();

    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('userId') || 'demo-user';
    const limit = parseInt(searchParams.get('limit') || '20');
    const period = searchParams.get('period') || 'all-time'; // all-time, weekly, monthly

    // Get all users and their progress
    const allUsers = Array.from(userProgressStore.entries()).map(([userId, progress]) => {
      // Get display name and avatar
      let displayName = userId === 'demo-user' ? 'You' : userId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      let avatar = '👤';
      let clinic = 'Cottesloe';

      // Demo user data
      const demoUserData = {
        'sarah_beauty': { name: 'Sarah M.', avatar: '👩‍🦰', clinic: 'Cottesloe' },
        'emma_glow': { name: 'Emma K.', avatar: '👩‍🦱', clinic: 'Perth CBD' },
        'jessica_skin': { name: 'Jessica L.', avatar: '👩‍🦳', clinic: 'Subiaco' },
        'mia_radiant': { name: 'Mia R.', avatar: '👩', clinic: 'Fremantle' },
        'chloe_beauty': { name: 'Chloe T.', avatar: '👱‍♀️', clinic: 'Joondalup' },
        'amy_glow': { name: 'Amy S.', avatar: '👩‍🦲', clinic: 'Cottesloe' },
        'sophie_care': { name: 'Sophie W.', avatar: '🧑‍🦰', clinic: 'Perth CBD' },
        'olivia_skin': { name: 'Olivia B.', avatar: '👩‍🦴', clinic: 'Subiaco' }
      };

      if (demoUserData[userId]) {
        displayName = demoUserData[userId].name;
        avatar = demoUserData[userId].avatar;
        clinic = demoUserData[userId].clinic;
      }

      // Calculate tier based on points
      let tier = 'Glow Starter';
      if (progress.points >= 2000) tier = 'VIP Goddess';
      else if (progress.points >= 1000) tier = 'Skincare Guru';
      else if (progress.points >= 500) tier = 'Beauty Enthusiast';

      return {
        userId,
        displayName,
        avatar,
        clinic,
        points: progress.points,
        streak: progress.streak,
        achievements: progress.achievements.length,
        tier,
        stats: progress.stats,
        isCurrentUser: userId === currentUserId,
        lastActive: progress.lastActivity ? new Date(progress.lastActivity).toLocaleDateString() : 'Never'
      };
    });

    // Sort by points (highest first)
    const sortedUsers = allUsers.sort((a, b) => b.points - a.points);

    // Add rankings
    const rankedUsers = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
      change: 0 // TODO: Calculate from previous rankings
    }));

    // Get top users and current user position
    const topUsers = rankedUsers.slice(0, limit);
    const currentUser = rankedUsers.find(user => user.userId === currentUserId);
    const currentUserRank = currentUser?.rank || rankedUsers.length + 1;

    // Calculate some stats
    const totalUsers = rankedUsers.length;
    const averagePoints = Math.round(rankedUsers.reduce((sum, user) => sum + user.points, 0) / totalUsers);
    const topScore = rankedUsers[0]?.points || 0;

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: topUsers,
        currentUser: currentUser || {
          userId: currentUserId,
          displayName: 'You',
          avatar: '👤',
          clinic: 'Not set',
          points: 0,
          streak: 0,
          achievements: 0,
          tier: 'Glow Starter',
          rank: currentUserRank,
          isCurrentUser: true,
          lastActive: 'Never'
        },
        stats: {
          totalUsers,
          averagePoints,
          topScore,
          yourRank: currentUserRank,
          period
        }
      }
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Update leaderboard when user scores change
export async function POST(request: NextRequest) {
  try {
    const { userId, action, points } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // This would typically trigger real-time updates
    // For now, we just acknowledge the update
    console.log(`📊 Leaderboard update: ${userId} - ${action} (+${points} points)`);

    return NextResponse.json({
      success: true,
      message: 'Leaderboard updated successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update leaderboard' },
      { status: 500 }
    );
  }
}