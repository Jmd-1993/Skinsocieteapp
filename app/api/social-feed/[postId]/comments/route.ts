import { NextRequest, NextResponse } from 'next/server';
import { SocialFeedService } from '@/app/lib/social-feed-service';
import { prisma } from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const comments = await prisma.postComment.findMany({
      where: {
        postId,
        parentId: null, // Only get top-level comments
      },
      include: {
        user: {
          include: { profile: true }
        },
        replies: {
          include: {
            user: { include: { profile: true } },
            likes: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 3, // Only get first 3 replies
        },
        likes: true,
        _count: {
          select: {
            replies: true,
            likes: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: page * limit,
      take: limit,
    });
    
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      user: {
        id: comment.user.id,
        firstName: comment.user.profile?.firstName || 'User',
        lastName: comment.user.profile?.lastName || '',
        username: comment.user.profile?.firstName?.toLowerCase() || 'user',
        avatar: '/api/placeholder/32/32',
        tier: comment.user.profile?.loyaltyTier?.name || 'Glow Starter',
        isVerified: false,
      },
      content: comment.content,
      likes: comment._count.likes,
      repliesCount: comment._count.replies,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        user: {
          id: reply.user.id,
          firstName: reply.user.profile?.firstName || 'User',
          lastName: reply.user.profile?.lastName || '',
          username: reply.user.profile?.firstName?.toLowerCase() || 'user',
          avatar: '/api/placeholder/32/32',
          tier: reply.user.profile?.loyaltyTier?.name || 'Glow Starter',
          isVerified: false,
        },
        content: reply.content,
        likes: reply.likes.length,
        createdAt: reply.createdAt.toISOString(),
        isEdited: reply.isEdited,
      })),
      createdAt: comment.createdAt.toISOString(),
      isEdited: comment.isEdited,
    }));
    
    return NextResponse.json({
      success: true,
      comments: transformedComments,
      hasMore: transformedComments.length === limit,
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
    const { content, parentId } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    const comment = await SocialFeedService.addComment(
      postId, 
      content.trim(), 
      parentId
    );
    
    const transformedComment = {
      id: comment.id,
      user: {
        id: comment.user.id,
        firstName: comment.user.profile?.firstName || 'User',
        lastName: comment.user.profile?.lastName || '',
        username: comment.user.profile?.firstName?.toLowerCase() || 'user',
        avatar: '/api/placeholder/32/32',
        tier: comment.user.profile?.loyaltyTier?.name || 'Glow Starter',
        isVerified: false,
      },
      content: comment.content,
      likes: comment.likes.length,
      repliesCount: 0,
      replies: [],
      createdAt: comment.createdAt.toISOString(),
      isEdited: comment.isEdited,
    };
    
    return NextResponse.json({
      success: true,
      comment: transformedComment,
      message: 'Comment added successfully'
    });
    
  } catch (error) {
    console.error('Add comment API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add comment' },
      { status: 500 }
    );
  }
}