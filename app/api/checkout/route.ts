import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// For now using test keys - we'll update with real ones later
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    // Create line items for Stripe
    const lineItems = items.map((item: { id: string; name: string; description?: string; price: number; quantity: number }) => ({
      price_data: {
        currency: 'aud',
        product_data: {
          name: item.name,
          description: item.description,
          images: [], // We'll add product images later
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        // Add user info and order details
        userId: 'temp-user', // We'll replace with real user ID when Clerk is set up
      },
      // Enable shipping for beauty products
      shipping_address_collection: {
        allowed_countries: ['AU'],
      },
      // Add shipping options for Australia
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 995, // $9.95 standard shipping
              currency: 'aud',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1995, // $19.95 express shipping
              currency: 'aud',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 3,
              },
            },
          },
        },
      ],
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}