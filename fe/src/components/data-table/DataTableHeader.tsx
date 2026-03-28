import {
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
} from "@tabler/icons-react";
import type { Column, SortDirection } from "./types";

interface DataTableHeaderProps<T extends object> {
  columns: Column<T>[];
  sortColumn?: string;
  sortDirection?: SortDirection;
  hasActions?: boolean;
  onSort?: (columnId: string) => void;
}

export function DataTableHeader<T extends object>({
  columns,
  sortColumn,
  sortDirection,
  hasActions = false,
  onSort,
}: DataTableHeaderProps<T>) {
  const getAlignmentClass = (align?: Column["align"]) => {
    switch (align) {
      case "center":
        return "data-table__th--center";
      case "right":
        return "data-table__th--right";
      default:
        return "";
    }
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    if (sortColumn !== column.id) return <IconArrowsSort size={14} />;
    return sortDirection === "asc" ? (
      <IconArrowUp size={14} />
    ) : (
      <IconArrowDown size={14} />
    );
  };

  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={column.id}
            className={`data-table__th ${getAlignmentClass(column.align)} ${
              column.sortable ? "data-table__th--sortable" : ""
            } ${column.className || ""}`}
            style={{ width: column.width }}
            onClick={() => column.sortable && onSort?.(column.id)}
          >
            <div className="data-table__th-content">
              <span>{column.label}</span>
              {getSortIcon(column)}
            </div>
          </th>
        ))}
        {hasActions && (
          <th className="data-table__th data-table__th--center data-table__th--actions">
            Actions
          </th>
        )}
      </tr>
    </thead>
  );
}
