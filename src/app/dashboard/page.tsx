import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatIDR, formatPercent } from "@/lib/utils";
import PortfolioChart from "@/components/dashboard/PortfolioChart";
import CompositionChart from "@/components/dashboard/CompositionChart";
import LivePortfolio from "@/components/dashboard/LivePortfolio";
import { fetchUsdIdr } from "@/lib/prices";
import { ASSET_COLORS, ASSET_LABELS, type AssetType } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch snapshots for chart
  const { data: snapshots } = await supabase
    .from("snapshots")
    .select("*")
    .eq("user_id", user.id)
    .order("month", { ascending: true });

  // Fetch assets
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", user.id);

  const chartData = (snapshots ?? []).map((s: any) => ({
    month: s.month,
    value: s.total_value_idr,
    cost: s.total_cost_idr,
  }));

  const totalValue = chartData[chartData.length - 1]?.value ?? 0;
  const totalCost = chartData[chartData.length - 1]?.cost ?? 0;
  const totalReturn = totalValue - totalCost;
  const returnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  // YTD
  const now = new Date();
  const ytdMonth = `${now.getFullYear()}-01`;
  const ytdSnap = chartData.find((d) => d.month === ytdMonth);
  const ytdPct = ytdSnap && ytdSnap.value > 0
    ? ((totalValue - ytdSnap.value) / ytdSnap.value) * 100
    : 0;

  // Composition — cost basis in IDR, correct per asset type
  const usdIdr = await fetchUsdIdr();
  const assetGroups: Record<string, number> = {};

  for (const asset of assets ?? []) {
    const type = asset.type as AssetType;
    let valueIDR = 0;

    if (type === "saham_id") {
      // quantity = lots, 1 lot = 100 shares, avg_price = IDR/share
      valueIDR = asset.quantity * 100 * asset.avg_price;
    } else if (type === "saham_us" || type === "crypto") {
      // avg_price in USD → convert to IDR
      valueIDR = asset.quantity * asset.avg_price * usdIdr;
    } else if (type === "reksa_dana") {
      // quantity = 1, avg_price = total invested (IDR)
      valueIDR = asset.avg_price;
    } else if (type === "cash") {
      // quantity = 1, avg_price = amount in asset's currency
      valueIDR = asset.currency === "USD"
        ? asset.avg_price * usdIdr
        : asset.avg_price;
    }

    console.log(
      `[composition] ${asset.symbol ?? asset.name} (${type}):`,
      `qty=${asset.quantity} avg_price=${asset.avg_price} currency=${asset.currency}`,
      `→ IDR ${valueIDR.toLocaleString()}`
    );

    assetGroups[type] = (assetGroups[type] ?? 0) + valueIDR;
  }

  console.log("[composition] groups:", assetGroups, "usdIdr:", usdIdr);

  const assetTotal = Object.values(assetGroups).reduce((a, b) => a + b, 0);
  const compositionData = Object.entries(assetGroups).map(([type, value]) => ({
    type: type as AssetType,
    value,
    pct: assetTotal > 0 ? (value / assetTotal) * 100 : 0,
  }));

  const statCards = [
    {
      label: "Total Return",
      value: formatIDR(Math.abs(totalReturn)),
      prefix: totalReturn >= 0 ? "+" : "-",
      sub: formatPercent(returnPct),
      positive: totalReturn >= 0,
    },
    {
      label: "Growth YTD",
      value: `${ytdPct >= 0 ? "+" : ""}${ytdPct.toFixed(2)}%`,
      sub: `Since Jan ${now.getFullYear()}`,
      positive: ytdPct >= 0,
    },
    {
      label: "Total Modal",
      value: formatIDR(totalCost),
      sub: "Cost basis",
      positive: true,
      neutral: true,
    },
  ];

  // Best performing asset (by unrealized return)
  const bestAsset = (assets ?? []).reduce(
    (best: any, a: any) => {
      const ret = a.current_price
        ? ((a.current_price - a.avg_price) / a.avg_price) * 100
        : 0;
      return !best || ret > best.ret ? { ...a, ret } : best;
    },
    null
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
        <p className="text-[#6B7280] text-sm mt-1">Your portfolio at a glance</p>
      </div>

      {/* Live portfolio + snapshot button */}
      <LivePortfolio assets={assets ?? []} />

      {/* Historical stat cards (from snapshots) */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="card p-5">
              <p className="text-xs text-[#6B7280] mb-2">{s.label}</p>
              <p className={`text-xl font-bold ${s.neutral ? "text-[#111827]" : s.positive ? "text-[#059669]" : "text-red-500"}`}>
                {s.prefix}{s.value}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart + Composition */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {chartData.length > 0 ? (
            <PortfolioChart data={chartData} />
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center py-16 text-center">
              <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mb-4 opacity-30">
                <path d="M6 36L14 24l8 8 12-16L44 20" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="font-medium text-[#111827] mb-1">No snapshots yet</p>
              <p className="text-sm text-[#6B7280]">Hit &quot;Record Snapshot&quot; above to lock in today&apos;s prices and start your chart.</p>
            </div>
          )}
        </div>
        <CompositionChart data={compositionData} />
      </div>

      {/* Consistency + Best performer */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <p className="font-semibold text-[#111827] mb-4">Monthly Consistency</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - (11 - i));
              const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              const has = chartData.some((s) => s.month === m);
              return (
                <div
                  key={m}
                  title={m}
                  className={`w-7 h-7 rounded-lg ${has ? "bg-[#059669]" : "bg-[#F3F4F6]"}`}
                />
              );
            })}
          </div>
          <p className="text-xs text-[#9CA3AF] mt-3">
            {chartData.length} snapshot{chartData.length !== 1 ? "s" : ""} recorded
          </p>
        </div>

        <div className="card p-6">
          <p className="font-semibold text-[#111827] mb-4">Best Performer</p>
          {bestAsset ? (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{ background: ASSET_COLORS[bestAsset.type as AssetType] }}
              >
                {(bestAsset.symbol ?? bestAsset.name).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#111827]">{bestAsset.symbol ?? bestAsset.name}</p>
                <p className="text-xs text-[#9CA3AF]">{ASSET_LABELS[bestAsset.type as AssetType]}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-bold text-[#9CA3AF]">live prices →</p>
                <p className="text-xs text-[#9CA3AF]">see widget above</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#9CA3AF]">Add assets to see performance</p>
          )}
        </div>
      </div>
    </div>
  );
}
