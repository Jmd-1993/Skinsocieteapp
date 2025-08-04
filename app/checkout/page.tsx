"use client";

import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useCartStore } from '../lib/cart';
import { Truck, Shield, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getTotalPrice();
  const shipping = 9.95; // Standard shipping
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate checkout process for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and redirect to success page
      clearCart();
      window.location.href = '/checkout/success';
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some amazing skincare products to get started!</p>
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/cart"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Cart
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 h-fit">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🧴</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${total.toFixed(2)} AUD</span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>Fast Shipping</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-6">Payment Details</h2>
            
            {/* Stripe Checkout Info */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-5 w-5 text-pink-600" />
                <span className="font-medium text-gray-900">Secure Stripe Checkout</span>
              </div>
              <p className="text-sm text-gray-600">
                You'll be redirected to Stripe's secure payment page to complete your purchase.
                We accept all major credit cards and payment methods.
              </p>
            </div>

            {/* Shipping Information */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">🚚 Shipping Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Standard Shipping: 3-7 business days ($9.95)</p>
                <p>• Express Shipping: 1-3 business days ($19.95)</p>
                <p>• Free shipping on orders over $100</p>
                <p>• Australia-wide delivery</p>
              </div>
            </div>

            {/* Checkout Button */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Complete Purchase - ${total.toFixed(2)} AUD
                </div>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By completing your purchase, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}