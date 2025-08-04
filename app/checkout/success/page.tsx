"use client";

import { Suspense } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { CheckCircle } from 'lucide-react';

function CheckoutSuccessContent() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Successful!</h1>
          <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been received.</p>
        </div>
      </div>
    </MainLayout>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}