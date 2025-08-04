import { MainLayout } from "../components/layout/MainLayout";
import { TrendingUp, Calendar, Star, Target, Award } from "lucide-react";

export default function ProgressPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
          <p className="text-gray-600">Track your skincare journey and achievements</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Skincare Journey</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">7</div>
              <div className="text-purple-100 text-sm">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">85%</div>
              <div className="text-purple-100 text-sm">Routine Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1,250</div>
              <div className="text-purple-100 text-sm">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-purple-100 text-sm">Goals Achieved</div>
            </div>
          </div>
        </div>

        {/* Daily Routine Tracking */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Today&apos;s Routine</h3>
          <div className="space-y-4">
            {[
              { task: "Morning cleanse", completed: true, points: 25 },
              { task: "Vitamin C serum", completed: true, points: 30 },
              { task: "Moisturizer + SPF", completed: false, points: 35 },
              { task: "Evening cleanse", completed: false, points: 25 },
              { task: "Night serum", completed: false, points: 30 }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={item.completed ? 'text-gray-900' : 'text-gray-600'}>{item.task}</span>
                </div>
                <div className="text-sm text-gray-500">+{item.points} pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Week Warrior", description: "7-day routine streak", icon: "🔥" },
              { title: "Product Expert", description: "Tried 10+ products", icon: "🧴" },
              { title: "Glow Getter", description: "Completed first facial", icon: "✨" }
            ].map((achievement, i) => (
              <div key={i} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}