import { prisma } from './db';
import { uploadImage, deleteImage } from './cloudinary';
import { currentUser } from '@clerk/nextjs/server';
import { PostType, PostCategory } from '@/app/types/social-feed';

export interface CreatePostData {
  type: PostType;
  caption: string;
  hashtags?: string[];
  location?: string;
  images?: File[];
  productIds?: string[];
  challengeId?: string;
  isPrivate?: boolean;
}

export interface PostFilters {
  type?: PostType[];
  category?: PostCategory[];
  hashtags?: string[];
  userId?: string;
  challengeId?: string;
  onlyFeatured?: boolean;
  onlyFollowing?: boolean;
}

export interface PostSort {
  by: 'recent' | 'popular' | 'trending' | 'engagement' | 'quality';
  direction: 'asc' | 'desc';
}

export class SocialFeedService {
  static async createPost(data: CreatePostData) {
    const user = await currentUser();
    if (!user) throw new Error('User not authenticated');

    // Get or create user profile
    const userProfile = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { profile: true }
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Upload images to Cloudinary
    const uploadedImages = [];
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const file = data.images[i];
        const uploadResult = await uploadImage(file, 'social-feed');
        uploadedImages.push({
          url: uploadResult.secure_url,
          alt: `User uploaded image ${i + 1}`,
          width: uploadResult.width,
          height: uploadResult.height,
          size: uploadResult.bytes,
          order: i,
          isMain: i === 0,
        });
      }
    }

    // Determine category based on type
    let category: PostCategory = 'SKINCARE';
    if (data.type === 'REVIEW') category = 'PRODUCTS';
    if (data.type === 'TUTORIAL') category = 'TREATMENTS';

    // Extract hashtags from caption
    const captionHashtags = data.caption.match(/#\w+/g) || [];
    const allHashtags = [
      ...captionHashtags.map(tag => tag.substring(1)),
      ...(data.hashtags || [])
    ];

    // Create post
    const post = await prisma.socialPost.create({
      data: {
        userId: userProfile.id,
        type: data.type,
        category,
        caption: data.caption,
        hashtags: allHashtags,
        location: data.location,
        isPrivate: data.isPrivate || false,
        challengeId: data.challengeId,
        views: 1, // Creator view
        images: {
          create: uploadedImages,
        },
        products: data.productIds ? {
          create: data.productIds.map((productId, index) => ({
            productId,
            order: index,
          })),
        } : undefined,
      },
      include: {
        user: {
          include: { profile: true }
        },
        images: true,
        products: {
          include: { product: true }
        },
        likes: true,
        comments: {
          include: {
            user: { include: { profile: true } },
            likes: true,
          }
        },
        saves: true,
        shares: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            saves: true,
            shares: true,
          }
        }
      },
    });

    // Update engagement scores
    await this.updateEngagementScores(post.id);

    return post;
  }

  static async getPosts(
    filters: PostFilters = {},
    sort: PostSort = { by: 'recent', direction: 'desc' },
    page: number = 0,
    limit: number = 10
  ) {
    const user = await currentUser();
    const currentUserId = user?.id;

    // Build where clause
    const where: any = {
      moderationStatus: 'APPROVED',
      isPrivate: false,
    };

    if (filters.type?.length) {
      where.type = { in: filters.type };
    }

    if (filters.category?.length) {
      where.category = { in: filters.category };
    }

    if (filters.hashtags?.length) {
      where.hashtags = {
        hasSome: filters.hashtags,
      };
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.challengeId) {
      where.challengeId = filters.challengeId;
    }

    if (filters.onlyFeatured) {
      where.isFeatured = true;
    }

    if (filters.onlyFollowing && currentUserId) {
      // Get user's following list
      const userProfile = await prisma.user.findUnique({
        where: { clerkId: currentUserId },
        include: {
          following: {
            select: { followingId: true }
          }
        }
      });

      if (userProfile) {
        const followingIds = userProfile.following.map(f => f.followingId);
        where.userId = { in: followingIds };
      }
    }

    // Build order clause
    let orderBy: any = {};
    switch (sort.by) {
      case 'popular':
        orderBy = { engagementScore: sort.direction };
        break;
      case 'trending':
        orderBy = { trendingScore: sort.direction };
        break;
      case 'quality':
        orderBy = { qualityScore: sort.direction };
        break;
      case 'engagement':
        orderBy = { engagementScore: sort.direction };
        break;
      default:
        orderBy = { createdAt: sort.direction };
    }

    const posts = await prisma.socialPost.findMany({
      where,
      orderBy,
      skip: page * limit,
      take: limit,
      include: {
        user: {
          include: { profile: true }
        },
        images: {
          orderBy: { order: 'asc' }
        },
        products: {
          include: { product: true },
          orderBy: { order: 'asc' }
        },
        likes: currentUserId ? {
          where: {
            user: { clerkId: currentUserId }
          }
        } : false,
        saves: currentUserId ? {
          where: {
            user: { clerkId: currentUserId }
          }
        } : false,
        comments: {
          include: {
            user: { include: { profile: true } },
            likes: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 3, // Only get first 3 comments
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            saves: true,
            shares: true,
          }
        }
      },
    });

    return posts;
  }

  static async likePost(postId: string) {
    const user = await currentUser();
    if (!user) throw new Error('User not authenticated');

    const userProfile = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!userProfile) throw new Error('User profile not found');

    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: userProfile.id,
          postId,
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      });
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          userId: userProfile.id,
          postId,
        }
      });

      // Create notification for post author
      const post = await prisma.socialPost.findUnique({
        where: { id: postId },
        select: { userId: true }
      });

      if (post && post.userId !== userProfile.id) {
        await prisma.notification.create({
          data: {
            userId: post.userId,
            type: 'LIKE',
            title: 'New Like',
            message: `${userProfile.profile?.firstName || 'Someone'} liked your post`,
            fromUserId: userProfile.id,
            postId,
          }
        });
      }
    }

    // Update engagement scores
    await this.updateEngagementScores(postId);

    return { success: true };
  }

  static async savePost(postId: string) {
    const user = await currentUser();
    if (!user) throw new Error('User not authenticated');

    const userProfile = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!userProfile) throw new Error('User profile not found');

    const existingSave = await prisma.postSave.findUnique({
      where: {
        userId_postId: {
          userId: userProfile.id,
          postId,
        }
      }
    });

    if (existingSave) {
      // Unsave
      await prisma.postSave.delete({
        where: { id: existingSave.id }
      });
    } else {
      // Save
      await prisma.postSave.create({
        data: {
          userId: userProfile.id,
          postId,
        }
      });
    }

    return { success: true };
  }

  static async addComment(postId: string, content: string, parentId?: string) {
    const user = await currentUser();
    if (!user) throw new Error('User not authenticated');

    const userProfile = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!userProfile) throw new Error('User profile not found');

    const comment = await prisma.postComment.create({
      data: {
        userId: userProfile.id,
        postId,
        content,
        parentId,
      },
      include: {
        user: { include: { profile: true } },
        likes: true,
      }
    });

    // Create notification for post author
    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (post && post.userId !== userProfile.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'COMMENT',
          title: 'New Comment',
          message: `${userProfile.profile?.firstName || 'Someone'} commented on your post`,
          fromUserId: userProfile.id,
          postId,
          commentId: comment.id,
        }
      });
    }

    // Update engagement scores
    await this.updateEngagementScores(postId);

    return comment;
  }

  static async sharePost(postId: string, platform?: string) {
    const user = await currentUser();
    if (!user) throw new Error('User not authenticated');

    const userProfile = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!userProfile) throw new Error('User profile not found');

    await prisma.postShare.create({
      data: {
        userId: userProfile.id,
        postId,
        platform,
      }
    });

    // Update engagement scores
    await this.updateEngagementScores(postId);

    return { success: true };
  }

  static async followUser(userId: string) {
    const user = await currentUser();
    if (!user) throw new Error('User not authenticated');

    const userProfile = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!userProfile) throw new Error('User profile not found');

    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userProfile.id,
          followingId: userId,
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.userFollow.delete({
        where: { id: existingFollow.id }
      });
    } else {
      // Follow
      await prisma.userFollow.create({
        data: {
          followerId: userProfile.id,
          followingId: userId,
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: userId,
          type: 'FOLLOW',
          title: 'New Follower',
          message: `${userProfile.profile?.firstName || 'Someone'} started following you`,
          fromUserId: userProfile.id,
        }
      });
    }

    return { success: true };
  }

  private static async updateEngagementScores(postId: string) {
    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            saves: true,
            shares: true,
          }
        }
      }
    });

    if (!post) return;

    const { likes, comments, saves, shares } = post._count;
    const views = post.views;
    const ageInHours = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, 
      (likes * 1 + comments * 2 + saves * 1.5 + shares * 3) / Math.max(1, views) * 100
    );

    // Calculate trending score (time-weighted engagement)
    const trendingScore = engagementScore * Math.exp(-ageInHours / 24);

    // Calculate quality score based on various factors
    const qualityScore = Math.min(100,
      50 + // Base score
      (post.caption.length > 50 ? 10 : 0) + // Good caption
      (post.hashtags.length > 0 ? 10 : 0) + // Has hashtags
      (post.images.length > 0 ? 20 : 0) + // Has images
      (comments > likes * 0.1 ? 10 : 0) // Good comment ratio
    );

    await prisma.socialPost.update({
      where: { id: postId },
      data: {
        engagementScore,
        trendingScore,
        qualityScore,
      }
    });
  }

  static async incrementViews(postId: string) {
    await prisma.socialPost.update({
      where: { id: postId },
      data: {
        views: { increment: 1 }
      }
    });
  }
}