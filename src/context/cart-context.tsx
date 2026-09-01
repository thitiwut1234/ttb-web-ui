"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/constants/common.constant";
import { CartItem, ProductData, StockData } from "@/types/common.type";

interface ToastNotification {
  id: number;
  message: string;
  type: "success" | "warning" | "error" | "info";
}

export interface CheckoutResult {
  success: boolean;
  message: string;
  orderSummary?: {
    items: Array<{
      productCode: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    totalQuantity: number;
    totalPrice: number;
    orderDate: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalQuantity: number;
  totalPrice: number;
  isCheckingOut: boolean;
  addToCart: (product: ProductData | StockData, quantity?: number) => boolean;
  updateQuantity: (productCode: string, delta: number) => void;
  removeFromCart: (productCode: string) => void;
  clearCart: () => void;
  removeAll: () => void;
  checkout: () => Promise<CheckoutResult>;
  toast: ToastNotification | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "ttb_store_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error("Failed to load cart from localStorage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
    }
  }, [cartItems, isLoaded]);

  // Helper to show auto-dismissing toast notifications
  const showToast = useCallback(
    (message: string, type: "success" | "warning" | "error" | "info" = "info") => {
      const id = Date.now();
      setToast({ id, message, type });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Auto dismiss toast after 3.5s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  /**
   * Add a product to the cart with strict stock availability check.
   *
   * Stock checking logic:
   * 1. Get available stock amount (from totalStockAmount or amount).
   * 2. If stock is 0 or less, reject adding and notify user (สินค้าหมด).
   * 3. If product is already in cart, check (existingQty + quantity) <= stock.
   * 4. If exceeds stock, notify user and cap at max available stock.
   */
  const addToCart = useCallback(
    (product: ProductData | StockData, quantity: number = 1): boolean => {
      const stock =
        product.totalStockAmount ?? (product as StockData).amount ?? 0;

      // 1. Check if product is out of stock
      if (stock <= 0) {
        showToast(
          `สินค้า "${product.productName}" หมดสต็อก ไม่สามารถเพิ่มลงในตะกร้าได้`,
          "error"
        );
        return false;
      }

      const safeQuantity = Math.max(1, quantity);

      setCartItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) => item.productCode === product.productCode
        );

        if (existingIndex > -1) {
          const currentQty = prevItems[existingIndex].quantity || 1;

          // 2. Check if already reached max stock
          if (currentQty >= stock) {
            showToast(
              `คุณมีสินค้า "${product.productName}" ในตะกร้าครบตามสต็อกแล้ว (${stock} ชิ้น)`,
              "warning"
            );
            return prevItems;
          }

          // 3. Check if new total exceeds stock
          const newQty = currentQty + safeQuantity;
          if (newQty > stock) {
            const addedQty = stock - currentQty;
            showToast(
              `เพิ่มได้อีก ${addedQty} ชิ้น (ถึงจำนวนสต็อกสูงสุด ${stock} ชิ้นแล้ว)`,
              "warning"
            );
            const updated = [...prevItems];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: stock,
              totalStockAmount: stock,
            };
            return updated;
          }

          // Successfully add full requested quantity
          showToast(
            `เพิ่ม "${product.productName}" ลงในตะกร้าแล้ว (+${safeQuantity} ชิ้น)`,
            "success"
          );
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            totalStockAmount: stock,
          };
          return updated;
        }

        // New item in cart
        const initialQty = Math.min(safeQuantity, stock);
        if (safeQuantity > stock) {
          showToast(
            `เพิ่มได้เพียง ${stock} ชิ้นเนื่องจากสินค้ามีในสต็อกจำกัด`,
            "warning"
          );
        } else {
          showToast(
            `เพิ่ม "${product.productName}" ลงในตะกร้าแล้ว (${initialQty} ชิ้น)`,
            "success"
          );
        }

        return [
          ...prevItems,
          {
            ...product,
            quantity: initialQty,
            totalStockAmount: stock,
          },
        ];
      });

      return true;
    },
    [showToast]
  );

  /**
   * Update quantity of an existing cart item.
   * - delta > 0: increases quantity up to stock limit.
   * - delta < 0: decreases quantity; if quantity reaches 0, removes the item.
   */
  const updateQuantity = useCallback(
    (productCode: string, delta: number) => {
      setCartItems((prevItems) => {
        const item = prevItems.find((i) => i.productCode === productCode);
        if (!item) return prevItems;

        const currentQty = item.quantity || 1;
        const stock = item.totalStockAmount ?? item.amount ?? Infinity;

        if (delta > 0) {
          if (currentQty >= stock) {
            showToast(
              `สินค้ามีในสต็อกสูงสุดเพียง ${stock} ชิ้น`,
              "warning"
            );
            return prevItems;
          }
          return prevItems.map((i) =>
            i.productCode === productCode
              ? { ...i, quantity: currentQty + delta }
              : i
          );
        }

        // delta < 0
        const nextQty = currentQty + delta;
        if (nextQty <= 0) {
          showToast(`นำ "${item.productName}" ออกจากตะกร้าแล้ว`, "info");
          return prevItems.filter((i) => i.productCode !== productCode);
        }

        return prevItems.map((i) =>
          i.productCode === productCode ? { ...i, quantity: nextQty } : i
        );
      });
    },
    [showToast]
  );

  /**
   * Remove a single item from the cart.
   */
  const removeFromCart = useCallback(
    (productCode: string) => {
      setCartItems((prevItems) => {
        const item = prevItems.find((i) => i.productCode === productCode);
        if (item) {
          showToast(`ลบ "${item.productName}" ออกจากตะกร้าเรียบร้อยแล้ว`, "info");
        }
        return prevItems.filter((i) => i.productCode !== productCode);
      });
    },
    [showToast]
  );

  /**
   * Clear all items from the cart (Remove all / ล้างตะกร้า).
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
    showToast("ล้างตะกร้าสินค้าเรียบร้อยแล้ว", "info");
  }, [showToast]);

  const removeAll = clearCart;

  /**
   * Checkout workflow:
   * 1. Validates that the cart is not empty.
   * 2. Validates item quantities against stock.
   * 3. Sends the requested quantities to the stock checkout endpoint.
   * 4. Calculates the order summary.
   * 5. Clears the cart and provides confirmation feedback after a successful response.
   */
  const checkout = useCallback(async (): Promise<CheckoutResult> => {
    if (cartItems.length === 0) {
      showToast("ไม่มีสินค้าในตะกร้า กรุณาเลือกสินค้าก่อนทำการสั่งซื้อ", "warning");
      return { success: false, message: "ไม่มีสินค้าในตะกร้า" };
    }

    // Safety check: verify no item exceeds its registered stock amount
    for (const item of cartItems) {
      const stock = item.totalStockAmount ?? item.amount ?? Infinity;
      if (item.quantity > stock) {
        showToast(
          `สินค้า "${item.productName}" มีจำนวนเกินสต็อกคงเหลือ (${stock} ชิ้น)`,
          "error"
        );
        return {
          success: false,
          message: `สินค้า ${item.productName} มีจำนวนเกินสต็อก`,
        };
      }
    }

    setIsCheckingOut(true);

    try {
      const checkoutPayload = cartItems.map((item) => ({
        productId: item.productId,
        amount: item.quantity || 1,
        createBy: "SYSTEM",
      }));

      const response = await fetch(`${API_URL}/stocks/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(checkoutPayload),
      });

      if (!response.ok) {
        throw new Error(`Checkout request failed with status ${response.status}`);
      }

      const totalQty = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.productPrice * (item.quantity || 1),
        0
      );

      const orderSummary = {
        items: cartItems.map((item) => ({
          productCode: item.productCode,
          productName: item.productName,
          quantity: item.quantity || 1,
          unitPrice: item.productPrice,
          subtotal: item.productPrice * (item.quantity || 1),
        })),
        totalQuantity: totalQty,
        totalPrice: totalAmount,
        orderDate: new Date().toISOString(),
      };

      // Successfully placed order
      setCartItems([]);
      setIsCartOpen(false);
      router.refresh();

      showToast(
        `สั่งซื้อสินค้าสำเร็จ! รวม ${totalQty} รายการ ยอดชำระ ฿${totalAmount.toLocaleString()}`,
        "success"
      );

      return {
        success: true,
        message: "สั่งซื้อสินค้าสำเร็จเรียบร้อยแล้ว",
        orderSummary,
      };
    } catch (error) {
      console.error("Checkout process error:", error);
      showToast("เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง", "error");
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง",
      };
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, router, showToast]);

  // Derived totals
  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.productPrice * (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        totalQuantity,
        totalPrice,
        isCheckingOut,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        removeAll,
        checkout,
        toast,
        dismissToast,
      }}
    >
      {children}

      {/* Floating Toast Notification Banner */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-60 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-700/60 text-emerald-100 dark:bg-emerald-950/95 shadow-emerald-900/30"
                : toast.type === "warning"
                ? "bg-amber-950/90 border-amber-700/60 text-amber-100 dark:bg-amber-950/95 shadow-amber-900/30"
                : toast.type === "error"
                ? "bg-red-950/90 border-red-700/60 text-red-100 dark:bg-red-950/95 shadow-red-900/30"
                : "bg-zinc-900/90 border-zinc-700/60 text-zinc-100 dark:bg-zinc-900/95 shadow-black/40"
            }`}
          >
            {/* Icon */}
            <div className="shrink-0">
              {toast.type === "success" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {toast.type === "warning" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-amber-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {toast.type === "error" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {toast.type === "info" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {/* Message Text */}
            <p className="text-xs font-medium leading-relaxed">{toast.message}</p>

            {/* Close Button */}
            <button
              type="button"
              onClick={dismissToast}
              className="ml-auto p-1 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
