import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContext {
  user: User | null;
  session: Session | null;
  username: string | null;
  store: string | null;
  isAdmin: boolean;
  isManager: boolean;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    username: string,
    store: string,
    managerPasscode?: string
  ) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;

}

const AuthCtx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [store, setStore] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, store")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) throw error;
      setUsername(data?.username ?? "Usuário");
      setStore((data as { store?: string } | null)?.store ?? null);

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      if (roleError) throw roleError;
      const roles = (roleData ?? []).map((r) => String(r.role));
      setIsAdmin(roles.includes("admin"));
      setIsManager(roles.includes("manager"));
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setUsername(null);
          setStore(null);
          setIsAdmin(false);
          setIsManager(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    username: string,
    store: string,
    managerPasscode?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username,
          store,
          ...(managerPasscode
            ? { requested_role: "manager", manager_passcode: managerPasscode }
            : {}),
        },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthCtx.Provider value={{ user, session, username, store, isAdmin, isManager, loading, signUp, signIn, signOut }}>

      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
