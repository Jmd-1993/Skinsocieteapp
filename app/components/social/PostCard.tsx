"use client";

import { useState } from 'react';
import { SocialPost } from '@/app/types/social-feed';
import { useSocialFeedStore } from '@/app/lib/social-feed-store';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal, 
  MapPin,
  ShoppingBag,
  Verified,
  Crown,
  Flame
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface PostCardProps {
  post: SocialPost;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const { likePost, unlikePost, savePost, unsavePost, sharePost } = useSocialFeedStore();

  const handleLike = () => {
    if (post.interactions.isLikedByCurrentUser) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };

  const handleSave = () => {
    if (post.interactions.isSavedByCurrentUser) {
      unsavePost(post.id);
    } else {
      savePost(post.id);
    }
  };

  const handleShare = async () => {
    await sharePost(post.id);
    // Could open a share modal here
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'VIP Goddess': return <Crown className="h-3 w-3 text-purple-500" />;
      case 'Skincare Guru': return <Flame className="h-3 w-3 text-blue-500" />;
      case 'Beauty Enthusiast': return <Heart className="h-3 w-3 text-pink-500" />;
      default: return null;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'VIP Goddess': return 'text-purple-600';
      case 'Skincare Guru': return 'text-blue-600';
      case 'Beauty Enthusiast': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const getPostTypeEmoji = (type: string) => {
    switch (type) {
      case 'routine': return '✨';
      case 'progress': return '📈';
      case 'tip': return '💡';
      case 'review': return '⭐';
      case 'challenge': return '🎯';
      default: return '📸';
    }
  };

  const truncatedCaption = post.caption.length > 150 
    ? post.caption.substring(0, 150) + '...'
    : post.caption;

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.author.avatar}
              alt={`${post.author.firstName}'s avatar`}
              className="w-10 h-10 rounded-full object-cover"
            />
            {post.author.isInfluencer && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-1">
                <Crown className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">
                {post.author.username || `${post.author.firstName} ${post.author.lastName}`}
              </span>
              {post.author.isVerified && (
                <Verified className="h-4 w-4 text-blue-500 fill-current" />
              )}
              {getTierIcon(post.author.tier)}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className={getTierColor(post.author.tier)}>
                {post.author.tier}
              </span>
              {post.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {post.location}
                  </div>
                </>
              )}
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg">{getPostTypeEmoji(post.type)}</span>
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="relative">
          <div className="aspect-square bg-gray-100 overflow-hidden">
            <img
              src={post.images[currentImageIndex].url}
              alt={post.images[currentImageIndex].alt}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image navigation dots */}
          {post.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {post.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentImageIndex 
                      ? "bg-white" 
                      : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1 transition-colors",
                post.interactions.isLikedByCurrentUser 
                  ? "text-red-500" 
                  : "text-gray-700 hover:text-red-500"
              )}
            >
              <Heart 
                className={cn(
                  "h-6 w-6",
                  post.interactions.isLikedByCurrentUser && "fill-current"
                )} 
              />
              <span className="text-sm font-medium">{post.interactions.likes}</span>
            </button>
            
            <button className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition-colors">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm font-medium">{post.interactions.comments}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-1 text-gray-700 hover:text-green-500 transition-colors"
            >
              <Share className="h-6 w-6" />
              <span className="text-sm font-medium">{post.interactions.shares}</span>
            </button>
          </div>
          
          <button
            onClick={handleSave}
            className={cn(
              "transition-colors",
              post.interactions.isSavedByCurrentUser 
                ? "text-yellow-500" 
                : "text-gray-700 hover:text-yellow-500"
            )}
          >
            <Bookmark 
              className={cn(
                "h-6 w-6",
                post.interactions.isSavedByCurrentUser && "fill-current"
              )} 
            />
          </button>
        </div>

        {/* Caption */}
        <div className="mb-3">
          <p className="text-gray-900 text-sm leading-relaxed">
            <span className="font-semibold mr-2">
              {post.author.username || post.author.firstName}
            </span>
            {showFullCaption ? post.caption : truncatedCaption}
            {post.caption.length > 150 && (
              <button
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="text-gray-500 hover:text-gray-700 ml-1"
              >
                {showFullCaption ? 'less' : 'more'}
              </button>
            )}
          </p>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-blue-600 text-sm hover:underline cursor-pointer"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        {post.products && post.products.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Featured Products</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {post.products.map((product) => (
                <div 
                  key={product.id}
                  className="flex-shrink-0 bg-gray-50 rounded-lg p-2 min-w-[120px] cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                      {product.price && (
                        <p className="text-xs font-semibold text-green-600">
                          ${product.price}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engagement metrics */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>{post.interactions.views.toLocaleString()} views</span>
          {post.isFeatured && (
            <div className="flex items-center gap-1 text-yellow-600">
              <Crown className="h-3 w-3" />
              <span>Featured</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}