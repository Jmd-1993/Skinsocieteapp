"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/app/lib/cart";
import { cn } from "@/app/lib/utils";

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    setIsOpen, 
    updateQuantity, 
    removeItem, 
    getTotalItems, 
    getTotalPrice 
  } = useCartStore();

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black z-50 transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-60"
        )}
        onClick={handleClose}
      />

      {/* Cart Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-md bg-white z-50",
          "transform transition-transform duration-300 ease-in-out",
          "flex flex-col shadow-2xl",
          isClosing ? "translate-x-full" : "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-pink-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart
            </h2>
            {totalItems > 0 && (
              <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-sm font-medium">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Add some beautiful skincare products to get started
              </p>
              <button
                onClick={handleClose}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🧴
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {item.brand}
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="text-sm font-semibold text-pink-600 mt-1">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white hover:bg-gray-100 
                               transition-colors flex items-center justify-center
                               border border-gray-200"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-white hover:bg-gray-100 
                               transition-colors flex items-center justify-center
                               border border-gray-200"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1 hover:bg-red-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-pink-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                handleClose();
                // Navigate to checkout page
                window.location.href = '/checkout';
              }}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium
                       hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Continue Shopping */}
            <button
              onClick={handleClose}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}