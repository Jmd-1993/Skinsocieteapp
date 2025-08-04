import { NextRequest, NextResponse } from 'next/server';
import { userProgressStore, createDefaultProgress } from '@/app/lib/progress-store';

// Get user progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    let progress = userProgressStore.get(userId);
    if (!progress) {
      progress = createDefaultProgress(userId);
      userProgressStore.set(userId, progress);
    }

    // Check if streak should be broken
    const today = new Date().toDateString();
    const lastActivityDate = new Date(progress.lastActivity).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (lastActivityDate !== today && lastActivityDate !== yesterday) {
      progress.streak = 0;
    }

    // Calculate today's progress
    const todayTasks = progress.dailyTasks[today] || {
      morningCleanse: false,
      vitaminC: false,
      eveningRoutine: false
    };

    const completedTasks = Object.values(todayTasks).filter(Boolean).length;
    const progressPercentage = Math.round((completedTasks / 3) * 100);

    return NextResponse.json({
      success: true,
      data: {
        ...progress,
        todayProgress: {
          completed: completedTasks,
          total: 3,
          percentage: progressPercentage,
          tasks: todayTasks
        }
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get user progress' },
      { status: 500 }
    );
  }
}

// Update user progress
export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json();
    const userKey = userId || 'demo-user';
    
    let progress = userProgressStore.get(userKey);
    if (!progress) {
      progress = createDefaultProgress(userKey);
    }

    const today = new Date().toDateString();
    const now = new Date().toISOString();

    switch (action) {
      case 'complete_task':
        const { task } = data;
        if (!progress.dailyTasks[today]) {
          progress.dailyTasks[today] = {
            morningCleanse: false,
            vitaminC: false,
            eveningRoutine: false
          };
        }

        if (!progress.dailyTasks[today][task]) {
          progress.dailyTasks[today][task] = true;
          progress.points += 25; // 25 points per task
          progress.lastActivity = now;

          // Notify leaderboard of score update (async, don't wait)
          fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userKey,
              action: 'task_completed',
              points: 25
            })
          }).catch(() => {}); // Ignore errors

          // Check if all tasks completed for streak
          const allTasksComplete = Object.values(progress.dailyTasks[today]).every(Boolean);
          if (allTasksComplete) {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
            const hadYesterdayActivity = progress.dailyTasks[yesterday] && 
              Object.values(progress.dailyTasks[yesterday]).every(Boolean);
            
            if (hadYesterdayActivity || progress.streak === 0) {
              progress.streak += 1;
              progress.points += 50; // Bonus for maintaining streak
            } else {
              progress.streak = 1;
            }
          }

          // Check for achievements
          if (progress.points >= 100 && !progress.achievements.includes('first_100')) {
            progress.achievements.push('first_100');
          }
          if (progress.streak >= 7 && !progress.achievements.includes('week_warrior')) {
            progress.achievements.push('week_warrior');
          }
        }
        break;

      case 'purchase_made':
        const { amount, items } = data;
        progress.stats.totalOrders += 1;
        progress.stats.totalSpent += amount;
        progress.points += Math.floor(amount * 0.1); // 10% back as points
        progress.lastActivity = now;

        // Purchase achievements
        if (progress.stats.totalOrders === 1 && !progress.achievements.includes('first_purchase')) {
          progress.achievements.push('first_purchase');
        }
        if (progress.stats.totalSpent >= 500 && !progress.achievements.includes('big_spender')) {
          progress.achievements.push('big_spender');
        }
        break;

      case 'appointment_booked':
        progress.stats.totalVisits += 1;
        progress.points += 100; // 100 points for booking
        progress.lastActivity = now;

        if (progress.stats.totalVisits === 1 && !progress.achievements.includes('first_visit')) {
          progress.achievements.push('first_visit');
        }
        break;

      case 'profile_completed':
        if (!progress.achievements.includes('profile_complete')) {
          progress.achievements.push('profile_complete');
          progress.points += 50;
        }
        break;
    }

    userProgressStore.set(userKey, progress);

    return NextResponse.json({
      success: true,
      data: progress,
      message: 'Progress updated successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// Reset user progress (for testing)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    const progress = createDefaultProgress(userId);
    userProgressStore.set(userId, progress);

    return NextResponse.json({
      success: true,
      data: progress,
      message: 'Progress reset successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to reset progress' },
      { status: 500 }
    );
  }
}