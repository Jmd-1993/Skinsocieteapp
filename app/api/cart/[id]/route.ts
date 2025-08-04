import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quantity } = await request.json();
    const resolvedParams = await params;
    const cartItemId = resolvedParams.id;

    if (quantity <= 0) {
      // Delete the item if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: {
          id: cartItemId,
          user: {
            clerkId: userId
          }
        }
      });
      
      return NextResponse.json({ message: 'Item removed from cart' });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: {
        id: cartItemId,
        user: {
          clerkId: userId
        }
      },
      data: {
        quantity: quantity
      },
      include: {
        product: {
          include: {
            brand: true,
            category: true
          }
        }
      }
    });

    return NextResponse.json(updatedCartItem);
  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const cartItemId = resolvedParams.id;

    await prisma.cartItem.delete({
      where: {
        id: cartItemId,
        user: {
          clerkId: userId
        }
      }
    });

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}