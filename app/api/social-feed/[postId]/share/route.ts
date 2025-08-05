import { NextRequest, NextResponse } from 'next/server';
import { SocialFeedService } from '@/app/lib/social-feed-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const body = await request.json();
    const { platform } = body;
    
    const result = await SocialFeedService.sharePost(postId, platform);
    
    return NextResponse.json({
      success: true,
      message: 'Post shared successfully',
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/post/${postId}`
    });
    
  } catch (error) {
    console.error('Share post API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to share post' },
      { status: 500 }
    );
  }
}