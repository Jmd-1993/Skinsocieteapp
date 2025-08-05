import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (in production, use a database)
const userSaves = new Map<string, Set<string>>(); // userId -> Set of postIds

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const userId = 'current-user'; // In real app, get from authenticated session
    
    if (!userSaves.has(userId)) {
      userSaves.set(userId, new Set());
    }
    
    const userSavesSet = userSaves.get(userId)!;
    
    if (userSavesSet.has(postId)) {
      return NextResponse.json(
        { success: false, error: 'Post already saved' },
        { status: 400 }
      );
    }
    
    userSavesSet.add(postId);
    
    return NextResponse.json({
      success: true,
      message: 'Post saved successfully'
    });
    
  } catch (error) {
    console.error('Save post API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save post' },
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
    
    const userSavesSet = userSaves.get(userId);
    
    if (!userSavesSet || !userSavesSet.has(postId)) {
      return NextResponse.json(
        { success: false, error: 'Post not saved' },
        { status: 400 }
      );
    }
    
    userSavesSet.delete(postId);
    
    return NextResponse.json({
      success: true,
      message: 'Post unsaved successfully'
    });
    
  } catch (error) {
    console.error('Unsave post API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsave post' },
      { status: 500 }
    );
  }
}