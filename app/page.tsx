"use client";

import { AppWrapper } from "./components/AppWrapper";
import { MainLayout } from "./components/layout/MainLayout";
import { 
  Sparkles, 
  Star, 
  Calendar, 
  ShoppingBag, 
  TrendingUp,
  Award,
  Clock,
  Plus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AddToCartButton } from "./components/products/AddToCartButton";
import { ProductCard } from "./components/products/ProductCard";
import { useAuth } from "./lib/auth-context";

function HomePage() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products?featured=true');
        const data = await response.json();
        setFeaturedProducts(data.slice(0, 4)); // Show only 4 featured products
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-6 text-white animate-in slide-in-from-top duration-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.firstName || 'Beauty'}!
              </h1>
              <p className="text-pink-100 mb-4">
                You&apos;re on track for amazing skin transformation
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">{user?.totalPoints?.toLocaleString() || '0'} points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">{user?.loyaltyTier || 'Glow Starter'}</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="h-10 w-10 text-yellow-300 fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 animate-in slide-in-from-left duration-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-xl font-bold text-gray-900">{user?.currentStreak || 0} days</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 animate-in slide-in-from-left duration-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-xl font-bold text-gray-900">85%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 animate-in slide-in-from-left duration-1000 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 animate-in slide-in-from-left duration-1200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Visits</p>
                <p className="text-xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Routine */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Daily Routine</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Morning cleanse</span>
                </div>
                <span className="text-xs text-green-600 font-medium">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Vitamin C serum</span>
                </div>
                <span className="text-xs text-green-600 font-medium">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">Evening routine</span>
                </div>
                <button className="text-xs text-pink-600 font-medium hover:text-pink-700">
                  Mark Done
                </button>
              </div>
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-2">
              <div className="bg-pink-500 h-2 rounded-full w-2/3"></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">66% complete today</p>
          </div>

          {/* Quick Booking */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Quick Booking</h3>
            <div className="space-y-3">
              <Link
                href="/appointments"
                className="flex items-center justify-between p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">Hydrating Facial</p>
                  <p className="text-sm text-gray-600">60 min • $180</p>
                </div>
                <Plus className="h-5 w-5 text-pink-600" />
              </Link>
              <Link
                href="/appointments"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">Carbon Laser</p>
                  <p className="text-sm text-gray-600">45 min • $220</p>
                </div>
                <Plus className="h-5 w-5 text-blue-600" />
              </Link>
            </div>
            <Link
              href="/appointments"
              className="block w-full mt-4 text-center py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 animate-in slide-in-from-bottom duration-1000">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Featured Products</h3>
              <p className="text-sm text-gray-600">Premium Medik8 skincare at 15% below RRP</p>
            </div>
            <Link
              href="/products"
              className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center gap-1"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    rrp: product.compareAtPrice,
                    featured: true,
                    category: typeof product.category === 'object' ? product.category.name : product.category,
                    brand: typeof product.brand === 'object' ? product.brand : { name: product.brand },
                    benefits: [
                      "Premium Medik8 formula",
                      "Clinically proven results",
                      "Loss-leader pricing",
                      "Professional grade skincare"
                    ],
                    usage: "Apply as directed. Follow with SPF in the morning.",
                    skinType: ["All Skin Types"]
                  }}
                  className="transform hover:scale-105"
                />
              ))
            ) : (
              // Loading state
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center animate-pulse">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-2/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Challenges */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Active Challenges</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div>
                <p className="font-medium">7-Day Glow Challenge</p>
                <p className="text-sm text-gray-600">Complete daily routine for a week</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-600">5/7</p>
                <p className="text-xs text-gray-600">+200 points</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div>
                <p className="font-medium">Shopping Spree</p>
                <p className="text-sm text-gray-600">Spend $100 this month</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">$67</p>
                <p className="text-xs text-gray-600">+150 points</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function Home() {
  return (
    <AppWrapper>
      <HomePage />
    </AppWrapper>
  );
}
