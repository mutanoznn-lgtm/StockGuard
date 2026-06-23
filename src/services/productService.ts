import { supabase } from "@/integrations/supabase/client";
import { Product, toProduct } from "@/types/product";

export const productService = {
  async fetchAll() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("expiration_date", { ascending: true });

    if (error) throw error;

    const products = data ?? [];
    const userIds = Array.from(new Set(products.map((p) => p.user_id)));

    let profilesMap = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);
      (profiles ?? []).forEach((pr: any) => profilesMap.set(pr.user_id, pr.username));
    }

    return products.map((p) =>
      toProduct({ ...p, profiles: { username: profilesMap.get(p.user_id) ?? "Desconhecido" } })
    );
  },

  async add(userId: string, name: string, manufactureDate: string, expirationDate: string) {
    const { data, error } = await supabase.from("products").insert({
      user_id: userId,
      name,
      manufacture_date: manufactureDate,
      expiration_date: expirationDate,
    }).select().single();

    if (error) throw error;
    return toProduct(data);
  },

  async delete(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  async update(id: string, name: string, manufactureDate: string, expirationDate: string) {
    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        manufacture_date: manufactureDate,
        expiration_date: expirationDate,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toProduct(data);
  },
};
