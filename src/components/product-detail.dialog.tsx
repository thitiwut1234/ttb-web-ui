"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ProductData, StockData } from "@/types/common.type";
import { useCart } from "@/context/cart-context";
import Badge from "./badge";

export interface ProductDetailDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  product: ProductData | StockData | null;
  onAddToCart?: (product: ProductData | StockData, quantity: number) => void;
}

interface ProductDetailContentProps {
  product: ProductData | StockData;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  onAddToCart?: (product: ProductData | StockData, quantity: number) => void;
}

function ProductDetailContent({
  product,
  setOpen,
  onAddToCart,
}: ProductDetailContentProps) {
  const { addToCart: contextAddToCart, cartItems } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const totalStockAmount =
    product.totalStockAmount ?? (product as StockData).amount ?? 0;
  const quantityInCart =
    cartItems.find((item) => item.productCode === product.productCode)
      ?.quantity ?? 0;
  const availableStockAmount = Math.max(
    0,
    totalStockAmount - quantityInCart
  );
  const isOutOfStock = availableStockAmount <= 0;
  const isLowStock = availableStockAmount > 0 && availableStockAmount <= 5;
  const isActive = product.active ?? true;

  const handleCopyCode = async () => {
    if (product?.productCode) {
      try {
        await navigator.clipboard.writeText(product.productCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (onAddToCart) {
      onAddToCart(product, quantity);
    } else {
      contextAddToCart(product, quantity);
    }
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1800);
    setOpen(false)
  };

  const handleIncreaseQty = () => {
    if (quantity < availableStockAmount) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div
      className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2
              id="product-detail-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
            >
              รายละเอียดสินค้า
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              รหัสสินค้า: #{product.productCode}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close product detail dialog"
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

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Product Hero Banner */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 opacity-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="primary" size="sm">
                #{product.productCode}
              </Badge>
              {isActive ? (
                <Badge variant="success" size="sm" dot>
                  เปิดใช้งาน
                </Badge>
              ) : (
                <Badge variant="secondary" size="sm" dot>
                  ปิดการใช้งาน
                </Badge>
              )}
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-snug break-words">
              {product.productName}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Product Code: {product.productCode}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Price Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              ราคาต่อหน่วย
            </span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                ฿{product.productPrice?.toLocaleString() ?? product.productPrice}
              </span>
              <span className="text-xs text-zinc-400">/ ชิ้น</span>
            </div>
          </div>

          {/* Stock Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              จำนวนคงเหลือในสต็อก
            </span>
            <div className="mt-2 flex items-center gap-2">
              {isOutOfStock ? (
                <Badge variant="danger" size="md" dot dotPing>
                  สินค้าหมด
                </Badge>
              ) : isLowStock ? (
                <Badge variant="warning" size="md" dot dotPing>
                  เหลือเพียง {availableStockAmount.toLocaleString()} ชิ้น
                </Badge>
              ) : (
                <Badge variant="success" size="md" dot>
                  พร้อมจำหน่าย ({availableStockAmount.toLocaleString()} ชิ้น)
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Info List */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 text-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">
              รหัสสินค้า (Product Code)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                {product.productCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded transition-colors cursor-pointer"
                title="คัดลอกรหัสสินค้า"
              >
                {copiedCode ? (
                  <span className="text-[10px] text-emerald-600 font-bold">คัดลอกแล้ว!</span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">
              ชื่อสินค้า
            </span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200 text-xs text-right">
              {product.productName}
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">
              สถานะระบบ (Active)
            </span>
            <span className="text-xs">
              {isActive ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ● เปิดใช้งาน
                </span>
              ) : (
                <span className="text-zinc-400 font-medium">○ ปิดใช้งาน</span>
              )}
            </span>
          </div>
        </div>

        {/* Add to Cart Section (if item is in stock) */}
        {!isOutOfStock && (
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                เลือกจำนวนที่ต้องการ:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDecreaseQty}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseQty}
                  disabled={quantity >= availableStockAmount}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-blue-200/40 dark:border-blue-900/40">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">ราคารวม:</span>
              <span className="text-base font-bold text-blue-700 dark:text-blue-300">
                ฿{(product.productPrice * quantity).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
        >
          ปิดหน้าต่าง
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ${
            isOutOfStock
              ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
              : addedSuccess
              ? "bg-emerald-600 text-white shadow-emerald-500/20"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/35"
          }`}
        >
          {addedSuccess ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              เพิ่มลงตะกร้าแล้ว!
            </>
          ) : (
            <>
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {isOutOfStock ? "สินค้าหมด" : "เพิ่มลงในตะกร้า"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ProductDetailDialog({
  open,
  setOpen,
  product,
  onAddToCart,
}: ProductDetailDialogProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  if (!open || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
    >
      <ProductDetailContent
        key={`${product.productCode}`}
        product={product}
        setOpen={setOpen}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
