"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSocialFeedStore } from '@/app/lib/social-feed-store';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { PostType, PostCategory, FeedSort } from '@/app/types/social-feed';
import { Filter, TrendingUp, Clock, Heart, Star, Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface SocialFeedProps {
  className?: string;
}

const SORT_OPTIONS: { value: FeedSort['by']; label: string; icon: React.ReactNode }[] = [
  { value: 'recent', label: 'Recent', icon: <Clock className="h-4 w-4" /> },
  { value: 'popular', label: 'Popular', icon: <Heart className="h-4 w-4" /> },
  { value: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'quality', label: 'Quality', icon: <Star className="h-4 w-4" /> },
];

const POST_TYPE_FILTERS: { value: PostType; label: string; emoji: string }[] = [
  { value: 'ROUTINE', label: 'Routines', emoji: '✨' },
  { value: 'PROGRESS', label: 'Progress', emoji: '📈' },
  { value: 'TIP', label: 'Tips', emoji: '💡' },
  { value: 'REVIEW', label: 'Reviews', emoji: '⭐' },
  { value: 'CHALLENGE', label: 'Challenges', emoji: '🎯' },
];

export function SocialFeed({ className }: SocialFeedProps) {
  const {
    posts,
    isLoading,
    hasMore,
    error,
    filter,
    sort,
    loadFeed,
    loadMorePosts,
    refreshFeed,
    setSort,
    setFilter
  } = useSocialFeedStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();

  // Initialize feed on mount
  useEffect(() => {
    if (posts.length === 0) {
      loadFeed(true);
    }
  }, []);

  // Infinite scroll observer
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMorePosts();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMorePosts]);

  const handleSortChange = (newSort: FeedSort['by']) => {
    setSort({ by: newSort, direction: 'desc' });
    loadFeed(true);
  };

  const handleTypeFilter = (type: PostType) => {
    const currentTypes = filter.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setFilter({ type: newTypes.length > 0 ? newTypes : undefined });
    loadFeed(true);
  };

  const handleRefresh = () => {
    refreshFeed();
  };

  const handleCreatePost = async (formData: FormData) => {
    try {
      const response = await fetch('/api/social-feed', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setShowCreateModal(false);
        // Refresh the feed to show the new post
        refreshFeed();
      } else {
        alert('Failed to create post: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8", className)}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <TrendingUp className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load feed
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      {/* Feed Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Community Feed</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Share Your Story
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex gap-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors",
                  sort.by === option.value
                    ? "bg-pink-100 text-pink-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Post Type Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex gap-1 flex-wrap">
            {POST_TYPE_FILTERS.map((typeFilter) => (
              <button
                key={typeFilter.value}
                onClick={() => handleTypeFilter(typeFilter.value)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors",
                  filter.type?.includes(typeFilter.value)
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span>{typeFilter.emoji}</span>
                {typeFilter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <TrendingUp className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your skincare journey!
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.id}
              ref={index === posts.length - 1 ? lastPostElementRef : null}
            >
              <PostCard post={post} />
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
              <span>Loading more posts...</span>
            </div>
          </div>
        )}

        {/* End of Feed Indicator */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Heart className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-gray-600">
              You're all caught up! 🎉
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Check back later for new posts from the community
            </p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPost={handleCreatePost}
      />
    </div>
  );
}