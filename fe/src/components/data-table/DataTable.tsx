import { useState, useMemo, useEffect, useCallback } from "react";
import { IconColumns } from "@tabler/icons-react";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableBody } from "./DataTableBody";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableSearch } from "./DataTableSearch";
import type { Column, PaginatedData, SortDirection } from "./types";
import "./data-table.css";

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[] | PaginatedData<T>;
  title?: string;
  description?: string;
  withCard?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  initialSearch?: string;
  loading?: boolean;
  emptyText?: string;
  pageSize?: number;
  allowedPageSizes?: number[];
  showColumnToggle?: boolean;
  columnVisibilityKey?: string;
  onRowClick?: (row: T) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSortChange?: (column: string, direction: SortDirection) => void;
  onSearch?: (query: string) => void;
  renderHeaderActions?: () => React.ReactNode;
  renderToolbarFilters?: () => React.ReactNode;
  renderActions?: (row: T) => React.ReactNode;
  renderMobileCard?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  title,
  description,
  withCard = true,
  searchable = false,
  searchPlaceholder = "Search...",
  initialSearch = "",
  loading = false,
  emptyText = "No data available",
  pageSize,
  allowedPageSizes,
  showColumnToggle = false,
  columnVisibilityKey,
  onRowClick,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSearch,
  renderHeaderActions,
  renderToolbarFilters,
  renderActions,
  renderMobileCard,
}: DataTableProps<T>) {
  // Search state
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Sort state
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Column visibility state
  const getStorageKey = useCallback(
    () =>
      columnVisibilityKey
        ? `data-table-column-visibility:${columnVisibilityKey}`
        : null,
    [columnVisibilityKey]
  );

  const getDefaultHiddenIds = (): Set<string> =>
    new Set(columns.filter((col) => col.hidden).map((col) => col.id));

  const getPersistedHiddenIds = (): Set<string> | null => {
    if (typeof window === "undefined") return null;
    const key = getStorageKey();
    if (!key) return null;

    const stored = window.localStorage.getItem(key);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return null;
      const availableIds = new Set(columns.map((col) => col.id));
      return new Set(
        parsed.filter(
          (id: unknown) => typeof id === "string" && availableIds.has(id)
        )
      );
    } catch {
      return null;
    }
  };

  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(
    getPersistedHiddenIds() ?? getDefaultHiddenIds()
  );

  // Persist column visibility
  useEffect(() => {
    const key = getStorageKey();
    if (!key) return;
    window.localStorage.setItem(key, JSON.stringify([...hiddenColumnIds]));
  }, [getStorageKey, hiddenColumnIds]);

  const toggleColumnVisibility = (columnId: string) => {
    const next = new Set(hiddenColumnIds);
    if (next.has(columnId)) {
      next.delete(columnId);
    } else {
      next.add(columnId);
    }
    setHiddenColumnIds(next);
  };

  // Visible columns
  const visibleColumns = useMemo(
    () => columns.filter((col) => !hiddenColumnIds.has(col.id)),
    [columns, hiddenColumnIds]
  );

  // Check if data is paginated from server
  const isPaginated = useMemo(
    () =>
      data &&
      typeof data === "object" &&
      "data" in data &&
      "current_page" in data,
    [data]
  );

  const tableData = useMemo(() => {
    if (isPaginated) {
      return (data as PaginatedData<T>).data ?? [];
    }
    return data as T[];
  }, [data, isPaginated]);

  const paginationMeta = useMemo(() => {
    if (isPaginated) {
      const paginated = data as PaginatedData<T>;
      return {
        current_page: paginated.current_page,
        last_page: paginated.last_page,
        per_page: paginated.per_page,
        total: paginated.total,
      };
    }
    return undefined;
  }, [data, isPaginated]);

  // Handle sort
  const handleSort = useCallback(
    (columnId: string) => {
      let newDirection: SortDirection = "asc";
      if (sortColumn === columnId) {
        newDirection = sortDirection === "asc" ? "desc" : "asc";
      }
      setSortColumn(columnId);
      setSortDirection(newDirection);
      onSortChange?.(columnId, newDirection);
    },
    [sortColumn, sortDirection, onSortChange]
  );

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      onPageChange?.(page);
    },
    [onPageChange]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (size: number) => {
      onPageSizeChange?.(size);
    },
    [onPageSizeChange]
  );

  const hasActions = !!renderActions;

  const cardClassName = withCard ? "data-table-wrapper data-table-wrapper--card" : "data-table-wrapper";

  return (
    <div className={cardClassName}>
      {/* Header */}
      {(title || renderHeaderActions) && (
        <div className="data-table__header-section">
            {title && <h2 className="data-table__title">{title}</h2>}
            {description && (
              <p className="data-table__description">{description}</p>
            )}
          {renderHeaderActions && (
            <div className="data-table__header-actions">
              {renderHeaderActions()}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      {(searchable || showColumnToggle || renderToolbarFilters) && (
        <div className="data-table__toolbar">
          <div className="data-table__toolbar-left">
            {searchable && (
              <DataTableSearch
                value={searchQuery}
                placeholder={searchPlaceholder}
                onSearch={handleSearch}
              />
            )}
          </div>
          <div className="data-table__toolbar-right">
            {renderToolbarFilters && renderToolbarFilters()}
            {showColumnToggle && (
              <div className="data-table__column-toggle">
                <button className="data-table__column-toggle-btn">
                  <IconColumns size={16} />
                  <span>View</span>
                </button>
                <div className="data-table__column-toggle-dropdown">
                  {columns.map((column) => (
                    <label
                      key={column.id}
                      className="data-table__column-toggle-item"
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumnIds.has(column.id)}
                        onChange={() => toggleColumnVisibility(column.id)}
                      />
                      <span>{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="data-table desktop-only">
        <table>
          <DataTableHeader
            columns={visibleColumns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            hasActions={hasActions}
            onSort={handleSort}
          />
          {loading ? (
            <tbody>
              <tr>
                <td
                  colSpan={visibleColumns.length + (hasActions ? 1 : 0)}
                  className="data-table__loading"
                >
                  Loading...
                </td>
              </tr>
            </tbody>
          ) : tableData.length === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={visibleColumns.length + (hasActions ? 1 : 0)}
                  className="data-table__empty"
                >
                  {emptyText}
                </td>
              </tr>
            </tbody>
          ) : (
            <DataTableBody
              data={tableData}
              columns={visibleColumns}
              onRowClick={onRowClick}
              renderActions={renderActions}
            />
          )}
        </table>
      </div>

      {/* Mobile Cards */}
      {renderMobileCard && (
        <div className="data-cards mobile-only">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : tableData.length === 0 ? (
            <div className="data-table__empty">{emptyText}</div>
          ) : (
            tableData.map((row) => renderMobileCard(row))
          )}
        </div>
      )}

      {/* Pagination */}
      {(paginationMeta || !isPaginated) && tableData.length > 0 && (
        <DataTablePagination
          meta={paginationMeta}
          pageSize={pageSize}
          allowedPageSizes={allowedPageSizes}
          loading={loading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
