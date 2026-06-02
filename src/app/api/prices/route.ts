import { createClient } from "@/lib/supabase/server";
import { fetchPortfolioPrices } from "@/lib/prices";
import { NextResponse } from "next/server";
import type { Asset } from "@/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", user.id);

  if (!assets || assets.length === 0) {
    return NextResponse.json({ prices: [], totalValueIDR: 0, totalCostIDR: 0, usdIdr: 15800 });
  }

  const result = await fetchPortfolioPrices(assets as Asset[]);
  return NextResponse.json(result);
}
