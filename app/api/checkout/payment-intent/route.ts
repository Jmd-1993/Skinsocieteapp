import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export async function POST(request: NextRequest) {
  try {
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
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}