import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar } from "lucide-react";

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

interface AddProductFormProps {
  onAdd: (name: string, manufactureDate: string, expirationDate: string) => void;
}

function getTodayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const AddProductForm = ({ onAdd }: AddProductFormProps) => {
  const [name, setName] = useState("");
  const [expDateText, setExpDateText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exDate = maskedToIso(expDateText);
    if (!name.trim()) return;
    if (!exDate) {
      // Pequena validação extra
      return;
    }
    onAdd(name.trim(), getTodayIso(), exDate);
    setName("");
    setExpDateText("");
  };

  const inputClass =
    "w-full rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all";


  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 shadow-sm mb-8"
    >
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
        <Plus className="h-6 w-6 text-primary" />
        Novo Lançamento
      </h2>


      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome do Produto</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Leite Integral"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Vencimento</label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              inputMode="numeric"
              value={expDateText}
              onChange={(e) => setExpDateText(applyDateMask(e.target.value))}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              className={`${inputClass} pl-9`}
              required
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          Salvar Produto
        </motion.button>

      </div>
    </motion.form>
  );
};

export default AddProductForm;
