const columns = [
  { label: "รหัสสินค้า", align: "text-left" },
  { label: "ชื่อสินค้า", align: "text-left" },
  { label: "ราคาขายต่อหน่วย", align: "text-right" },
  { label: "จำนวนคงเหลือ", align: "text-right" },
  { label: "", align: "text-center w-16" },
  { label: "", align: "text-center w-16" },
];

export interface ProductTableLoadingProps {
  rowCount?: number;
}

export default function ProductTableLoading({
  rowCount = 5,
}: ProductTableLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="กำลังโหลดข้อมูลสินค้า"
      className="w-full animate-pulse overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
    >
      <table className="w-full table-auto border-collapse text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300">
          <tr>
            {columns.map((column, index) => (
              <th
                key={`${column.label}-${index}`}
                className={`px-4 py-3 font-semibold ${column.align}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <tr key={rowIndex} aria-hidden="true">
              <td className="px-4 py-3">
                <div className="h-5 w-20 rounded-md bg-zinc-200 dark:bg-zinc-700" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-40 rounded-md bg-zinc-200 dark:bg-zinc-700" />
              </td>
              <td className="px-4 py-3">
                <div className="ml-auto h-5 w-24 rounded-md bg-zinc-200 dark:bg-zinc-700" />
              </td>
              <td className="px-4 py-3">
                <div className="ml-auto h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              </td>
              <td className="px-3 py-3">
                <div className="mx-auto h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
              </td>
              <td className="px-3 py-3">
                <div className="mx-auto h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">กำลังโหลดข้อมูลสินค้า...</span>
    </div>
  );
}
