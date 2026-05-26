import { motion } from "framer-motion";
import { Search, Package } from "lucide-react";

interface EmptyStateProps {
  search: string;
  showAllProducts: boolean;
}

export const EmptyState = ({ search, showAllProducts }: EmptyStateProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 text-center py-12 glass rounded-3xl">
      {search ? (
        <>
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
          <p className="text-lg font-bold text-muted-foreground">Nenhum resultado</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Tente buscar por outro termo.</p>
        </>
      ) : (
        <>
          <Package className="mx-auto mb-6 h-20 w-20 text-muted-foreground/20" />
          <p className="text-xl font-bold text-muted-foreground">Estoque vazio</p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            {showAllProducts ? "Nenhum produto cadastrado no sistema." : "Os produtos que você cadastrar aparecerão aqui."}
          </p>
        </>
      )}
    </motion.div>
  );
};
