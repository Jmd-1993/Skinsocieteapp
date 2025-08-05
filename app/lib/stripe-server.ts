import Stripe from 'stripe';

// Server-side Stripe instance with lazy initialization
let stripeInstance: Stripe | null = null;

export function getStripeServer(): Stripe | null {
  // Only initialize if we have a valid key
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY && 
    process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder' &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_placeholder'
  );
}