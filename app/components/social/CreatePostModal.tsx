"use client";

import { useState, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Tag, 
  MapPin, 
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Star,
  Target
} from 'lucide-react';
import { PostType, PostCategory } from '@/app/types/social-feed';
import { cn } from '@/app/lib/utils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (postData: any) => void;
}

const POST_TYPES = [
  { value: 'routine' as PostType, label: 'Routine', emoji: '✨', description: 'Share your skincare routine' },
  { value: 'progress' as PostType, label: 'Progress', emoji: '📈', description: 'Show your skin transformation' },
  { value: 'tip' as PostType, label: 'Tip', emoji: '💡', description: 'Share helpful advice' },
  { value: 'review' as PostType, label: 'Review', emoji: '⭐', description: 'Review a product' },
  { value: 'challenge' as PostType, label: 'Challenge', emoji: '🎯', description: 'Join a challenge' },
];

export function CreatePostModal({ isOpen, onClose, onPost }: CreatePostModalProps) {
  const [postType, setPostType] = useState<PostType>('routine');
  const [caption, setCaption] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [location, setLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 10) {
      alert('You can upload a maximum of 10 images');
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      const tag = currentTag.trim().replace(/^#/, '');
      if (!tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!caption.trim() && selectedImages.length === 0) {
      alert('Please add a caption or images');
      return;
    }

    const formData = new FormData();
    formData.append('type', postType);
    formData.append('caption', caption);
    formData.append('location', location);
    formData.append('tags', JSON.stringify(tags));
    
    selectedImages.forEach((image, index) => {
      formData.append(`images`, image);
    });

    onPost(formData);
    
    // Reset form
    setCaption('');
    setSelectedImages([]);
    setPreviewUrls([]);
    setTags([]);
    setLocation('');
    setPostType('routine');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Create Post</h2>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
          >
            Share
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Post Type Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">What are you sharing?</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {POST_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setPostType(type.value)}
                  className={cn(
                    "p-3 rounded-lg border text-center transition-all",
                    postType === type.value
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="text-2xl mb-1">{type.emoji}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="mb-6">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={`Share your ${postType}...`}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              {caption.length}/2000 characters
            </p>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {previewUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {previewUrls.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
              >
                <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">Add Photos</p>
                <p className="text-xs text-gray-500 mt-1">Up to 10 images</p>
              </button>
            )}
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tags (press Enter)"
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Location (optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}