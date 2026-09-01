import { API_URL } from "@/constants/common.constant";
import { ApiListResponse } from "@/types/api.type";
import { StockData } from "@/types/common.type";
import Pagination from "@/components/pagination";
import ProductTable from "@/components/product-table";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const pageNumber = Number(resolvedParams?.pageNumber || resolvedParams?.page) || 1;
  const pageSize = Number(resolvedParams?.pageSize) || 5;

  const url = `${API_URL}/products?pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=productCode&isAscending=true`;

  let resData: ApiListResponse<StockData> | null = null;
  try {
    const res = await fetch(url, {
      cache: "no-store", // This forces SSR (fetches fresh data on every request)
    });
    if (res.ok) {
      resData = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  const pagination = resData?.data;
  const data = pagination?.items || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">รายการสินค้า</h1>
      </div>

      <ProductTable products={data} />

      {pagination && (
        <Pagination
          currentPage={pagination.pageNumber}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
          pageSizeOptions={[3, 5, 10, 20]}
          hasPreviousPage={pagination.hasPreviousPage}
          hasNextPage={pagination.hasNextPage}
        />
      )}
    </div>
  );
}

