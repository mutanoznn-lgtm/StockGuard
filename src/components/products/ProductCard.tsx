import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Pencil, Clock, Check, X } from "lucide-react";
import type { Product } from "@/types/product";
import { getDaysUntilExpiration, getStatusColor, getStatusLabel, formatDate } from "@/lib/products";

function applyDateMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function maskedToIso(masked: string): string | null {
  const match = masked.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function isoToMasked(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onEdit?: (id: string, name: string, manufactureDate: string, expirationDate: string) => void;
  index: number;
  readOnly?: boolean;
}

const statusClasses = {
  green: "border-l-4 border-l-status-green shadow-sm",
  yellow: "border-l-4 border-l-status-yellow shadow-sm",
  red: "border-l-4 border-l-status-red shadow-sm",
};

const statusBadgeClasses = {
  green: "bg-status-green-bg text-status-green",
  yellow: "bg-status-yellow-bg text-status-yellow",
  red: "bg-status-red-bg text-status-red",
};


const ProductCard = ({ product, onDelete, onEdit, index, readOnly }: ProductCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);
  const [editManuf, setEditManuf] = useState(isoToMasked(product.manufactureDate));
  const [editExp, setEditExp] = useState(isoToMasked(product.expirationDate));

  const days = getDaysUntilExpiration(product.expirationDate);
  const status = getStatusColor(days);
  const label = getStatusLabel(days);

  const handleSave = () => {
    const mf = maskedToIso(editManuf);
    const ex = maskedToIso(editExp);
    if (!editName.trim() || !mf || !ex) return;
    onEdit?.(product.id, editName.trim(), mf, ex);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(product.name);
    setEditManuf(isoToMasked(product.manufactureDate));
    setEditExp(isoToMasked(product.expirationDate));
    setEditing(false);
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-muted/50 px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -50 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative group float-card rounded-2xl p-4 sm:p-5 overflow-hidden border border-border/50 ${statusClasses[status]} transition-all hover:shadow-md hover:border-primary/20 min-w-0 max-w-full`}
    >

      {editing ? (
        <div className="space-y-2">
          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} placeholder="Nome do produto" />
          <div>
            <input type="text" inputMode="numeric" value={editExp} onChange={(e) => setEditExp(applyDateMask(e.target.value))} placeholder="Venc: DD/MM/AAAA" maxLength={10} className={inputClass} />
          </div>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              <Check className="h-3.5 w-3.5" /> Salvar
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleCancel} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Cancelar
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-base sm:text-lg font-semibold text-foreground leading-tight">
              {product.name}
            </h3>
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Venc: {formatDate(product.expirationDate)}</span>
              </span>
            </div>

            <div className="mt-3">
              <span className={`inline-flex items-center rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-wider ${statusBadgeClasses[status]}`}>
                {label}
              </span>

            </div>
          </div>

          {!readOnly && (
            <div className="flex flex-shrink-0 gap-1">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setEditing(true)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                aria-label="Editar produto"
              >
                <Pencil className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(product.id)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                aria-label="Excluir produto"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ProductCard;
