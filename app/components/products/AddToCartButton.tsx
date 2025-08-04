"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Check } from "lucide-react";
import { useCartStore } from "@/app/lib/cart";
import { cn } from "@/app/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: {
    name: string;
  };
  price: number;
  featuredImage?: string;
  inStock: boolean;
}

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  showIcon?: boolean;
  disabled?: boolean;
}

export function AddToCartButton({
  product,
  className = "",
  size = "md",
  variant = "primary",
  showIcon = true,
  disabled = false
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.inStock || isAdding || disabled) return;

    setIsAdding(true);
    
    try {
      // Add to cart store immediately for instant UI feedback
      addItem({
        id: `cart-${product.id}`,
        productId: product.id,
        name: product.name,
        brand: product.brand.name,
        price: product.price,
        image: product.featuredImage
      });
      
      setJustAdded(true);
      
      // Reset the "just added" state after 2 seconds
      setTimeout(() => {
        setJustAdded(false);
      }, 2000);
      
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base"
  };

  const variantClasses = {
    primary: product.inStock 
      ? "bg-pink-600 text-white hover:bg-pink-700" 
      : "bg-gray-200 text-gray-500 cursor-not-allowed",
    secondary: product.inStock
      ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300"
      : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
  };

  if (!product.inStock) {
    return (
      <button
        disabled
        className={cn(
          "rounded-lg font-medium transition-colors cursor-not-allowed",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        Out of Stock
      </button>
    );
  }

  if (justAdded) {
    return (
      <button
        disabled
        className={cn(
          "rounded-lg font-medium transition-colors bg-green-600 text-white",
          sizeClasses[size],
          className
        )}
      >
        <div className="flex items-center gap-1">
          <Check className="h-4 w-4" />
          Added!
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || disabled}
      className={cn(
        "rounded-lg font-medium transition-colors",
        sizeClasses[size],
        variantClasses[variant],
        isAdding && "opacity-75 cursor-wait",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {showIcon && (
          isAdding ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )
        )}
        {isAdding ? "Adding..." : "Add to Cart"}
      </div>
    </button>
  );
}