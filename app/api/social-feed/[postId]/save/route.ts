import { NextRequest, NextResponse } from 'next/server';

// Fallback in-memory storage for demo
const userSaves = new Map<string, Set<string>>();

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
      userSavesSet.delete(postId);
    } else {
      userSavesSet.add(postId);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Post save toggled successfully'
    });
    
  } catch (error) {
    console.error('Save post API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save post' },
      { status: 500 }
    );
  }
}