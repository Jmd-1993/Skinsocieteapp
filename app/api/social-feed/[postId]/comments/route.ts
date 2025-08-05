import { NextRequest, NextResponse } from 'next/server';

// Fallback in-memory storage for demo
const postComments = new Map<string, any[]>();

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const comments = postComments.get(postId) || [];
    
    return NextResponse.json({
      success: true,
      comments,
      hasMore: false,
    });
    
  } catch (error) {
    console.error('Get comments API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const { content } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    const newComment = {
      id: `comment-${Date.now()}`,
      user: {
        id: 'current-user',
        firstName: 'You',
        lastName: '',
        username: 'you',
        avatar: '/api/placeholder/32/32',
        tier: 'Beauty Enthusiast',
        isVerified: false,
      },
      content: content.trim(),
      likes: 0,
      repliesCount: 0,
      replies: [],
      createdAt: new Date().toISOString(),
      isEdited: false,
    };
    
    const comments = postComments.get(postId) || [];
    comments.unshift(newComment);
    postComments.set(postId, comments);
    
    return NextResponse.json({
      success: true,
      comment: newComment,
      message: 'Comment added successfully'
    });
    
  } catch (error) {
    console.error('Add comment API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}