import { create } from 'zustand';
import { SocialPost, FeedFilter, FeedSort, PostInteractions, CreatePostRequest } from '@/app/types/social-feed';

interface SocialFeedStore {
  // Feed state
  posts: SocialPost[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  
  // Filters and sorting
  filter: FeedFilter;
  sort: FeedSort;
  
  // Actions
  setPosts: (posts: SocialPost[]) => void;
  addPosts: (posts: SocialPost[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: Partial<FeedFilter>) => void;
  setSort: (sort: FeedSort) => void;
  resetFeed: () => void;
  
  // Post interactions
  updatePostInteractions: (postId: string, interactions: Partial<PostInteractions>) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  incrementComments: (postId: string) => void;
  incrementShares: (postId: string) => void;
  
  // Post management
  addPost: (post: SocialPost) => void;
  removePost: (postId: string) => void;
  updatePost: (postId: string, updates: Partial<SocialPost>) => void;
  
  // Feed operations
  loadFeed: (reset?: boolean) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  
  // User interactions
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  sharePost: (postId: string, platform?: string) => Promise<void>;
  
  // Post creation
  createPost: (postData: CreatePostRequest) => Promise<SocialPost>;
  uploadImages: (files: File[]) => Promise<string[]>;
}

export const useSocialFeedStore = create<SocialFeedStore>((set, get) => ({
  // Initial state
  posts: [],
  isLoading: false,
  hasMore: true,
  error: null,
  page: 0,
  
  filter: {},
  sort: { by: 'recent', direction: 'desc' },
  
  // Basic state setters
  setPosts: (posts) => set({ posts }),
  addPosts: (newPosts) => set(state => ({ 
    posts: [...state.posts, ...newPosts],
    hasMore: newPosts.length > 0 
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilter: (newFilter) => set(state => ({ 
    filter: { ...state.filter, ...newFilter } 
  })),
  setSort: (sort) => set({ sort }),
  resetFeed: () => set({ 
    posts: [], 
    page: 0, 
    hasMore: true, 
    error: null 
  }),
  
  // Post interaction updates
  updatePostInteractions: (postId, interactions) => set(state => ({
    posts: state.posts.map(post => 
      post.id === postId 
        ? { ...post, interactions: { ...post.interactions, ...interactions } }
        : post
    )
  })),
  
  toggleLike: (postId) => set(state => ({
    posts: state.posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.interactions.isLikedByCurrentUser;
        return {
          ...post,
          interactions: {
            ...post.interactions,
            likes: isLiked ? post.interactions.likes - 1 : post.interactions.likes + 1,
            isLikedByCurrentUser: !isLiked
          }
        };
      }
      return post;
    })
  })),
  
  toggleSave: (postId) => set(state => ({
    posts: state.posts.map(post => {
      if (post.id === postId) {
        const isSaved = post.interactions.isSavedByCurrentUser;
        return {
          ...post,
          interactions: {
            ...post.interactions,
            saves: isSaved ? post.interactions.saves - 1 : post.interactions.saves + 1,
            isSavedByCurrentUser: !isSaved
          }
        };
      }
      return post;
    })
  })),
  
  incrementComments: (postId) => set(state => ({
    posts: state.posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            interactions: { 
              ...post.interactions, 
              comments: post.interactions.comments + 1 
            } 
          }
        : post
    )
  })),
  
  incrementShares: (postId) => set(state => ({
    posts: state.posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            interactions: { 
              ...post.interactions, 
              shares: post.interactions.shares + 1 
            } 
          }
        : post
    )
  })),
  
  // Post management
  addPost: (post) => set(state => ({ 
    posts: [post, ...state.posts] 
  })),
  
  removePost: (postId) => set(state => ({
    posts: state.posts.filter(post => post.id !== postId)
  })),
  
  updatePost: (postId, updates) => set(state => ({
    posts: state.posts.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    )
  })),
  
  // Feed operations
  loadFeed: async (reset = false) => {
    const { filter, sort, page } = get();
    set({ isLoading: true, error: null });
    
    try {
      const params = new URLSearchParams({
        page: reset ? '0' : page.toString(),
        sortBy: sort.by,
        sortDirection: sort.direction,
        ...Object.fromEntries(
          Object.entries(filter).map(([key, value]) => [
            key, 
            Array.isArray(value) ? value.join(',') : String(value)
          ])
        )
      });
      
      const response = await fetch(`/api/social-feed?${params}`);
      const data = await response.json();
      
      if (data.success) {
        if (reset) {
          set({ 
            posts: data.posts, 
            page: 1, 
            hasMore: data.hasMore,
            isLoading: false
          });
        } else {
          set(state => ({ 
            posts: [...state.posts, ...data.posts],
            page: state.page + 1,
            hasMore: data.hasMore,
            isLoading: false
          }));
        }
      } else {
        set({ error: data.message || 'Failed to load feed', isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load feed',
        isLoading: false 
      });
    }
  },
  
  loadMorePosts: async () => {
    const { hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;
    
    await get().loadFeed(false);
  },
  
  refreshFeed: async () => {
    get().resetFeed();
    await get().loadFeed(true);
  },
  
  // User interactions with API calls
  likePost: async (postId) => {
    get().toggleLike(postId); // Optimistic update
    
    try {
      const response = await fetch(`/api/social-feed/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        get().toggleLike(postId); // Revert on error
        throw new Error('Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  },
  
  unlikePost: async (postId) => {
    get().toggleLike(postId); // Optimistic update
    
    try {
      const response = await fetch(`/api/social-feed/${postId}/like`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        get().toggleLike(postId); // Revert on error
        throw new Error('Failed to unlike post');
      }
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  },
  
  savePost: async (postId) => {
    get().toggleSave(postId); // Optimistic update
    
    try {
      const response = await fetch(`/api/social-feed/${postId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        get().toggleSave(postId); // Revert on error
        throw new Error('Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  },
  
  unsavePost: async (postId) => {
    get().toggleSave(postId); // Optimistic update
    
    try {
      const response = await fetch(`/api/social-feed/${postId}/save`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        get().toggleSave(postId); // Revert on error
        throw new Error('Failed to unsave post');
      }
    } catch (error) {
      console.error('Error unsaving post:', error);
    }
  },
  
  sharePost: async (postId, platform = 'general') => {
    get().incrementShares(postId); // Optimistic update
    
    try {
      const response = await fetch(`/api/social-feed/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
      
      if (!response.ok) {
        throw new Error('Failed to record share');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  },
  
  // Post creation
  createPost: async (postData) => {
    try {
      const response = await fetch('/api/social-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        get().addPost(result.post);
        return result.post;
      } else {
        throw new Error(result.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },
  
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });
    
    try {
      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.urls;
      } else {
        throw new Error(result.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }
}));