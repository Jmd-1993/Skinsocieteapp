interface UserProgress {
  userId: string;
  points: number;
  streak: number;
  lastActivity: string;
  achievements: string[];
  dailyTasks: {
    [date: string]: {
      morningCleanse: boolean;
      vitaminC: boolean;
      eveningRoutine: boolean;
    };
  };
  stats: {
    totalOrders: number;
    totalVisits: number;
    totalSpent: number;
    daysActive: number;
  };
}

// In-memory storage for demo (in production, use a database)
export const userProgressStore = new Map<string, UserProgress>();

// Initialize default progress for new users
export function createDefaultProgress(userId: string): UserProgress {
  return {
    userId,
    points: 0,
    streak: 0,
    lastActivity: new Date().toISOString(),
    achievements: [],
    dailyTasks: {},
    stats: {
      totalOrders: 0,
      totalVisits: 0,
      totalSpent: 0,
      daysActive: 0
    }
  };
}