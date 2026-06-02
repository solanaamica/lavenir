"use client";

import { useState, useEffect, useCallback } from "react";
import { formatIDR, formatPercent } from "@/lib/utils";
import { ASSET_COLORS, ASSET_LABELS, type AssetType } from "@/types";
import type { PortfolioPrices } from "@/lib/prices";
import type { Asset } from "@/types";

interface Props {
  assets: Asset[];
}

export default function LivePortfolio({ assets }: Props) {
  const [data, setData] = useState<PortfolioPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapping, setSnapping] = useState(false);
  const [snapMsg, setSnapMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prices");
      if (res.ok) {
        setData(await res.json());
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    // refresh every 5 minutes
    const id = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchPrices]);

  async function handleSnapshot() {
    setSnapping(true);
    setSnapMsg(null);
    try {
      const res = await fetch("/api/snapshot", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        const milestoneText =
          json.newMilestones?.length > 0
            ? ` 🎯 Milestone crossed: Rp ${(json.newMilestones[0] / 1_000_000).toFixed(0)}M!`
            : "";
        setSnapMsg({ text: `Snapshot saved for this month!${milestoneText}`, ok: true });
        await fetchPrices();
      } else {
        setSnapMsg({ text: json.error ?? "Failed to save snapshot", ok: false });
      }
    } catch {
      setSnapMsg({ text: "Network error", ok: false });
    } finally {
      setSnapping(false);
    }
  }

  const totalValue = data?.totalValueIDR ?? 0;
  const totalCost = data?.totalCostIDR ?? 0;
  const totalReturn = totalValue - totalCost;
  const returnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-[#6B7280] mb-1">Live Portfolio Value</p>
          {loading ? (
            <div className="h-8 w-40 bg-[#F3F4F6] animate-pulse rounded-lg" />
          ) : (
            <p className="text-3xl font-bold text-[#111827]">{formatIDR(totalValue)}</p>
          )}
          {!loading && (
            <div className={`inline-flex items-center gap-1 mt-1 text-sm font-medium ${totalReturn >= 0 ? "text-[#059669]" : "text-red-500"}`}>
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                <path
                  d={totalReturn >= 0 ? "M2 9L4.5 6.5l2 1.5L10 3" : "M2 3l2.5 2.5 2-1.5L10 9"}
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              {totalReturn >= 0 ? "+" : ""}{formatIDR(Math.abs(totalReturn))} ({formatPercent(returnPct)})
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleSnapshot}
            disabled={snapping || loading}
            className="flex items-center gap-2 bg-[#6366f1] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4f46e5] transition-colors disabled:opacity-60"
          >
            {snapping ? (
              <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 14 14">
                <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <path d="M7 1.5a5.5 5.5 0 015.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <rect x="2" y="3" width="10" height="9" rx="1.5" stroke="white" strokeWidth="1.3"/>
                <path d="M5 3V2h4v1" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M7 6v3M5.5 7.5H8.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            )}
            {snapping ? "Saving..." : "Record Snapshot"}
          </button>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            <svg className={loading ? "animate-spin" : ""} width="12" height="12" fill="none" viewBox="0 0 12 12">
              <path d="M10 6A4 4 0 112 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M10 3v3H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` : "Loading..."}
          </button>
        </div>
      </div>

      {snapMsg && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${snapMsg.ok ? "bg-[#059669]/10 text-[#059669]" : "bg-red-50 text-red-600"}`}>
          {snapMsg.text}
        </div>
      )}

      {/* Asset rows */}
      {assets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Holdings</p>
          {assets.slice(0, 8).map((asset) => {
            const priceInfo = data?.prices.find((p) => p.assetId === asset.id);
            const isPos = (priceInfo?.unrealizedReturnPct ?? 0) >= 0;

            return (
              <div key={asset.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: ASSET_COLORS[asset.type as AssetType] }}
                  >
                    {(asset.symbol ?? asset.name).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827] leading-none">{asset.symbol ?? asset.name}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{ASSET_LABELS[asset.type as AssetType]}</p>
                  </div>
                </div>
                <div className="text-right">
                  {priceInfo ? (
                    <>
                      <p className="text-sm font-medium text-[#111827]">{formatIDR(priceInfo.currentValueIDR)}</p>
                      <p className={`text-xs font-medium ${isPos ? "text-[#059669]" : "text-red-500"}`}>
                        {isPos ? "+" : ""}{priceInfo.unrealizedReturnPct.toFixed(2)}%
                      </p>
                    </>
                  ) : (
                    <div className="h-4 w-20 bg-[#F3F4F6] animate-pulse rounded" />
                  )}
                </div>
              </div>
            );
          })}
          {assets.length > 8 && (
            <p className="text-xs text-[#9CA3AF] text-center pt-1">
              +{assets.length - 8} more · <a href="/assets" className="text-[#6366f1]">View all</a>
            </p>
          )}
        </div>
      )}

      {data && (
        <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#9CA3AF]">
          <span>USD/IDR: Rp {data.usdIdr.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
          <span>Prices from Yahoo Finance & CoinGecko</span>
        </div>
      )}
    </div>
  );
}
