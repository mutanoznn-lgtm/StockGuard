import { motion } from "framer-motion";
import { LogOut, Package } from "lucide-react";
import logoSantaRita from "@/assets/logo-santa-rita.png";

interface DashboardHeaderProps {
  username: string | null;
  isAdmin: boolean;
  onSignOut: () => void;
}

export const DashboardHeader = ({ username, isAdmin, onSignOut }: DashboardHeaderProps) => {
  return (
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
              {isAdmin && (
                <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Admin
                </span>
              )}
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--destructive) / 0.1)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onSignOut}
          className="group flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:border-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Sair da conta
        </motion.button>
      </motion.header>
    </div>
  );
};
