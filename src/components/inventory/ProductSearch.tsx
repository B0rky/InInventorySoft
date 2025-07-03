
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

export function ProductSearch({ onSearch, placeholder = "Buscar productos..." }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300); // Debounce de 300ms para evitar demasiadas búsquedas

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
