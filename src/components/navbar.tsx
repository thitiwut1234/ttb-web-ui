"use client";

import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartItem } from "@/types/common.type";
import { useCart } from "@/context/cart-context";
import CartDialog from "./cart.dialog";

export interface NavbarProps {
  cartItems?: CartItem[];
  setCartItems?: Dispatch<SetStateAction<CartItem[]>> | ((items: CartItem[]) => void);
  openCart?: boolean;
  setOpenCart?: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  title?: string;
}

export default function Navbar({
  cartItems: externalCartItems,
  openCart: externalOpenCart,
  setOpenCart: externalSetOpenCart,
  title = "TTB Store",
}: NavbarProps) {
  const pathname = usePathname();
  const context = useCart();

  const isCartOpen =
    externalOpenCart !== undefined ? externalOpenCart : context.isCartOpen;
  const setIsCartOpen =
    externalSetOpenCart !== undefined ? externalSetOpenCart : context.setIsCartOpen;

  const currentCartItems =
    externalCartItems !== undefined ? externalCartItems : context.cartItems;

  const totalCartCount = currentCartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const navLinks = [
    { name: "หน้าแรก", href: "/" },
    { name: "รายการสินค้า", href: "/test" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo / Brand */}
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="flex items-center gap-2.5 group transition-transform active:scale-95"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
                    {title}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">
                    Inventory & Store
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "text-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Action: Cart Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition-all duration-150 hover:shadow-sm active:scale-95 cursor-pointer"
                aria-label="Open Shopping Cart"
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-zinc-700 dark:text-zinc-300"
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
                  {totalCartCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-blue-600 rounded-full shadow-sm animate-pulse">
                      {totalCartCount > 99 ? "99+" : totalCartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-semibold">
                  ตะกร้าสินค้า
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Dialog Modal */}
      <CartDialog
        open={isCartOpen}
        setOpen={setIsCartOpen}
      />
    </>
  );
}
