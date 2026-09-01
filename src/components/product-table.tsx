"use client";

import { useState } from "react";
import { StockData } from "@/types/common.type";
import { useCart } from "@/context/cart-context";
import Badge from "./badge";
import ProductDetailDialog from "./product-detail.dialog";

export interface ProductTableProps {
  products: StockData[];
}

export default function ProductTable({ products }: ProductTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<StockData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const { addToCart, cartItems } = useCart();

  const handleOpenDetail = (product: StockData) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent, product: StockData) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs bg-white dark:bg-zinc-900">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-zinc-50/80 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">รหัสสินค้า</th>
              <th className="px-4 py-3 text-left font-semibold">ชื่อสินค้า</th>
              <th className="px-4 py-3 text-right font-semibold">ราคาขายต่อหน่วย</th>
              <th className="px-4 py-3 text-right font-semibold">จำนวนคงเหลือ</th>
              <th className="px-3 py-3 text-center font-semibold w-16"></th>
              <th className="px-3 py-3 text-center font-semibold w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {products.length > 0 ? (
              products.map((product) => {
                const totalStock =
                  product.totalStockAmount ?? product.amount ?? 0;
                const quantityInCart =
                  cartItems.find(
                    (item) => item.productCode === product.productCode
                  )?.quantity ?? 0;
                const stock = Math.max(0, totalStock - quantityInCart);
                const isOutOfStock = stock <= 0;

                return (
                  <tr
                    key={product.productCode}
                    className="hover:bg-blue-50/40 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs">
                        {product.productCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {product.productName}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-800 dark:text-zinc-200">
                      ฿{product.productPrice?.toLocaleString() ?? product.productPrice}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {stock === 0 ? (
                        <Badge variant="danger" size="sm" dot>
                          สินค้าหมด
                        </Badge>
                      ) : stock <= 5 ? (
                        <Badge variant="warning" size="sm" dot>
                          {stock.toLocaleString()} ชิ้น
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm" dot>
                          {stock.toLocaleString()} ชิ้น
                        </Badge>
                      )}
                    </td>
                    <td
                      className="px-3 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(product)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                        title="ดูรายละเอียดสินค้า"
                        aria-label={`ดูรายละเอียด ${product.productName}`}
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                    <td
                      className="px-3 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`inline-flex items-center justify-center p-2 rounded-lg transition-all active:scale-95 ${isOutOfStock
                            ? "text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed"
                            : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white cursor-pointer shadow-xs"
                          }`}
                        title={
                          isOutOfStock
                            ? "สินค้าหมดสต็อก"
                            : `เพิ่ม ${product.productName} ลงในตะกร้า`
                        }
                        aria-label={`เพิ่ม ${product.productName} ลงในตะกร้า`}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          stroke="currentColor"
                        >
                          <g clipPath="url(#clip_cart_icon)">
                            <path
                              d="M5.33331 6H19.8672C20.4687 6 20.9341 6.52718 20.8595 7.12403L20.1095 13.124C20.0469 13.6245 19.6215 14 19.1172 14H16.5555H9.44442H7.99998"
                              strokeWidth={1.75}
                              strokeLinejoin="round"
                            />
                            <path
                              d="M2 4H4.23362C4.68578 4 5.08169 4.30341 5.19924 4.74003L8.30076 16.26C8.41831 16.6966 8.81422 17 9.26638 17H19"
                              strokeWidth={1.75}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle cx="10" cy="20" r="1.25" strokeWidth={1.5} />
                            <circle cx="17.5" cy="20" r="1.25" strokeWidth={1.5} />
                          </g>
                          <defs>
                            <clipPath id="clip_cart_icon">
                              <rect width="24" height="24" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400"
                >
                  ไม่พบข้อมูลสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        open={isDetailOpen}
        setOpen={setIsDetailOpen}
        product={selectedProduct}
        onAddToCart={(prod, qty) => addToCart(prod, qty)}
      />
    </>
  );
}
