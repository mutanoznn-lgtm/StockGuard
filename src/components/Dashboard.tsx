import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getDaysUntilExpiration, generateWhatsAppText } from "@/lib/products";
import { useProducts } from "@/hooks/useProducts";
import { useProductStats } from "@/hooks/useProductStats";
import { useProductNotifications } from "@/hooks/useProductNotifications";

import AddProductForm from "./products/AddProductForm";
import { ProductList } from "./products/ProductList";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { StatsGrid } from "./dashboard/StatsGrid";
import { FilterBar } from "./dashboard/FilterBar";
import { EmptyState } from "./dashboard/EmptyState";

const Dashboard = () => {
  const { user, username, isAdmin, signOut } = useAuth();
  const { products, isLoading, handleAdd, handleDelete, handleEdit } = useProducts(user);
  
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(isAdmin);

  // Admins veem todos os produtos por padrão
  useEffect(() => {
    if (isAdmin) setShowAllProducts(true);
  }, [isAdmin]);

  // Notifications
  useProductNotifications(products);

  // Stats logic
  const stats = useProductStats(products, user?.id);

  // Filter logic
  const filteredProducts = useMemo(() => {
    let list = products;
    if (!showAllProducts) {
      list = products.filter(p => p.user_id === user?.id);
    }
    
    return list
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => getDaysUntilExpiration(a.expirationDate) - getDaysUntilExpiration(b.expirationDate));
  }, [products, search, showAllProducts, user?.id]);

  const handleCopy = useCallback(async () => {
    const text = generateWhatsAppText(filteredProducts);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [filteredProducts]);

  return (
    <div className="min-h-screen pb-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <DashboardHeader 
          username={username} 
          isAdmin={isAdmin} 
          onSignOut={signOut} 
        />

        <StatsGrid stats={stats} />

        <div className="mt-8 mb-6">
          <AddProductForm onAdd={handleAdd} />
        </div>

        <FilterBar 
          search={search}
          onSearchChange={setSearch}
          showAllProducts={showAllProducts}
          onToggleShowAll={() => setShowAllProducts(v => !v)}
          onCopy={handleCopy}
          copied={copied}
          hasProducts={products.length > 0}
        />

        <div className="space-y-6">
          {showAllProducts && (
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Todos os Produtos</h2>
              <span className="text-sm text-muted-foreground">({filteredProducts.length})</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1 }} 
                className="mb-4 h-10 w-10 rounded-full border-4 border-primary border-t-transparent" 
              />
              <p className="text-muted-foreground animate-pulse">Carregando estoque...</p>
            </div>
          ) : (
            <>
              <ProductList 
                products={filteredProducts}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isAdmin={isAdmin}
                currentUserId={user?.id}
                showAllProducts={showAllProducts}
              />

              {filteredProducts.length === 0 && (
                <EmptyState 
                  search={search} 
                  showAllProducts={showAllProducts} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
