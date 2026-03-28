import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { PaginationMeta } from "./types";

interface DataTablePaginationProps {
  meta?: PaginationMeta;
  pageSize?: number;
  allowedPageSizes?: number[];
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

export function DataTablePagination({
  meta,
  pageSize,
  allowedPageSizes = DEFAULT_PAGE_SIZES,
  loading = false,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  if (!meta) return null;

  const from = (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  const getVisiblePages = (): (number | string)[] => {
    const { current_page, last_page } = meta;

    if (last_page <= 1) return [1];

    const delta = 2;
    const range: number[] = [];

    for (
      let i = Math.max(2, current_page - delta);
      i <= Math.min(last_page - 1, current_page + delta);
      i++
    ) {
      range.push(i);
    }

    const pages: (number | string)[] = [];

    if (current_page - delta > 2) {
      pages.push(1, "...");
    } else {
      pages.push(1);
    }

    pages.push(...range);

    if (current_page + delta < last_page - 1) {
      pages.push("...", last_page);
    } else {
      pages.push(last_page);
    }

    return pages;
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > meta.last_page || loading) return;
    onPageChange(page);
  };

  return (
    <div className="data-table__pagination">
      <div className="data-table__pagination-summary">
        Showing {meta.total === 0 ? 0 : from} to {to} of {meta.total} results
      </div>

      <div className="data-table__pagination-controls">
        <div className="data-table__pagination-size">
          <span>Show:</span>
          <select
            value={pageSize ?? meta.per_page}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={loading}
          >
            {allowedPageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>

        <div className="data-table__pagination-pages">
          <button
            className="data-table__pagination-btn"
            onClick={() => goToPage(meta.current_page - 1)}
            disabled={meta.current_page === 1 || loading}
          >
            <IconChevronLeft size={16} />
          </button>

          {getVisiblePages().map((page, idx) => (
            <button
              key={idx}
              className={`data-table__pagination-btn ${
                page === meta.current_page ? "data-table__pagination-btn--active" : ""
              }`}
              onClick={() => typeof page === "number" && goToPage(page)}
              disabled={page === "..." || loading}
            >
              {page}
            </button>
          ))}

          <button
            className="data-table__pagination-btn"
            onClick={() => goToPage(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page || loading}
          >
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}