import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (in production, use a database)
const userLikes = new Map<string, Set<string>>(); // userId -> Set of postIds

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
      return NextResponse.json(
        { success: false, error: 'Post already liked' },
        { status: 400 }
      );
    }
    
    userLikesSet.add(postId);
    
    // In real app, you'd also update the post's like count in the database
    
    return NextResponse.json({
      success: true,
      message: 'Post liked successfully'
    });
    
  } catch (error) {
    console.error('Like post API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const userId = 'current-user'; // In real app, get from authenticated session
    
    const userLikesSet = userLikes.get(userId);
    
    if (!userLikesSet || !userLikesSet.has(postId)) {
      return NextResponse.json(
        { success: false, error: 'Post not liked' },
        { status: 400 }
      );
    }
    
    userLikesSet.delete(postId);
    
    return NextResponse.json({
      success: true,
      message: 'Post unliked successfully'
    });
    
  } catch (error) {
    console.error('Unlike post API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}