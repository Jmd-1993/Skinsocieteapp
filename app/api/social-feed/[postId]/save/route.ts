import { NextRequest, NextResponse } from 'next/server';
import { SocialFeedService } from '@/app/lib/social-feed-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    
    const result = await SocialFeedService.savePost(postId);
    
    return NextResponse.json({
      success: true,
      message: 'Post save toggled successfully'
    });
    
  } catch (error) {
    console.error('Save post API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save post' },
      { status: 500 }
    );
  }
}