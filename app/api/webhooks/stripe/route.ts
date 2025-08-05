import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer, isStripeConfigured } from '@/app/lib/stripe-server';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe webhook is not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
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

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 Payment succeeded:', paymentIntent.id);
        
        // Here you would typically:
        // 1. Create order in database
        // 2. Update inventory
        // 3. Send confirmation email
        // 4. Update user points/rewards
        
        // Extract metadata
        const { orderItems, itemCount } = paymentIntent.metadata;
        const amount = paymentIntent.amount / 100; // Convert from cents
        
        console.log('Order details:', {
          paymentIntentId: paymentIntent.id,
          amount,
          currency: paymentIntent.currency,
          customerEmail: paymentIntent.receipt_email,
          items: orderItems ? JSON.parse(orderItems) : [],
          itemCount,
        });
        
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.error('❌ Payment failed:', failedPayment.id);
        
        // Handle failed payment
        // You might want to notify the customer or update order status
        
        break;

      case 'charge.dispute.created':
        const dispute = event.data.object as Stripe.Dispute;
        console.warn('⚠️ Dispute created:', dispute.id);
        
        // Handle dispute
        // Notify admin, gather evidence, etc.
        
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Stripe webhooks must use raw body
export const runtime = 'nodejs';