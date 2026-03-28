export interface Column<T extends object = Record<string, unknown>> {
  id: string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  hidden?: boolean;
  cell?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedData<T extends object = Record<string, unknown>> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export type SortDirection = 'asc' | 'desc';
