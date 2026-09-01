"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  paramName?: string;
  pageSizeParamName?: string;
  showInfo?: boolean;
  showPageSizeSelector?: boolean;
  className?: string;
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalCount,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onPageSizeChange,
  paramName = "pageNumber",
  pageSizeParamName = "pageSize",
  showInfo = true,
  showPageSizeSelector = true,
  className = "",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    if (onPageChange) {
      onPageChange(page);
    } else {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
      params.set(paramName, page.toString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (newSize === pageSize) return;

    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
      params.set(pageSizeParamName, newSize.toString());
      params.set(paramName, "1"); // Reset to page 1 when changing page size
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }

    return pages;
  };

  const canGoPrev = hasPreviousPage !== undefined ? hasPreviousPage : currentPage > 1;
  const canGoNext = hasNextPage !== undefined ? hasNextPage : currentPage < totalPages;

  const fromItem =
    totalCount !== undefined && pageSize !== undefined
      ? Math.min((currentPage - 1) * pageSize + 1, totalCount)
      : undefined;
  const toItem =
    totalCount !== undefined && pageSize !== undefined
      ? Math.min(currentPage * pageSize, totalCount)
      : undefined;

  if (totalPages <= 0 && (!totalCount || totalCount === 0)) return null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={`flex flex-col md:flex-row items-center justify-between gap-4 py-4 ${className}`}
    >
      {/* Left: Information text & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        {showInfo && totalCount !== undefined && totalCount > 0 ? (
          <div>
            แสดง <span className="font-semibold text-gray-900 dark:text-white">{fromItem}</span> ถึง{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{toItem}</span> จากทั้งหมด{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> รายการ
          </div>
        ) : showInfo && totalPages > 1 ? (
          <div>
            หน้า <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> จาก{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span> หน้า
          </div>
        ) : null}

        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <label htmlFor="pagination-page-size" className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              แสดงต่อหน้า:
            </label>
            <select
              id="pagination-page-size"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              aria-label="จำนวนรายการต่อหน้า"
              className="rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white cursor-pointer shadow-xs"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} รายการ
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Buttons controls */}
      <div className="flex items-center space-x-1">
        {/* First Button */}
        <button
          type="button"
          onClick={() => handlePageChange(1)}
          disabled={!canGoPrev}
          aria-label="หน้าแรก"
          title="หน้าแรก"
          className="inline-flex items-center justify-center px-2.5 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          «
        </button>

        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoPrev}
          aria-label="หน้าก่อนหน้า"
          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ‹ ก่อนหน้า
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, idx) => {
            if (typeof page === "string") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-400 select-none"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center justify-center min-w-[36px] px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive
                  ? "bg-black dark:bg-white text-white dark:text-black font-semibold shadow-xs"
                  : "border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="หน้าถัดไป"
          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ถัดไป ›
        </button>

        {/* Last Button */}
        <button
          type="button"
          onClick={() => handlePageChange(totalPages)}
          disabled={!canGoNext}
          aria-label="หน้าสุดท้าย"
          title="หน้าสุดท้าย"
          className="inline-flex items-center justify-center px-2.5 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          »
        </button>
      </div>
    </nav>
  );
}
