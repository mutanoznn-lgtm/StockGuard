import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoSantaRita from "@/assets/logo-santa-rita.png";
import { LogOut, Search, Copy, Package, CheckCircle, Eye, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getDaysUntilExpiration, generateWhatsAppText, getStatusLabel } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import AddProductForm from "./AddProductForm";
import ProductCard from "./ProductCard";

interface DbProduct {
  id: string;
  name: string;
  manufacture_date: string;
  expiration_date: string;
  user_id: string;
}

interface CardProduct {
  id: string;
  name: string;
  manufactureDate: string;
  expirationDate: string;
}

const toCard = (p: DbProduct): CardProduct => ({
  id: p.id,
  name: p.name,
  manufactureDate: p.manufacture_date,
  expirationDate: p.expiration_date,
});

const Dashboard = () => {
  const { user, username, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [allProducts, setAllProducts] = useState<(CardProduct & { username: string })[]>([]);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const notifiedRef = useRef(false);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("expiration_date", { ascending: true });
    setProducts((data ?? []).map(toCard));
  }, [user]);

  const fetchAllProducts = useCallback(async () => {
    if (!user) return;
    const { data: profiles } = await supabase.from("profiles").select("user_id, username");
    const { data: prods } = await supabase.from("products").select("*").order("expiration_date", { ascending: true });
    if (!profiles || !prods) return;

    const profileMap: Record<string, string> = {};
    for (const p of profiles) profileMap[p.user_id] = p.username;

    setAllProducts(
      prods.map((p: any) => ({ ...toCard(p), username: profileMap[p.user_id] ?? "Desconhecido" }))
    );
  }, [user]);

  useEffect(() => {
    fetchProducts();
    fetchAllProducts();
  }, [fetchProducts, fetchAllProducts]);

  // Notificações de produtos próximos do vencimento
  useEffect(() => {
    if (notifiedRef.current || products.length === 0) return;
    const urgent = products.filter((p) => {
      const d = getDaysUntilExpiration(p.expirationDate);
      return d >= 0 && d <= 3;
    });
    if (urgent.length > 0) {
      notifiedRef.current = true;
      toast({
        title: `⚠️ ${urgent.length} produto${urgent.length > 1 ? "s" : ""} vencendo em breve!`,
        description: urgent.slice(0, 3).map((p) => `${p.name} — ${getStatusLabel(getDaysUntilExpiration(p.expirationDate))}`).join("\n"),
        variant: "destructive",
        duration: 8000,
      });
    }
  }, [products, toast]);

  const handleAdd = useCallback(
    async (name: string, manufactureDate: string, expirationDate: string) => {
      if (!user) return;
      await supabase.from("products").insert({
        user_id: user.id,
        name,
        manufacture_date: manufactureDate,
        expiration_date: expirationDate,
      });
      fetchProducts();
      fetchAllProducts();
    },
    [user, fetchProducts, fetchAllProducts]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
      fetchAllProducts();
    },
    [fetchProducts, fetchAllProducts]
  );

  const handleEdit = useCallback(
    async (id: string, name: string, manufactureDate: string, expirationDate: string) => {
      await supabase.from("products").update({
        name,
        manufacture_date: manufactureDate,
        expiration_date: expirationDate,
      }).eq("id", id);
      fetchProducts();
      fetchAllProducts();
    },
    [fetchProducts, fetchAllProducts]
  );

  const sortedFiltered = useMemo(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    return filtered.sort(
      (a, b) => getDaysUntilExpiration(a.expirationDate) - getDaysUntilExpiration(b.expirationDate)
    );
  }, [products, search]);

  const handleCopy = useCallback(async () => {
    const text = generateWhatsAppText(sortedFiltered);
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
  }, [sortedFiltered]);

  const stats = useMemo(() => {
    const total = products.length;
    const expired = products.filter((p) => getDaysUntilExpiration(p.expirationDate) < 0).length;
    const warning = products.filter((p) => {
      const d = getDaysUntilExpiration(p.expirationDate);
      return d >= 0 && d <= 7;
    }).length;
    return { total, expired, warning };
  }, [products]);

  return (
    <div className="min-h-screen pb-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header Section */}
        <div className="pt-6 pb-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <img src={logoSantaRita} alt="Atacadão Santa Rita" className="h-16 sm:h-20 w-auto object-contain" />
          </motion.div>

          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 glass rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Gestão de Estoque</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Bem-vindo, <span className="font-semibold text-primary">{username ?? "Usuário"}</span>
                  {isAdmin && <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Admin</span>}
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--destructive) / 0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={signOut}
              className="group flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:border-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Sair da conta
            </motion.button>
          </motion.header>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { label: "Total de Itens", value: stats.total, color: "text-foreground", icon: Package },
              { label: "Vencendo Logo", value: stats.warning, color: "text-status-yellow", icon: CheckCircle },
              { label: "Já Vencidos", value: stats.expired, color: "text-status-red", icon: Eye }
            ].map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                   <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>


        {/* Add Product */}
        <div className="mb-6">
          <AddProductForm onAdd={handleAdd} />
        </div>

        {/* Search & Actions */}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome do produto..."
              className="w-full rounded-2xl border border-border bg-white py-3 pl-11 pr-4 text-sm text-foreground shadow-sm ring-primary/20 transition-all focus:border-primary focus:outline-none focus:ring-4"
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAllProducts((v) => !v)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition-all shadow-sm ${
                showAllProducts 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <Users className="h-4 w-4" />
              {showAllProducts ? "Ver Meus Produtos" : "Ver Todos"}
            </motion.button>
            
            {products.length > 0 && (
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleCopy}
                className="rounded-2xl border border-border bg-white p-3 text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary"
                title="Copiar Lista"
              >
                {copied ? <CheckCircle className="h-5 w-5 text-status-green" /> : <Copy className="h-5 w-5" />}
              </motion.button>
            )}
          </div>
        </motion.div>


        {/* Product List */}
        {!showAllProducts ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {sortedFiltered.map((product, index) => (
                  <ProductCard key={product.id} product={product} onDelete={handleDelete} onEdit={handleEdit} index={index} />
                ))}
              </AnimatePresence>
            </div>

            {products.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 text-center">
                <Package className="mx-auto mb-6 h-20 w-20 text-muted-foreground/20" />
                <p className="text-xl font-bold text-muted-foreground">Estoque vazio</p>
                <p className="text-sm text-muted-foreground/60 mt-2">Os produtos que você cadastrar aparecerão aqui.</p>

              </motion.div>
            )}

            {products.length > 0 && sortedFiltered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Nenhum produto encontrado para "{search}"</p>
              </motion.div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Todos os Produtos</h2>
              <span className="text-sm text-muted-foreground">({allProducts.length})</span>
            </div>
            {allProducts.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <Eye className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground">Nenhum produto cadastrado ainda</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {allProducts.map((product, index) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} onDelete={handleDelete} onEdit={handleEdit} index={index} />
                    <span className="absolute top-2 right-2 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {product.username}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
