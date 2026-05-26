import { motion } from "framer-motion";
import { Search, Users, CheckCircle, Copy } from "lucide-react";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  showAllProducts: boolean;
  onToggleShowAll: () => void;
  onCopy: () => void;
  copied: boolean;
  hasProducts: boolean;
}

export const FilterBar = ({
  search,
  onSearchChange,
  showAllProducts,
  onToggleShowAll,
  onCopy,
  copied,
  hasProducts
}: FilterBarProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ delay: 0.2 }} 
      className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome do produto..."
          className="w-full rounded-2xl border border-border bg-white py-3 pl-11 pr-4 text-sm text-foreground shadow-sm ring-primary/20 transition-all focus:border-primary focus:outline-none focus:ring-4"
        />
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleShowAll}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition-all shadow-sm ${
            showAllProducts 
              ? "border-primary bg-primary text-primary-foreground" 
              : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <Users className="h-4 w-4" />
          {showAllProducts ? "Ver Meus Produtos" : "Ver Todos"}
        </motion.button>
        
        {hasProducts && (
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={onCopy}
            className="rounded-2xl border border-border bg-white p-3 text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary"
            title="Copiar Lista"
          >
            {copied ? <CheckCircle className="h-5 w-5 text-status-green" /> : <Copy className="h-5 w-5" />}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
