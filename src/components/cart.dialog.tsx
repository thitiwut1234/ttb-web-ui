"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { useCart } from "@/context/cart-context";
import { CartItem } from "@/types/common.type";

interface CartDialogProps {
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  cartItems?: CartItem[];
  setCartItems?: Dispatch<SetStateAction<CartItem[]>> | ((items: CartItem[]) => void);
}

export default function CartDialog({
  open: propOpen,
  setOpen: propSetOpen,
  cartItems: propCartItems,
}: CartDialogProps) {
  const context = useCart();

  // Support both controlled props and direct context access
  const isCartOpen = propOpen !== undefined ? propOpen : context.isCartOpen;
  const setIsCartOpen = propSetOpen !== undefined ? propSetOpen : context.setIsCartOpen;
  const items = propCartItems !== undefined ? propCartItems : context.cartItems;
  const { updateQuantity, removeFromCart, clearCart, checkout, isCheckingOut } = context;

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.productPrice * (item.quantity || 1),
    0
  );

  const handleCheckout = async () => {
    await checkout();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={() => setIsCartOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-dialog-title"
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h2 id="cart-dialog-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                ตะกร้าสินค้า
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {totalQuantity} รายการ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart dialog"
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content / Items list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 dark:text-zinc-400">
              <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-3 text-zinc-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                ไม่มีสินค้าในตะกร้า
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                เลือกสินค้าจากรายการและเพิ่มลงในตะกร้าได้เลย
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((item) => {
                const qty = item.quantity || 1;
                const subtotal = item.productPrice * qty;
                const stockLimit = item.totalStockAmount ?? item.amount ?? Infinity;
                const isMaxStock = qty >= stockLimit;

                return (
                  <li key={item.productCode} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono">
                          {item.productCode}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.productName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          ฿{item.productPrice.toLocaleString()} / ชิ้น
                        </p>
                        {stockLimit !== Infinity && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isMaxStock
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-semibold"
                                : "text-zinc-400 dark:text-zinc-500"
                            }`}
                          >
                            {isMaxStock
                              ? `สูงสุดแล้ว (สต็อก: ${stockLimit})`
                              : `สต็อกคงเหลือ: ${stockLimit}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productCode, -1)}
                          className="px-2.5 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-semibold cursor-pointer"
                          aria-label="Decrease quantity"
                          title="ลดจำนวนสินค้า"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 min-w-[28px] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          disabled={isMaxStock}
                          onClick={() => updateQuantity(item.productCode, 1)}
                          className={`px-2.5 py-1 font-semibold transition-colors ${
                            isMaxStock
                              ? "text-zinc-300 dark:text-zinc-600 cursor-not-allowed bg-zinc-100 dark:bg-zinc-900"
                              : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                          }`}
                          aria-label="Increase quantity"
                          title={isMaxStock ? "ถึงจำนวนสต็อกสูงสุดแล้ว" : "เพิ่มจำนวนสินค้า"}
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="w-20 text-right">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          ฿{subtotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productCode)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        aria-label="Remove item"
                        title="ลบรายการนี้"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">ราคารวมทั้งหมด</span>
              <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                ฿{totalPrice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={clearCart}
                disabled={isCheckingOut}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                ล้างตะกร้า
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  "สั่งซื้อสินค้า (Checkout)"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}