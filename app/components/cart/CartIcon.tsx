"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/app/lib/cart";
import { cn } from "@/app/lib/utils";

interface CartIconProps {
  className?: string;
  showBadge?: boolean;
}

export function CartIcon({ className = "", showBadge = true }: CartIconProps) {
  const { getTotalItems, setIsOpen } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={cn(
        "relative p-2 text-gray-700 hover:text-pink-600 transition-colors",
        className
      )}
    >
      <ShoppingBag className="h-6 w-6" />
      {showBadge && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs 
                       rounded-full h-5 w-5 flex items-center justify-center font-medium
                       animate-pulse">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
}