import { useState, useEffect, useRef } from "react";
import { IconSearch } from "@tabler/icons-react";

interface DataTableSearchProps {
  value?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
}

export function DataTableSearch({
  value = "",
  placeholder = "Search...",
  onSearch,
}: DataTableSearchProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, onSearch]);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  return (
    <div className="data-table__search">
      <IconSearch size={16} className="data-table__search-icon" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="data-table__search-input"
      />
    </div>
  );
}