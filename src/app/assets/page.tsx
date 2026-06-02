import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AssetsList from "@/components/assets/AssetsList";

export default async function AssetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Assets</h1>
        <p className="text-[#6B7280] text-sm mt-1">Manage your investment portfolio</p>
      </div>
      <AssetsList initialAssets={assets ?? []} />
    </div>
  );
}
