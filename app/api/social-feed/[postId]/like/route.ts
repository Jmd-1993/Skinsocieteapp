import { NextRequest, NextResponse } from 'next/server';
import { SocialFeedService } from '@/app/lib/social-feed-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    
    const result = await SocialFeedService.likePost(postId);
    
    return NextResponse.json({
      success: true,
      message: 'Post like toggled successfully'
    });
    
  } catch (error) {
    console.error('Like post API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to like post' },
      { status: 500 }
    );
  }
}