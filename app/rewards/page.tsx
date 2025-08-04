'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '../components/layout/MainLayout'
import { useAuth } from '../lib/auth-context'
import { 
  Trophy, 
  Gift, 
  Star, 
  Calendar,
  Target,
  Flame,
  Award,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react'

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  progress: number
}

interface Reward {
  id: number
  name: string
  description: string
  points: number
  value: string
  category: string
  available: boolean
}

interface DailyChallenge {
  id: number
  name: string
  description: string
  points: number
  completed: boolean
  progress?: number
  max?: number
  icon: string
}

export default function RewardsDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)

  // Mock user points data
  const stats = {
    currentPoints: user?.totalPoints || 1250,
    currentStreak: user?.currentStreak || 7,
    lifetimePoints: user?.totalPoints ? user.totalPoints * 1.5 : 2100,
    dailyCheckIn: false,
    tier: user?.loyaltyTier || 'Beauty Enthusiast',
    nextTier: 'Skincare Guru',
    progressToNext: 75
  }

  // Sample achievements data
  const achievements: Achievement[] = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your profile',
      icon: '👤',
      points: 50,
      unlocked: true,
      progress: 100
    },
    {
      id: 2,
      name: 'Week Warrior',
      description: '7-day streak',
      icon: '🔥',
      points: 100,
      unlocked: true,
      progress: 100
    },
    {
      id: 3,
      name: 'Product Explorer',
      description: 'Try 5 different products',
      icon: '🧪',
      points: 150,
      unlocked: false,
      progress: 60
    },
    {
      id: 4,
      name: 'Glow Seeker',
      description: 'Complete 3 facials',
      icon: '✨',
      points: 200,
      unlocked: false,
      progress: 33
    },
    {
      id: 5,
      name: 'Social Butterfly',
      description: 'Refer 3 friends',
      icon: '🦋',
      points: 500,
      unlocked: false,
      progress: 0
    },
    {
      id: 6,
      name: 'Loyalty Legend',
      description: 'Reach Skincare Guru tier',
      icon: '👑',
      points: 1000,
      unlocked: false,
      progress: stats.progressToNext
    }
  ]

  // Sample rewards catalog
  const rewards: Reward[] = [
    {
      id: 1,
      name: 'Birthday Treatment Upgrade',
      description: 'Upgrade any treatment on your birthday month',
      points: 500,
      value: '$50',
      category: 'upgrade',
      available: stats.currentPoints >= 500
    },
    {
      id: 2,
      name: '20% Off Products',
      description: 'Save 20% on any skincare product',
      points: 300,
      value: '20%',
      category: 'discount',
      available: stats.currentPoints >= 300
    },
    {
      id: 3,
      name: 'Free LED Add-On',
      description: 'Add LED therapy to any facial',
      points: 400,
      value: '$80',
      category: 'addon',
      available: stats.currentPoints >= 400
    },
    {
      id: 4,
      name: 'VIP Facial Experience',
      description: 'Complimentary signature facial with champagne',
      points: 2000,
      value: '$250',
      category: 'experience',
      available: stats.currentPoints >= 2000
    },
    {
      id: 5,
      name: 'Skincare Masterclass',
      description: 'Exclusive group masterclass with our experts',
      points: 1000,
      value: 'Priceless',
      category: 'event',
      available: stats.currentPoints >= 1000
    },
    {
      id: 6,
      name: 'Referral Bonus Pack',
      description: 'Get 3 travel-size products',
      points: 600,
      value: '$120',
      category: 'product',
      available: stats.currentPoints >= 600
    }
  ]

  // Daily challenges
  const dailyChallenges: DailyChallenge[] = [
    {
      id: 1,
      name: 'Morning Glow',
      description: 'Complete morning routine',
      points: 30,
      completed: true,
      icon: '☀️'
    },
    {
      id: 2,
      name: 'Hydration Hero',
      description: 'Log 8 glasses of water',
      points: 20,
      completed: false,
      progress: 5,
      max: 8,
      icon: '💧'
    },
    {
      id: 3,
      name: 'Beauty Sleep',
      description: 'Get 8 hours of sleep',
      points: 25,
      completed: false,
      icon: '😴'
    }
  ]

  const handleRedeemReward = (reward: Reward) => {
    // In a real app, this would call an API
    alert(`Reward "${reward.name}" redeemed! Check your email for details.`)
    setSelectedReward(null)
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rewards & Achievements</h1>
          <p className="text-gray-600 mt-2">Earn points, unlock rewards, and track your skincare journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Points Display */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-sm opacity-80">Total Points</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.currentPoints.toLocaleString()}</div>
            <div className="text-sm opacity-80">+{stats.lifetimePoints - stats.currentPoints} earned all time</div>
          </div>

          {/* Streak Display */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-sm opacity-80">Current Streak</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.currentStreak} days</div>
            <div className="text-sm opacity-80">Keep it up! 🔥</div>
          </div>

          {/* Daily Check-in */}
          <div className="bg-gradient-to-br from-green-400 to-blue-500 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-sm opacity-80">Today</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats.dailyCheckIn ? 'Complete' : 'Check In'}
            </div>
            <button 
              className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
              disabled={stats.dailyCheckIn}
            >
              {stats.dailyCheckIn ? '✓ Done' : 'Claim +10 pts'}
            </button>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Loyalty Tier Progress</h3>
                <p className="text-gray-600">Current: {stats.tier}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{stats.progressToNext}%</div>
              <div className="text-sm text-gray-500">to {stats.nextTier}</div>
            </div>
          </div>
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${stats.progressToNext}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {['overview', 'achievements', 'rewards', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all capitalize
                        ${activeTab === tab 
                          ? 'bg-white text-purple-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Daily Challenges */}
            <div>
              <h2 className="text-xl font-bold mb-4">Daily Challenges</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dailyChallenges.map(challenge => (
                  <div
                    key={challenge.id}
                    className={`p-4 rounded-lg border-2 transition-all
                              ${challenge.completed 
                                ? 'bg-green-50 border-green-300' 
                                : 'bg-white border-gray-200 hover:border-purple-300'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-2xl">{challenge.icon}</div>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full
                                    ${challenge.completed 
                                      ? 'bg-green-200 text-green-700' 
                                      : 'bg-gray-200 text-gray-600'}`}>
                        +{challenge.points} pts
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1">{challenge.name}</h3>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                    
                    {challenge.progress !== undefined && !challenge.completed && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{challenge.progress}/{challenge.max}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-purple-500 h-full rounded-full transition-all"
                            style={{ width: `${(challenge.progress! / challenge.max!) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold">{achievements.filter(a => a.unlocked).length}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="text-3xl mb-2">🎁</div>
                <div className="text-2xl font-bold">{rewards.filter(r => r.available).length}</div>
                <div className="text-sm text-gray-600">Available Rewards</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-2xl font-bold">{stats.lifetimePoints}</div>
                <div className="text-sm text-gray-600">Lifetime Points</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold">{stats.currentPoints}</div>
                <div className="text-sm text-gray-600">Available Points</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-6 rounded-xl border-2 transition-all hover:scale-105
                          ${achievement.unlocked 
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300' 
                            : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-5xl ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  {achievement.unlocked && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      Unlocked
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reward</span>
                    <span className="font-medium text-purple-600">+{achievement.points} pts</span>
                  </div>
                  
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
                          : 'bg-purple-400'
                      }`}
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500 text-right">
                    {achievement.progress}% Complete
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map(reward => (
              <div
                key={reward.id}
                onClick={() => reward.available && setSelectedReward(reward)}
                className={`p-6 rounded-xl border-2 transition-all
                          ${reward.available 
                            ? 'bg-white border-purple-200 hover:border-purple-400 cursor-pointer hover:scale-105' 
                            : 'bg-gray-50 border-gray-200 opacity-60'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                                ${reward.available 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-gray-200 text-gray-500'}`}>
                    {reward.category}
                  </span>
                  <span className="text-lg font-bold text-gray-900">{reward.value}</span>
                </div>
                
                <h3 className="font-bold text-lg mb-2">{reward.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl">💎</span>
                    <span className="font-bold text-lg">{reward.points}</span>
                    <span className="text-sm text-gray-500">points</span>
                  </div>
                  
                  {reward.available ? (
                    <button className="text-purple-600 font-medium text-sm hover:text-purple-700">
                      Redeem →
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Need {reward.points - stats.currentPoints} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Points History</h2>
              <div className="space-y-3">
                {[
                  { date: 'Today', action: 'Daily check-in', points: 10, type: 'earned' },
                  { date: 'Today', action: 'Morning routine completed', points: 30, type: 'earned' },
                  { date: 'Yesterday', action: 'Purchase: C-Tetra Serum', points: 85, type: 'earned' },
                  { date: '3 days ago', action: '7-day streak bonus', points: 100, type: 'earned' },
                  { date: '5 days ago', action: 'Redeemed: 20% off products', points: -300, type: 'spent' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                    <span className={`font-bold ${
                      item.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'earned' ? '+' : ''}{item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reward Redemption Modal */}
        {selectedReward && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
               onClick={() => setSelectedReward(null)}>
            <div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4">Redeem Reward</h3>
              <div className="mb-6">
                <h4 className="font-semibold text-lg">{selectedReward.name}</h4>
                <p className="text-gray-600 mt-2">{selectedReward.description}</p>
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Cost:</span>
                    <span className="font-bold text-lg">{selectedReward.points} points</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700">Your balance:</span>
                    <span className="font-bold text-lg">{stats.currentPoints} points</span>
                  </div>
                  <div className="border-t mt-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">After redemption:</span>
                      <span className="font-bold text-lg text-purple-600">
                        {stats.currentPoints - selectedReward.points} points
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedReward(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium
                           hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRedeemReward(selectedReward)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500
                           text-white rounded-lg font-medium hover:scale-105 transition-transform"
                >
                  Confirm Redemption
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}