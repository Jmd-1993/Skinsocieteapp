"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Eye, Minus, Plus, X, Star, Badge, Sparkles } from 'lucide-react';
import { useCartStore } from '@/app/lib/cart';
import { cn } from '@/app/lib/utils';
import { AddToCartButton } from './AddToCartButton';

interface Product {
  id: string;
  name: string;
  brand: {
    name: string;
  };
  price: number;
  rrp?: number;
  description?: string;
  category: string;
  featuredImage?: string;
  inStock: boolean;
  size?: string;
  benefits?: string[];
  usage?: string;
  skinType?: string[];
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [showQuickView, setShowQuickView] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const discountAmount = product.rrp ? product.rrp - product.price : 0;
  const discountPercentage = product.rrp ? Math.round((discountAmount / product.rrp) * 100) : 0;

  const handleAddToCart = () => {
    if (!product.inStock) return;
    
    // Add multiple items if quantity > 1
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `cart-${product.id}-${Date.now()}-${i}`,
        productId: product.id,
        name: product.name,
        brand: product.brand.name,
        price: product.price,
        image: product.featuredImage
      });
    }
    
    setQuantity(1);
  };

  return (
    <>
      <div className={cn(
        "bg-white rounded-2xl shadow-sm overflow-hidden group relative",
        "transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
        "border border-gray-100",
        className
      )}>
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Featured
            </div>
          </div>
        )}

        {/* Discount Badge */}
        {discountAmount > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              Save ${discountAmount.toFixed(0)}
            </div>
          </div>
        )}

        {/* Product Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-20">🧴</div>
            </div>
          )}
          
          {/* Quick View Overlay */}
          <button
            onClick={() => setShowQuickView(true)}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                     transition-opacity duration-300 flex items-center justify-center z-10">
            <div className="bg-white px-4 py-2 rounded-full font-medium text-gray-900
                         transform scale-0 group-hover:scale-100 transition-transform duration-300
                         flex items-center gap-2 shadow-lg">
              <Eye className="h-4 w-4" />
              Quick View
            </div>
          </button>

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
              <div className="bg-white px-4 py-2 rounded-full font-semibold text-gray-900">
                Out of Stock
              </div>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
            {product.brand.name}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed">
              {product.description}
            </p>
          )}
          
          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-purple-600">
                ${product.price.toFixed(2)}
              </span>
              {product.rrp && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.rrp.toFixed(2)}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="text-xs text-green-600 font-semibold">
                  -{discountPercentage}%
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {product.size || '50ml'}
            </div>
          </div>
          
          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200
                         transition-colors flex items-center justify-center
                         disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!product.inStock}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200
                         transition-colors flex items-center justify-center
                         disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!product.inStock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <AddToCartButton
              product={product}
              className="w-full"
              size="md"
            />
          </div>

          {/* Category Badge */}
          <div className="mt-3 text-center">
            <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              {product.category}
            </span>
          </div>
        </div>
      </div>
      
      {/* Quick View Modal */}
      {showQuickView && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowQuickView(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto
                      transform transition-all animate-in zoom-in-95 duration-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  {product.brand.name}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {product.name}
                </h2>
              </div>
              <button
                onClick={() => setShowQuickView(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                {product.featuredImage ? (
                  <Image
                    src={product.featuredImage}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-8xl opacity-20">🧴</div>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-purple-600">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.rrp && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ${product.rrp.toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium">
                        Save ${discountAmount.toFixed(0)}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Benefits */}
                {product.benefits && product.benefits.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Key Benefits</h3>
                    <ul className="space-y-1">
                      {product.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Usage Instructions */}
                {product.usage && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">How to Use</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {product.usage}
                    </p>
                  </div>
                )}

                {/* Skin Type */}
                {product.skinType && product.skinType.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Suitable For</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.skinType.map((type, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart */}
                <div className="border-t pt-6">
                  <AddToCartButton
                    product={product}
                    className="w-full"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}