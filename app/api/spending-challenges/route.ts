import { NextRequest, NextResponse } from 'next/server';
import { 
  getActiveSpendingChallenges, 
  getChallengeProgress, 
  getRecommendedChallengeForUser, 
  getPersonalizedBundles,
  getBundleRecommendationReason,
  getBundlesForChallenge,
  SPENDING_BUNDLES 
} from '@/app/lib/spending-challenges';
import { userProgressStore } from '@/app/lib/progress-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const type = searchParams.get('type') || 'active'; // active, completed, recommended, bundles

    // Get user progress for personalization
    const userProgress = userProgressStore.get(userId);
    const userSpendingHistory = userProgress?.stats?.totalSpent || 0;
    const userTier = userProgress?.points ? (userProgress.points >= 2000 ? 'vip_goddess' : 
                     userProgress.points >= 1000 ? 'skincare_guru' : 
                     userProgress.points >= 500 ? 'beauty_enthusiast' : 'glow_starter') : 'glow_starter';

    let data: any = {};

    switch (type) {
      case 'active':
        const activeChallenges = getActiveSpendingChallenges().map(challenge => ({
          ...challenge,
          progress: getChallengeProgress(challenge, userSpendingHistory),
          timeRemaining: challenge.endDate ? Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null,
          spotsRemaining: challenge.maxParticipants && challenge.currentParticipants ? 
            challenge.maxParticipants - challenge.currentParticipants : null,
        }));
        
        data = { challenges: activeChallenges };
        break;

      case 'recommended':
        const recommended = getRecommendedChallengeForUser(userSpendingHistory, userTier);
        data = { 
          recommendedChallenge: recommended ? {
            ...recommended,
            progress: getChallengeProgress(recommended, userSpendingHistory),
            personalizedReason: getPersonalizedReason(recommended, userSpendingHistory, userTier),
          } : null 
        };
        break;

      case 'bundles':
        const personalizedBundles = getPersonalizedBundles(userTier, userSpendingHistory, []);
        data = { 
          bundles: personalizedBundles.map(bundle => ({
            ...bundle,
            recommendationReason: getBundleRecommendationReason(bundle, userTier, userSpendingHistory),
            isRecommended: bundle.score > 60, // Bundles with high recommendation score
            associatedChallenge: bundle.challengeId ? getActiveSpendingChallenges().find(c => c.id === bundle.challengeId) : null,
          }))
        };
        break;

      case 'user-progress':
        // Get user's spending challenge progress
        const userSpendingProgress = {
          activeChallenges: [], // Would track from database
          completedChallenges: [], // Would track from database
          totalSpent: userSpendingHistory,
          currentTier: userTier,
          nextMilestone: getNextSpendingMilestone(userSpendingHistory),
        };
        data = { userProgress: userSpendingProgress };
        break;

      default:
        data = { challenges: getActiveSpendingChallenges() };
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        userId,
        userTier,
        totalSpent: userSpendingHistory,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Spending challenges API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch spending challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, action, data } = await request.json();
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
        spendingChallenges: { active: [], completed: [] },
      };
    }

    // Initialize spending challenges if not exists
    if (!userProgress.spendingChallenges) {
      userProgress.spendingChallenges = { active: [], completed: [] };
    }

    let response: any = { success: true };

    switch (action) {
      case 'join_challenge':
        // Add challenge to user's active challenges
        const existingChallenge = userProgress.spendingChallenges.active.find(
          (c: any) => c.challengeId === challengeId
        );
        
        if (!existingChallenge) {
          userProgress.spendingChallenges.active.push({
            challengeId,
            startedAt: new Date().toISOString(),
            currentSpend: 0,
            completedRequirements: [],
            products: [],
          });
          
          response.message = 'Successfully joined challenge!';
        } else {
          response.message = 'Already participating in this challenge';
        }
        break;

      case 'update_progress':
        // Update spending progress for a challenge
        const { amount, productId, productName, productPrice } = data;
        
        const activeChallengeIndex = userProgress.spendingChallenges.active.findIndex(
          (c: any) => c.challengeId === challengeId
        );
        
        if (activeChallengeIndex >= 0) {
          const challenge = userProgress.spendingChallenges.active[activeChallengeIndex];
          challenge.currentSpend += amount;
          
          if (productId) {
            challenge.products.push({
              productId,
              name: productName,
              price: productPrice,
              purchasedAt: new Date().toISOString(),
            });
          }
          
          // Check if challenge is completed
          const challengeData = getActiveSpendingChallenges().find(c => c.id === challengeId);
          if (challengeData && challenge.currentSpend >= challengeData.requirements.minSpend) {
            // Move to completed
            userProgress.spendingChallenges.completed.push({
              challengeId,
              completedAt: new Date().toISOString(),
              finalSpend: challenge.currentSpend,
              rewardsEarned: challengeData.rewards,
            });
            
            // Remove from active
            userProgress.spendingChallenges.active.splice(activeChallengeIndex, 1);
            
            // Award rewards
            userProgress.points += challengeData.rewards.points;
            if (challengeData.rewards.bonusPoints) {
              userProgress.points += challengeData.rewards.bonusPoints;
            }
            
            response.challengeCompleted = true;
            response.rewardsEarned = challengeData.rewards;
            response.message = `Challenge completed! You earned ${challengeData.rewards.points} points!`;
          }
        }
        break;

      case 'abandon_challenge':
        // Remove challenge from active list
        userProgress.spendingChallenges.active = userProgress.spendingChallenges.active.filter(
          (c: any) => c.challengeId !== challengeId
        );
        response.message = 'Left challenge successfully';
        break;
    }

    userProgressStore.set(userKey, userProgress);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Spending challenge action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process spending challenge action' },
      { status: 500 }
    );
  }
}

// Helper functions
function getPersonalizedReason(challenge: any, userSpend: number, userTier: string): string {
  if (challenge.category === 'starter' && userSpend < 100) {
    return 'Perfect for beginners - build your first complete routine!';
  }
  if (challenge.category === 'luxury' && userTier === 'vip_goddess') {
    return 'Exclusive VIP challenge - unlock premium benefits!';
  }
  if (challenge.type === 'routine_builder') {
    return 'Complete your skincare routine with expert-curated products';
  }
  return 'Recommended based on your skincare journey';
}

function getNextSpendingMilestone(currentSpend: number): any {
  const milestones = [
    { amount: 100, reward: '200 bonus points' },
    { amount: 250, reward: 'Beauty Enthusiast tier' },
    { amount: 500, reward: '15% discount code' },
    { amount: 1000, reward: 'VIP Goddess tier + consultation' },
  ];
  
  return milestones.find(m => m.amount > currentSpend) || null;
}