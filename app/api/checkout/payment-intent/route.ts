import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer, isStripeConfigured } from '@/app/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
        { status: 500 }
      );
    }

    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Failed to initialize Stripe' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { amount, items, customerEmail, customerName, shipping } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create line items for metadata
    const lineItems = items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'aud',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderItems: JSON.stringify(lineItems),
        itemCount: items.length.toString(),
      },
      description: `Skin Societé order - ${items.length} items`,
      receipt_email: customerEmail,
      shipping: shipping ? {
        name: customerName || '',
        address: {
          line1: shipping.address || '',
          city: shipping.city || '',
          state: shipping.state || '',
          postal_code: shipping.postcode || '',
          country: 'AU',
        },
      } : undefined,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
      return NextResponse.json(
        { error: (error as any).message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}