import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  className,
  rowKey,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 sticky top-0 z-10">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap",
                  col.headerClassName,
                  col.width,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={rowKey(row, idx)}
              className={cn(
                "border-b border-border/60 transition-colors",
                onRowClick
                  ? "cursor-pointer hover:bg-muted/40"
                  : "hover:bg-muted/20",
              )}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && onRowClick?.(row)
              }
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              data-ocid={`table.row.${idx + 1}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-3 py-2.5 text-foreground", col.className)}
                >
                  {col.cell(row, idx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
