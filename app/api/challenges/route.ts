import { NextRequest, NextResponse } from 'next/server';
import { getDailyChallenges, WEEKLY_CHALLENGES, CURRENT_SEASONAL_EVENT } from '@/app/lib/challenges';
import { userProgressStore } from '@/app/lib/progress-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const type = searchParams.get('type') || 'all'; // all, daily, weekly, seasonal

    // Get user progress to check completed challenges
    const userProgress = userProgressStore.get(userId);
    const today = new Date().toDateString();
    const currentWeek = getWeekNumber(new Date());

    let challenges = [];

    if (type === 'all' || type === 'daily') {
      const dailyChallenges = getDailyChallenges().map(challenge => ({
        ...challenge,
        isCompleted: userProgress?.dailyTasks?.[today]?.[challenge.id] || false,
        progress: {
          current: userProgress?.dailyTasks?.[today]?.[challenge.id] ? 1 : 0,
          target: challenge.requirement.target,
        },
      }));
      challenges.push(...dailyChallenges);
    }

    if (type === 'all' || type === 'weekly') {
      const weeklyChallenges = WEEKLY_CHALLENGES.map(challenge => {
        const weeklyProgress = userProgress?.weeklyChallenges?.[currentWeek]?.[challenge.id] || 0;
        return {
          ...challenge,
          isCompleted: weeklyProgress >= challenge.requirement.target,
          progress: {
            current: weeklyProgress,
            target: challenge.requirement.target,
          },
        };
      });
      challenges.push(...weeklyChallenges);
    }

    if (type === 'all' || type === 'seasonal') {
      const seasonalChallenges = CURRENT_SEASONAL_EVENT.challenges.map(challenge => {
        const seasonalProgress = userProgress?.seasonalChallenges?.[CURRENT_SEASONAL_EVENT.id]?.[challenge.id] || 0;
        return {
          ...challenge,
          isCompleted: seasonalProgress >= challenge.requirement.target,
          progress: {
            current: seasonalProgress,
            target: challenge.requirement.target,
          },
          event: {
            id: CURRENT_SEASONAL_EVENT.id,
            name: CURRENT_SEASONAL_EVENT.name,
            theme: CURRENT_SEASONAL_EVENT.theme,
          },
        };
      });
      challenges.push(...seasonalChallenges);
    }

    return NextResponse.json({
      success: true,
      data: {
        challenges,
        currentEvent: type === 'all' || type === 'seasonal' ? CURRENT_SEASONAL_EVENT : null,
        meta: {
          userId,
          today,
          currentWeek,
        },
      },
    });
  } catch (error) {
    console.error('Challenges API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, challengeType, progress } = await request.json();
    const userKey = userId || 'demo-user';
    
    let userProgress = userProgressStore.get(userKey);
    if (!userProgress) {
      userProgress = {
        userId: userKey,
        points: 0,
        streak: 0,
        lastActivity: new Date().toISOString(),
        achievements: [],
        dailyTasks: {},
        stats: { totalOrders: 0, totalVisits: 0, totalSpent: 0, daysActive: 0 },
        weeklyChallenges: {},
        seasonalChallenges: {},
      };
    }

    const today = new Date().toDateString();
    const currentWeek = getWeekNumber(new Date());
    let pointsEarned = 0;
    let challengeCompleted = false;

    switch (challengeType) {
      case 'daily':
        if (!userProgress.dailyTasks[today]) {
          userProgress.dailyTasks[today] = {};
        }
        
        if (!userProgress.dailyTasks[today][challengeId]) {
          userProgress.dailyTasks[today][challengeId] = true;
          
          // Find the challenge to get points
          const dailyChallenge = getDailyChallenges().find(c => c.id === challengeId);
          if (dailyChallenge) {
            pointsEarned = dailyChallenge.points;
            challengeCompleted = true;
          }
        }
        break;

      case 'weekly':
        if (!userProgress.weeklyChallenges) userProgress.weeklyChallenges = {};
        if (!userProgress.weeklyChallenges[currentWeek]) {
          userProgress.weeklyChallenges[currentWeek] = {};
        }
        
        const currentWeeklyProgress = userProgress.weeklyChallenges[currentWeek][challengeId] || 0;
        userProgress.weeklyChallenges[currentWeek][challengeId] = currentWeeklyProgress + (progress || 1);
        
        // Check if challenge is now completed
        const weeklyChallenge = WEEKLY_CHALLENGES.find(c => c.id === challengeId);
        if (weeklyChallenge && userProgress.weeklyChallenges[currentWeek][challengeId] >= weeklyChallenge.requirement.target) {
          if (currentWeeklyProgress < weeklyChallenge.requirement.target) {
            pointsEarned = weeklyChallenge.points;
            challengeCompleted = true;
          }
        }
        break;

      case 'seasonal':
        if (!userProgress.seasonalChallenges) userProgress.seasonalChallenges = {};
        if (!userProgress.seasonalChallenges[CURRENT_SEASONAL_EVENT.id]) {
          userProgress.seasonalChallenges[CURRENT_SEASONAL_EVENT.id] = {};
        }
        
        const currentSeasonalProgress = userProgress.seasonalChallenges[CURRENT_SEASONAL_EVENT.id][challengeId] || 0;
        userProgress.seasonalChallenges[CURRENT_SEASONAL_EVENT.id][challengeId] = currentSeasonalProgress + (progress || 1);
        
        // Check if challenge is now completed
        const seasonalChallenge = CURRENT_SEASONAL_EVENT.challenges.find(c => c.id === challengeId);
        if (seasonalChallenge && userProgress.seasonalChallenges[CURRENT_SEASONAL_EVENT.id][challengeId] >= seasonalChallenge.requirement.target) {
          if (currentSeasonalProgress < seasonalChallenge.requirement.target) {
            pointsEarned = seasonalChallenge.points * (seasonalChallenge.multiplier || 1);
            challengeCompleted = true;
          }
        }
        break;
    }

    if (challengeCompleted) {
      userProgress.points += pointsEarned;
      userProgress.lastActivity = new Date().toISOString();
      
      // Update stats
      if (!userProgress.stats) {
        userProgress.stats = { totalOrders: 0, totalVisits: 0, totalSpent: 0, daysActive: 0 };
      }
      userProgress.stats.daysActive = Math.max(userProgress.stats.daysActive, userProgress.streak);

      // Notify leaderboard
      try {
        await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userKey,
            action: 'challenge_completed',
            points: pointsEarned,
          }),
        });
      } catch (error) {
        console.log('Failed to notify leaderboard:', error);
      }
    }

    userProgressStore.set(userKey, userProgress);

    return NextResponse.json({
      success: true,
      data: {
        challengeCompleted,
        pointsEarned,
        totalPoints: userProgress.points,
        progress: userProgress,
      },
    });
  } catch (error) {
    console.error('Challenge completion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete challenge' },
      { status: 500 }
    );
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNum}`;
}