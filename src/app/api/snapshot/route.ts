import { createClient } from "@/lib/supabase/server";
import { fetchPortfolioPrices } from "@/lib/prices";
import { MILESTONES } from "@/types";
import { NextResponse } from "next/server";
import type { Asset } from "@/types";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Check if snapshot already exists for this month
  const { data: existing } = await supabase
    .from("snapshots")
    .select("id")
    .eq("user_id", user.id)
    .eq("month", month)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Snapshot already exists for this month", month },
      { status: 409 }
    );
  }

  // Fetch current assets
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", user.id);

  if (!assets || assets.length === 0) {
    return NextResponse.json(
      { error: "No assets to snapshot" },
      { status: 400 }
    );
  }

  // Get live prices
  const portfolio = await fetchPortfolioPrices(assets as Asset[]);

  // Save snapshot
  const { data: snapshot, error: snapError } = await supabase
    .from("snapshots")
    .insert({
      user_id: user.id,
      month,
      total_value_idr: Math.round(portfolio.totalValueIDR),
      total_cost_idr: Math.round(portfolio.totalCostIDR),
    })
    .select()
    .single();

  if (snapError) {
    return NextResponse.json({ error: snapError.message }, { status: 500 });
  }

  // Milestone detection — compare with previous snapshot
  const { data: prevSnapshots } = await supabase
    .from("snapshots")
    .select("total_value_idr")
    .eq("user_id", user.id)
    .neq("month", month)
    .order("month", { ascending: false })
    .limit(1);

  const prevValue = prevSnapshots?.[0]?.total_value_idr ?? 0;
  const currentValue = portfolio.totalValueIDR;

  const newMilestones: { amount: number; achieved_at: string; snapshot_month: string; user_id: string }[] = [];

  for (const milestone of MILESTONES) {
    if (prevValue < milestone && currentValue >= milestone) {
      // Check it hasn't been recorded yet
      const { data: existing } = await supabase
        .from("milestones")
        .select("id")
        .eq("user_id", user.id)
        .eq("amount", milestone)
        .maybeSingle();

      if (!existing) {
        newMilestones.push({
          user_id: user.id,
          amount: milestone,
          achieved_at: now.toISOString(),
          snapshot_month: month,
        });
      }
    }
  }

  if (newMilestones.length > 0) {
    await supabase.from("milestones").insert(newMilestones);
  }

  return NextResponse.json({
    snapshot,
    newMilestones: newMilestones.map((m) => m.amount),
    portfolio: {
      totalValueIDR: portfolio.totalValueIDR,
      totalCostIDR: portfolio.totalCostIDR,
      usdIdr: portfolio.usdIdr,
    },
  });
}
