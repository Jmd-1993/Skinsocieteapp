import { NextRequest, NextResponse } from 'next/server';
import { SocialFeedService, PostFilters, PostSort } from '@/app/lib/social-feed-service';
import { PostType, PostCategory } from '@/app/types/social-feed';

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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    
    // Parse filters
    const filters: PostFilters = {};
    
    const typeFilter = searchParams.get('type')?.split(',') as PostType[];
    if (typeFilter?.length) filters.type = typeFilter;
    
    const categoryFilter = searchParams.get('category')?.split(',') as PostCategory[];
    if (categoryFilter?.length) filters.category = categoryFilter;
    
    const tagsFilter = searchParams.get('tags')?.split(',');
    if (tagsFilter?.length) filters.hashtags = tagsFilter;
    
    if (searchParams.get('onlyFeatured') === 'true') {
      filters.onlyFeatured = true;
    }
    
    if (searchParams.get('onlyFollowing') === 'true') {
      filters.onlyFollowing = true;
    }
    
    const userId = searchParams.get('userId');
    if (userId) filters.userId = userId;
    
    const challengeId = searchParams.get('challengeId');
    if (challengeId) filters.challengeId = challengeId;
    
    // Build sort object
    const sort: PostSort = {
      by: sortBy as PostSort['by'],
      direction: sortDirection as 'asc' | 'desc'
    };
    
    // Get posts from database
    const posts = await SocialFeedService.getPosts(filters, sort, page, limit);
    
    // Transform posts to match frontend interface
    const transformedPosts = posts.map(post => ({
      id: post.id,
      type: post.type.toLowerCase(),
      category: post.category.toLowerCase(),
      author: {
        id: post.user.id,
        firstName: post.user.profile?.firstName || 'User',
        lastName: post.user.profile?.lastName || '',
        username: post.user.profile?.firstName?.toLowerCase() || 'user',
        avatar: '/api/placeholder/40/40',
        tier: post.user.profile?.loyaltyTier?.name || 'Glow Starter',
        isVerified: false,
        followerCount: 0
      },
      caption: post.caption,
      images: post.images.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt || '',
        isMain: img.isMain
      })),
      products: post.products?.map(pp => ({
        id: pp.product.id,
        name: pp.product.name,
        brand: typeof pp.product.brand === 'object' ? pp.product.brand : { name: 'Brand' },
        price: Number(pp.product.price),
        image: pp.product.featuredImage
      })) || [],
      tags: post.hashtags.map((tag, index) => ({
        id: `tag-${index}`,
        name: tag,
        category: post.category.toLowerCase()
      })),
      location: post.location,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      isEdited: false,
      interactions: {
        likes: post._count.likes,
        comments: post._count.comments,
        saves: post._count.saves,
        shares: post._count.shares,
        views: post.views,
        isLikedByCurrentUser: post.likes?.length > 0,
        isSavedByCurrentUser: post.saves?.length > 0,
        isFollowingAuthor: false
      },
      isPrivate: post.isPrivate,
      isReported: post.isReported,
      isFeatured: post.isFeatured,
      moderationStatus: post.moderationStatus.toLowerCase(),
      engagementScore: post.engagementScore,
      trendingScore: post.trendingScore,
      qualityScore: post.qualityScore
    }));
    
    const hasMore = transformedPosts.length === limit;
    
    return NextResponse.json({
      success: true,
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total: transformedPosts.length,
        hasMore
      },
      hasMore
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
    const type = formData.get('type') as PostType || 'ROUTINE';
    const caption = formData.get('caption') as string || '';
    const location = formData.get('location') as string || '';
    const tagsString = formData.get('tags') as string || '[]';
    const hashtags = JSON.parse(tagsString);
    const isPrivate = formData.get('isPrivate') === 'true';
    const challengeId = formData.get('challengeId') as string || undefined;
    
    // Handle image uploads
    const imageFiles = formData.getAll('images') as File[];
    const images = imageFiles.filter(file => file && file.size > 0);
    
    // Extract product IDs if any
    const productIdsString = formData.get('productIds') as string || '[]';
    const productIds = JSON.parse(productIdsString);
    
    // Create post using service
    const post = await SocialFeedService.createPost({
      type: type.toUpperCase() as PostType,
      caption,
      hashtags,
      location: location || undefined,
      images,
      productIds: productIds.length > 0 ? productIds : undefined,
      challengeId,
      isPrivate,
    });
    
    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        type: post.type.toLowerCase(),
        category: post.category.toLowerCase(),
        author: {
          id: post.user.id,
          firstName: post.user.profile?.firstName || 'User',
          lastName: post.user.profile?.lastName || '',
          username: post.user.profile?.firstName?.toLowerCase() || 'user',
          avatar: '/api/placeholder/40/40',
          tier: post.user.profile?.loyaltyTier?.name || 'Glow Starter',
          isVerified: false,
          followerCount: 0
        },
        caption: post.caption,
        images: post.images.map(img => ({
          id: img.id,
          url: img.url,
          alt: img.alt || '',
          isMain: img.isMain
        })),
        tags: post.hashtags.map((tag, index) => ({
          id: `tag-${index}`,
          name: tag,
          category: post.category.toLowerCase()
        })),
        location: post.location,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        isEdited: false,
        interactions: {
          likes: post._count.likes,
          comments: post._count.comments,
          saves: post._count.saves,
          shares: post._count.shares,
          views: post.views,
          isLikedByCurrentUser: false,
          isSavedByCurrentUser: false,
          isFollowingAuthor: false
        },
        isPrivate: post.isPrivate,
        isReported: post.isReported,
        isFeatured: post.isFeatured,
        moderationStatus: post.moderationStatus.toLowerCase(),
        engagementScore: post.engagementScore,
        trendingScore: post.trendingScore,
        qualityScore: post.qualityScore
      },
      message: 'Post created successfully'
    });
    
  } catch (error) {
    console.error('Create post API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}