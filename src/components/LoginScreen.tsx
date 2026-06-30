import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, Lock, Package, Mail, UserPlus, Store, ShieldCheck, KeyRound } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import logoSantaRita from "@/assets/logo-santa-rita.png";

const LoginScreen = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [storeCode, setStoreCode] = useState<"006" | "005">("006");
  const [isManager, setIsManager] = useState(false);
  const [managerPass, setManagerPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha");
      return;
    }
    if (isSignUp && !username.trim()) {
      setError("Preencha o nome de usuário");
      return;
    }
    if (isSignUp && isManager && !managerPass.trim()) {
      setError("Informe a senha de gerente");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(
          email.trim(),
          password,
          username.trim(),
          storeCode,
          isManager ? managerPass.trim() : undefined
        );
        if (error) setError(error);
        else setSuccess("Conta criada! Verifique seu e-mail para confirmar.");
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) setError("E-mail ou senha incorretos");
      }
    } catch (err: any) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex items-center justify-center"
          >
            <img src={logoSantaRita} alt="Atacadão Santa Rita" className="h-24 w-auto object-contain" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-2 text-center text-3xl font-bold text-foreground"
          >
            Controle de Validade
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 text-center text-muted-foreground"
          >
            {isSignUp ? "Crie sua conta" : "Acesse sua conta"}
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Nome de Usuário
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    placeholder="Seu nome"
                    className="w-full rounded-2xl border border-border bg-muted/30 py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </motion.div>
            )}

            {isSignUp && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Loja
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["006", "005"] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setStoreCode(code)}
                      className={`flex items-center justify-center gap-2 rounded-2xl border py-3 font-bold transition-all ${
                        storeCode === code
                          ? "border-primary bg-primary/10 text-primary shadow-inner"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <Store className="h-4 w-4" />
                      Santa Rita {code}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {isSignUp && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setIsManager((v) => !v); setError(""); }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                    isManager
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Criar conta de gerente
                  </span>
                  <span className={`h-5 w-9 rounded-full p-0.5 transition-all ${isManager ? "bg-primary" : "bg-border"}`}>
                    <span className={`block h-4 w-4 rounded-full bg-background transition-all ${isManager ? "translate-x-4" : ""}`} />
                  </span>
                </button>

                {isManager && (
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      value={managerPass}
                      onChange={(e) => { setManagerPass(e.target.value); setError(""); }}
                      placeholder="Senha de gerente"
                      className="w-full rounded-2xl border border-border bg-muted/30 py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                )}
              </motion.div>
            )}


            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="seu@email.com"
                  className="w-full rounded-2xl border border-border bg-muted/30 py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Sua senha"
                  className="w-full rounded-2xl border border-border bg-muted/30 py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive font-medium">
                {error}
              </motion.p>
            )}
            
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl bg-status-green-bg p-4 border border-status-green/20">
                <p className="text-sm font-bold text-status-green text-center">
                  {success}
                </p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
            >
              {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {loading ? "Aguarde..." : isSignUp ? "Criar Conta" : "Entrar"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }}
              className="font-medium text-primary hover:underline"
            >
              {isSignUp ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;