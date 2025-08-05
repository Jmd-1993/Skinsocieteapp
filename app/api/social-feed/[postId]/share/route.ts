import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    let platform = 'general';
    
    try {
      const body = await request.json();
      platform = body.platform || 'general';
    } catch {
      // Handle case where no JSON body is sent
    }
    
    // Log the share (in real app, this would go to database)
    console.log('Post shared:', { postId, platform, timestamp: new Date().toISOString() });
    
    return NextResponse.json({
      success: true,
      message: 'Post shared successfully',
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://skinsocieteapp.onrender.com'}/post/${postId}`
    });
    
  } catch (error) {
    console.error('Share post API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to share post' },
      { status: 500 }
    );
  }
}