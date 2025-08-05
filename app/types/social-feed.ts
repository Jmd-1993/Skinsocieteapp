export type PostType = 'ROUTINE' | 'PROGRESS' | 'TIP' | 'REVIEW' | 'CHALLENGE' | 'BEFORE_AFTER' | 'TUTORIAL';

export type PostCategory = 'SKINCARE' | 'MAKEUP' | 'WELLNESS' | 'LIFESTYLE' | 'PRODUCTS' | 'TREATMENTS';

export interface PostImage {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  isMain?: boolean; // For carousel posts, indicates main/cover image
}

export interface PostProduct {
  id: string;
  name: string;
  brand: string;
  price?: number;
  image?: string;
  purchaseUrl?: string;
}

export interface PostTag {
  id: string;
  name: string;
  category: PostCategory;
  color?: string;
}

export interface PostUser {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatar?: string;
  tier: string;
  isVerified?: boolean;
  isInfluencer?: boolean;
  followerCount?: number;
}

export interface PostComment {
  id: string;
  userId: string;
  user: PostUser;
  content: string;
  createdAt: string;
  likes: number;
  replies?: PostComment[];
  isLikedByCurrentUser?: boolean;
}

export interface PostInteractions {
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  views: number;
  isLikedByCurrentUser: boolean;
  isSavedByCurrentUser: boolean;
  isFollowingAuthor: boolean;
}

export interface SocialPost {
  id: string;
  type: PostType;
  category: PostCategory;
  
  // Author information
  author: PostUser;
  
  // Content
  caption: string;
  images: PostImage[];
  products?: PostProduct[]; // Tagged products
  tags?: PostTag[]; // Hashtags and category tags
  
  // Location and context
  location?: string;
  challengeId?: string; // If part of a challenge
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  
  // Interactions
  interactions: PostInteractions;
  
  // Privacy and moderation
  isPrivate: boolean;
  isReported: boolean;
  isFeatured: boolean;
  moderationStatus: 'approved' | 'pending' | 'rejected';
  
  // Algorithm and discovery
  engagementScore: number; // For ranking in feed
  trendingScore: number; // For trending posts
  qualityScore: number; // Content quality assessment
}

export interface FeedFilter {
  type?: PostType[];
  category?: PostCategory[];
  tags?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  authors?: string[]; // User IDs
  minEngagement?: number;
  onlyFollowing?: boolean;
  onlyFeatured?: boolean;
}

export interface FeedSort {
  by: 'recent' | 'popular' | 'trending' | 'engagement' | 'quality';
  direction: 'asc' | 'desc';
}

export interface CreatePostRequest {
  type: PostType;
  category: PostCategory;
  caption: string;
  images: File[]; // Will be converted to PostImage[] after upload
  products?: string[]; // Product IDs to tag
  tags?: string[]; // Tag names/hashtags
  location?: string;
  challengeId?: string;
  isPrivate?: boolean;
}

export interface PostDraft {
  id: string;
  userId: string;
  data: Partial<CreatePostRequest>;
  createdAt: string;
  lastModified: string;
}

// Feed state management
export interface FeedState {
  posts: SocialPost[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  filter: FeedFilter;
  sort: FeedSort;
  page: number;
  totalPosts: number;
}

// User social stats
export interface UserSocialStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  averageQualityScore: number;
}

// Community engagement rewards
export interface EngagementReward {
  action: 'post_created' | 'like_received' | 'comment_received' | 'follow_received' | 'post_featured';
  points: number;
  description: string;
  multiplier?: number; // For VIP tiers
}