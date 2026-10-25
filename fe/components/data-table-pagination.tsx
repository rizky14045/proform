"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationMeta } from "@/types";

interface DataTablePaginationProps {
  pagination?: PaginationMeta;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
  limitOptions?: number[];
  isLoading?: boolean;
}

export function DataTablePagination({
  pagination,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 25, 50, 100],
  isLoading = false,
}: DataTablePaginationProps) {
  if (!pagination) return null;

  const { page, limit, total_items, total_pages } = pagination;
  const startItem = total_items === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total_items);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 border-t border-border">
      <div className="text-xs text-muted-foreground order-2 sm:order-1">
        Menampilkan{" "}
        <span className="font-semibold text-foreground">
          {startItem} - {endItem}
        </span>{" "}
        dari <span className="font-semibold text-foreground">{total_items}</span> data
      </div>

      <div className="flex items-center gap-4 sm:gap-6 order-1 sm:order-2">
        {onLimitChange && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Baris per halaman</span>
            <select
              value={limit}
              disabled={isLoading}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Baris per halaman"
              className="h-8 text-xs rounded-md border border-input bg-background px-2 py-1 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={page <= 1 || isLoading}
            title="Halaman Pertama"
            aria-label="Halaman Pertama"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            title="Halaman Sebelumnya"
            aria-label="Halaman Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center px-2 text-xs font-medium text-foreground">
            Halaman {page} dari {total_pages || 1}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= total_pages || isLoading}
            title="Halaman Selanjutnya"
            aria-label="Halaman Selanjutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(total_pages)}
            disabled={page >= total_pages || isLoading}
            title="Halaman Terakhir"
            aria-label="Halaman Terakhir"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

