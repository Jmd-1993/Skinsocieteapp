"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/app/lib/cart';
import { useAuth } from '@/app/lib/auth-context';
import { MainLayout } from '@/app/components/layout/MainLayout';
import { StripeCheckoutForm } from '@/app/components/checkout/StripeCheckoutForm';

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  paymentMethod: 'card' | 'paypal' | 'afterpay';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  saveDetails: boolean;
  marketing: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);

  const [form, setForm] = useState<CheckoutForm>({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: 'WA',
    postcode: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    saveDetails: false,
    marketing: true
  });

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const shipping = 0; // Free shipping
  const gst = totalPrice * 0.1; // 10% GST
  const finalTotal = totalPrice + shipping + gst;

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      router.push('/products');
    }
  }, [items.length, orderComplete, router]);

  const updateForm = (field: keyof CheckoutForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!form.email || !form.firstName || !form.lastName || !form.address || !form.city || !form.postcode) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent with Stripe
      const response = await fetch('/api/checkout/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          items: items.map(item => ({
            id: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          customerEmail: form.email,
          customerName: `${form.firstName} ${form.lastName}`,
          shipping: {
            address: form.address,
            city: form.city,
            state: form.state,
            postcode: form.postcode,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();
      setStripeClientSecret(clientSecret);
      setShowStripeForm(true);

    } catch (error) {
      console.error('Payment setup failed:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    try {
      // Generate order ID
      const newOrderId = `SS${Date.now().toString().slice(-6)}`;
      setOrderId(newOrderId);

      // Award points for purchase (10% back as points)
      const pointsEarned = Math.floor(finalTotal * 0.1);
      
      // Update user progress with purchase
      await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'demo-user',
          action: 'purchase_made',
          data: {
            amount: finalTotal,
            items: items.length,
            orderId: newOrderId,
            paymentIntentId,
          }
        })
      });

      // Clear cart and show success
      clearCart();
      setOrderComplete(true);
    } catch (error) {
      console.error('Order completion failed:', error);
    }
  };

  const handleStripeError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
    setShowStripeForm(false);
    setStripeClientSecret(null);
  };

  if (orderComplete) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. You've earned <span className="font-semibold text-pink-600">
            {Math.floor(finalTotal * 0.1)} points</span> for this purchase!
          </p>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-500 mb-2">Order Number</p>
            <p className="text-2xl font-bold text-gray-900">{orderId}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Order History
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Complete your order to earn rewards points</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="col-span-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => updateForm('firstName', e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => updateForm('lastName', e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="col-span-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Street address"
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                  <select
                    value={form.state}
                    onChange={(e) => updateForm('state', e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  >
                    <option value="WA">WA</option>
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="QLD">QLD</option>
                    <option value="SA">SA</option>
                    <option value="TAS">TAS</option>
                    <option value="NT">NT</option>
                    <option value="ACT">ACT</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Postcode"
                    value={form.postcode}
                    onChange={(e) => updateForm('postcode', e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            {!showStripeForm ? (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                
                {/* Payment Options */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { id: 'card', name: 'Credit Card', icon: CreditCard },
                    { id: 'paypal', name: 'PayPal', icon: Shield, disabled: true },
                    { id: 'afterpay', name: 'Afterpay', icon: CreditCard }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      disabled={method.disabled}
                      onClick={() => updateForm('paymentMethod', method.id as any)}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        form.paymentMethod === method.id
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : method.disabled
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <method.icon className="h-5 w-5 mx-auto mb-1" />
                      {method.name}
                      {method.disabled && <div className="text-xs">Coming Soon</div>}
                    </button>
                  ))}
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">Secure Payment with Stripe</p>
                  <p>Your payment details will be securely processed by Stripe. We never store your card information.</p>
                </div>

                {/* Options */}
                <div className="mt-6 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.saveDetails}
                      onChange={(e) => updateForm('saveDetails', e.target.checked)}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Save payment details for next time</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.marketing}
                      onChange={(e) => updateForm('marketing', e.target.checked)}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Send me skincare tips and exclusive offers</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Complete Payment</h2>
                
                {/* Customer Info Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                  <p className="font-medium text-gray-900 mb-2">Billing Details</p>
                  <p className="text-gray-600">{form.firstName} {form.lastName}</p>
                  <p className="text-gray-600">{form.email}</p>
                  <p className="text-gray-600">{form.address}</p>
                  <p className="text-gray-600">{form.city}, {form.state} {form.postcode}</p>
                </div>

                {/* Stripe Payment Form */}
                {stripeClientSecret && (
                  <StripeCheckoutForm
                    amount={finalTotal}
                    clientSecret={stripeClientSecret}
                    onSuccess={handleStripeSuccess}
                    onError={handleStripeError}
                  />
                )}

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowStripeForm(false);
                    setStripeClientSecret(null);
                  }}
                  className="w-full mt-4 text-gray-600 py-2 text-sm hover:text-gray-900 transition-colors"
                >
                  ← Back to billing details
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🧴
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 uppercase">{item.brand}</div>
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (10%)</span>
                  <span className="font-medium">${gst.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-pink-600">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Rewards Info */}
              <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-medium text-pink-900">Rewards</span>
                </div>
                <p className="text-sm text-pink-700">
                  You'll earn <span className="font-semibold">{Math.floor(finalTotal * 0.1)} points</span> from this purchase!
                </p>
              </div>

              {/* Complete Order Button */}
              {!showStripeForm && (
                <form onSubmit={handleSubmit} className="mt-6">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium
                             hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Initializing payment...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Proceed to Payment - ${finalTotal.toFixed(2)}
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Security Info */}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Shield className="h-4 w-4" />
                <span>Secure 256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}