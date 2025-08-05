import { NextRequest, NextResponse } from 'next/server';
import { SocialPost, PostType, PostCategory, FeedFilter, FeedSort } from '@/app/types/social-feed';

// In-memory storage for demo (in production, use a database)
const postsStore = new Map<string, SocialPost>();
const userInteractions = new Map<string, { likes: Set<string>, saves: Set<string> }>();

// Initialize with some demo posts
function initializeDemoPosts() {
  if (postsStore.size > 0) return; // Already initialized
  
  const demoPosts: SocialPost[] = [
    {
      id: 'post-1',
      type: 'routine',
      category: 'skincare',
      author: {
        id: 'user-1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        username: 'glowwithsarah',
        avatar: '/api/placeholder/40/40',
        tier: 'Beauty Enthusiast',
        isVerified: true,
        followerCount: 1200
      },
      caption: '✨ My evening routine that changed everything! After 6 weeks of consistency, my skin has never looked better. The key is patience and finding what works for YOUR skin type 💕\n\n#skincare #glowup #routine #selflove',
      images: [
        {
          id: 'img-1',
          url: '/api/placeholder/400/500',
          alt: 'Evening skincare routine flatlay',
          isMain: true
        },
        {
          id: 'img-2', 
          url: '/api/placeholder/400/500',
          alt: 'Before and after comparison'
        }
      ],
      products: [
        {
          id: 'prod-1',
          name: 'Gentle Cleanser',
          brand: 'CeraVe',
          price: 15.99,
          image: '/api/placeholder/60/60'
        },
        {
          id: 'prod-2',
          name: 'Vitamin C Serum',
          brand: 'The Ordinary', 
          price: 9.90,
          image: '/api/placeholder/60/60'
        }
      ],
      tags: [
        { id: 'tag-1', name: 'skincare', category: 'skincare' },
        { id: 'tag-2', name: 'routine', category: 'skincare' },
        { id: 'tag-3', name: 'glowup', category: 'skincare' }
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isEdited: false,
      interactions: {
        likes: 89,
        comments: 23,
        saves: 45,
        shares: 12,
        views: 567,
        isLikedByCurrentUser: false,
        isSavedByCurrentUser: false,
        isFollowingAuthor: false
      },
      isPrivate: false,
      isReported: false,
      isFeatured: true,
      moderationStatus: 'approved',
      engagementScore: 92,
      trendingScore: 85,
      qualityScore: 88
    },
    {
      id: 'post-2',
      type: 'progress',
      category: 'skincare',
      author: {
        id: 'user-2',
        firstName: 'Emma',
        lastName: 'Chen',
        username: 'emmaskinglow',
        avatar: '/api/placeholder/40/40',
        tier: 'Skincare Guru',
        isVerified: false,
        followerCount: 850
      },
      caption: '6 months progress update! 🙌 Consistency really is key. Started with severe acne and now I feel confident going makeup-free!\n\nProducts that helped:\n• Salicylic acid cleanser\n• Niacinamide serum  \n• Moisturizer with SPF\n\n#acnejourney #skincareprogress #confidence',
      images: [
        {
          id: 'img-3',
          url: '/api/placeholder/400/600',
          alt: 'Before and after acne progress',
          isMain: true
        }
      ],
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isEdited: false,
      interactions: {
        likes: 156,
        comments: 42,
        saves: 78,
        shares: 28,
        views: 892,
        isLikedByCurrentUser: true,
        isSavedByCurrentUser: false,
        isFollowingAuthor: true
      },
      isPrivate: false,
      isReported: false,
      isFeatured: false,
      moderationStatus: 'approved',
      engagementScore: 88,
      trendingScore: 92,
      qualityScore: 85
    },
    {
      id: 'post-3',
      type: 'tip',
      category: 'makeup',
      author: {
        id: 'user-3',
        firstName: 'Maya',
        lastName: 'Rodriguez',
        username: 'mayamakeup',
        avatar: '/api/placeholder/40/40',
        tier: 'VIP Goddess',
        isVerified: true,
        isInfluencer: true,
        followerCount: 3400
      },
      caption: '💡 Pro tip: Apply your concealer in a triangle shape under your eyes instead of just on dark circles! This technique brightens your whole under-eye area and creates a lifting effect ✨\n\nTry it and let me know what you think! 👇\n\n#makeuptips #concealer #beauty #tutorial',
      images: [
        {
          id: 'img-4',
          url: '/api/placeholder/400/400',
          alt: 'Concealer application technique diagram',
          isMain: true
        }
      ],
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      isEdited: false,
      interactions: {
        likes: 234,
        comments: 67,
        saves: 189,
        shares: 45,
        views: 1234,
        isLikedByCurrentUser: false,
        isSavedByCurrentUser: true,
        isFollowingAuthor: false
      },
      isPrivate: false,
      isReported: false,
      isFeatured: true,
      moderationStatus: 'approved',
      engagementScore: 95,
      trendingScore: 88,
      qualityScore: 92
    }
  ];
  
  demoPosts.forEach(post => postsStore.set(post.id, post));
}

export async function GET(request: NextRequest) {
  try {
    initializeDemoPosts();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    
    // Parse filters
    const typeFilter = searchParams.get('type')?.split(',') as PostType[] || [];
    const categoryFilter = searchParams.get('category')?.split(',') as PostCategory[] || [];
    const tagsFilter = searchParams.get('tags')?.split(',') || [];
    const onlyFeatured = searchParams.get('onlyFeatured') === 'true';
    
    let posts = Array.from(postsStore.values());
    
    // Apply filters
    if (typeFilter.length > 0) {
      posts = posts.filter(post => typeFilter.includes(post.type));
    }
    
    if (categoryFilter.length > 0) {
      posts = posts.filter(post => categoryFilter.includes(post.category));
    }
    
    if (tagsFilter.length > 0) {
      posts = posts.filter(post => 
        post.tags?.some(tag => tagsFilter.includes(tag.name))
      );
    }
    
    if (onlyFeatured) {
      posts = posts.filter(post => post.isFeatured);
    }
    
    // Apply sorting
    posts.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'popular':
          aValue = a.interactions.likes + a.interactions.comments;
          bValue = b.interactions.likes + b.interactions.comments;
          break;
        case 'trending':
          aValue = a.trendingScore;
          bValue = b.trendingScore;
          break;
        case 'engagement':
          aValue = a.engagementScore;
          bValue = b.engagementScore;
          break;
        case 'quality':
          aValue = a.qualityScore;
          bValue = b.qualityScore;
          break;
        default: // recent
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    // Pagination
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = posts.slice(startIndex, endIndex);
    const hasMore = endIndex < posts.length;
    
    return NextResponse.json({
      success: true,
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total: posts.length,
        hasMore
      },
      hasMore // For backward compatibility with the store
    });
    
  } catch (error) {
    console.error('Social feed API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const type = formData.get('type') as PostType || 'routine';
    const caption = formData.get('caption') as string || '';
    const location = formData.get('location') as string || '';
    const tagsString = formData.get('tags') as string || '[]';
    const tags = JSON.parse(tagsString);
    
    // Handle image uploads (in real app, you'd upload to cloud storage)
    const images = [];
    const imageFiles = formData.getAll('images') as File[];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file && file.size > 0) {
        // In real app, upload to cloud storage and get URL
        // For now, use placeholder
        images.push({
          id: `img-${Date.now()}-${i}`,
          url: '/api/placeholder/400/500',
          alt: `User uploaded image ${i + 1}`,
          isMain: i === 0
        });
      }
    }
    
    // In a real app, you'd get this from the authenticated session
    const currentUser = {
      id: 'current-user',
      firstName: 'You',
      lastName: '',
      username: 'you',
      avatar: '/api/placeholder/40/40',
      tier: 'Beauty Enthusiast', 
      isVerified: false,
      followerCount: 0
    };
    
    // Map category based on post type
    let category: PostCategory = 'skincare';
    if (type === 'routine' || type === 'progress' || type === 'tip') {
      category = 'skincare';
    } else if (type === 'review') {
      category = 'products';
    }
    
    // Process tags
    const processedTags = tags.map((tagName: string, index: number) => ({
      id: `tag-${Date.now()}-${index}`,
      name: tagName,
      category: category
    }));
    
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      type,
      category,
      author: currentUser,
      caption,
      images,
      tags: processedTags,
      location: location || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      interactions: {
        likes: 0,
        comments: 0,
        saves: 0,
        shares: 0,
        views: 1,
        isLikedByCurrentUser: false,
        isSavedByCurrentUser: false,
        isFollowingAuthor: false
      },
      isPrivate: false,
      isReported: false,
      isFeatured: false,
      moderationStatus: 'approved',
      engagementScore: 0,
      trendingScore: 0,
      qualityScore: 70
    };
    
    postsStore.set(newPost.id, newPost);
    
    return NextResponse.json({
      success: true,
      post: newPost,
      message: 'Post created successfully'
    });
    
  } catch (error) {
    console.error('Create post API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}