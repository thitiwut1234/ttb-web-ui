import ProductTableLoading from "@/components/product-table-loading";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          รายการสินค้า
        </h1>
      </div>

      <ProductTableLoading />

      <div
        aria-hidden="true"
        className="flex animate-pulse flex-col items-center justify-between gap-4 py-4 md:flex-row"
      >
        <div className="h-8 w-64 rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-80 max-w-full rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
