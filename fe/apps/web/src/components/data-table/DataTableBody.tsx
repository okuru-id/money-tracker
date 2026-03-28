import type { Column } from "./types";

interface DataTableBodyProps<T = any> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
}

export function DataTableBody<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  renderActions,
}: DataTableBodyProps<T>) {
  const getAlignmentClass = (align?: Column["align"]) => {
    switch (align) {
      case "center":
        return "data-table__td--center";
      case "right":
        return "data-table__td--right";
      default:
        return "";
    }
  };

  const getCellContent = (row: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(row);
    }
    const value = row[column.id as keyof T];
    if (value === null || value === undefined) return "-";
    return String(value);
  };

  return (
    <tbody>
      {data.map((row) => (
        <tr
          key={row.id}
          className={`data-table__tr ${
            onRowClick ? "data-table__tr--clickable" : ""
          }`}
          onClick={() => onRowClick?.(row)}
        >
          {columns.map((column) => (
            <td
              key={column.id}
              className={`data-table__td ${getAlignmentClass(column.align)} ${
                column.className || ""
              }`}
              style={{ width: column.width }}
            >
              {getCellContent(row, column)}
            </td>
          ))}
          {renderActions && (
            <td className="data-table__td data-table__td--actions">
              <div
                className="data-table__actions"
                onClick={(e) => e.stopPropagation()}
              >
                {renderActions(row)}
              </div>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  );
}