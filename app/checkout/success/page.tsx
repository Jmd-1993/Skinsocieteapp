"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '../../components/layout/MainLayout';
import { CheckCircle, Package, Mail, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface OrderDetails {
  id: string;
  status: string;
  amount_total: number;
  customer_email: string;
  created: number;
  shipping?: {
    name: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Fetch order details from Stripe session
      fetch(`/api/checkout/session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setOrderDetails(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching order details:', err);
          setLoading(false);
        });
    }
  }, [sessionId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </MainLayout>
    );
  }

  const orderDate = orderDetails?.created ? new Date(orderDetails.created * 1000) : new Date();
  const orderNumber = orderDetails?.id?.slice(-8).toUpperCase() || 'SS000001';

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Order Confirmed!
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for your purchase! Your skincare journey continues.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order #{orderNumber}</h2>
              <p className="text-sm text-gray-600">
                Placed on {orderDate.toLocaleDateString('en-AU', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${orderDetails ? (orderDetails.amount_total / 100).toFixed(2) : '0.00'} AUD
              </p>
              <p className="text-sm text-green-600 font-medium">✅ Payment Complete</p>
            </div>
          </div>

          {/* Order Status Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-900">Order Placed</p>
              <p className="text-xs text-gray-500">Confirmed</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <Package className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-900">Processing</p>
              <p className="text-xs text-gray-500">1-2 business days</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-2">
                <Package className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Shipped</p>
              <p className="text-xs text-gray-500">3-7 business days</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <p className="text-xs text-gray-500">Track your package</p>
            </div>
          </div>

          {/* Shipping Information */}
          {orderDetails?.shipping && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-2">📦 Shipping Address</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{orderDetails.shipping.name}</p>
                <p>{orderDetails.shipping.address.line1}</p>
                <p>
                  {orderDetails.shipping.address.city}, {orderDetails.shipping.address.state} {orderDetails.shipping.address.postal_code}
                </p>
                <p>{orderDetails.shipping.address.country}</p>
              </div>
            </div>
          )}
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">✨ What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Mail className="h-6 w-6 text-pink-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Email Confirmation</h4>
                <p className="text-sm text-gray-600">
                  Check your inbox for order details and tracking info
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Track Your Order</h4>
                <p className="text-sm text-gray-600">
                  We'll send tracking details once your order ships
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-6 w-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Book a Facial</h4>
                <p className="text-sm text-gray-600">
                  Complement your products with professional treatments
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/products"
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/progress"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
          >
            Track Your Progress
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Gamification Bonus */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mt-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="font-bold text-gray-900 mb-2">Congratulations! You earned points!</h3>
          <p className="text-gray-600 mb-4">
            You've earned <span className="font-bold text-yellow-600">+{orderDetails ? Math.floor(orderDetails.amount_total / 100) : 50} points</span> for this purchase!
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">💎</span>
              <span>Progress toward Radiance Member</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}