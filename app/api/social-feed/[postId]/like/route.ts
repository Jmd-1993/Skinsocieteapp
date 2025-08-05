import { NextRequest, NextResponse } from 'next/server';

// Fallback in-memory storage for demo
const userLikes = new Map<string, Set<string>>();

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const userId = 'current-user'; // In real app, get from authenticated session
    
    if (!userLikes.has(userId)) {
      userLikes.set(userId, new Set());
    }
    
    const userLikesSet = userLikes.get(userId)!;
    
    if (userLikesSet.has(postId)) {
      userLikesSet.delete(postId);
    } else {
      userLikesSet.add(postId);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Post like toggled successfully'
    });
    
  } catch (error) {
    console.error('Like post API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like post' },
      { status: 500 }
    );
  }
}