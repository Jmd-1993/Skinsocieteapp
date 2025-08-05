import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Stripe configuration
export const STRIPE_CONFIG = {
  // Appearance customization for Stripe Elements
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#ec4899', // Pink-600
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #d1d5db',
        boxShadow: 'none',
        padding: '12px',
      },
      '.Input:focus': {
        border: '2px solid #ec4899',
        boxShadow: '0 0 0 3px rgba(236, 72, 153, 0.1)',
      },
      '.Label': {
        fontWeight: '500',
        marginBottom: '8px',
      },
    },
  },
  // Payment method types to accept
  paymentMethodTypes: ['card', 'afterpay_clearpay'] as const,
};