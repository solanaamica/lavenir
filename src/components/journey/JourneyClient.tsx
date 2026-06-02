"use client";

import { useState } from "react";
import { formatIDR, formatPercent, getMonthLabel } from "@/lib/utils";
import { MILESTONES } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Snapshot {
  id: string;
  month: string;
  total_value_idr: number;
  total_cost_idr: number;
}

interface Milestone {
  id: string;
  amount: number;
  achieved_at: string;
  snapshot_month: string;
}

function computeHighlights(snapshots: Snapshot[]) {
  if (!snapshots.length) return [];

  const withGrowth = snapshots.map((s, i) => {
    const prev = snapshots[i - 1];
    const growth = prev && prev.total_value_idr > 0
      ? ((s.total_value_idr - prev.total_value_idr) / prev.total_value_idr) * 100
      : 0;
    return { ...s, growth };
  });

  const highlights = new Map<string, typeof withGrowth[0]>();

  // Latest month
  highlights.set("latest", withGrowth[withGrowth.length - 1]);

  // First month
  if (withGrowth.length > 1) {
    highlights.set("first", withGrowth[0]);
  }

  // Best month
  const best = withGrowth.slice(1).reduce((a, b) => (b.growth > a.growth ? b : a), withGrowth[1]);
  if (best) highlights.set("best", best);

  // Worst month
  const worst = withGrowth.slice(1).reduce((a, b) => (b.growth < a.growth ? b : a), withGrowth[1]);
  if (worst && worst.month !== best?.month) highlights.set("worst", worst);

  // Milestone months
  for (const s of withGrowth) {
    for (const milestone of MILESTONES) {
      const prev2 = withGrowth[withGrowth.indexOf(s) - 1];
      if (
        s.total_value_idr >= milestone &&
        (!prev2 || prev2.total_value_idr < milestone)
      ) {
        highlights.set(`milestone_${milestone}`, s);
      }
    }
  }

  return Array.from(highlights.values()).sort((a, b) => a.month.localeCompare(b.month));
}

function getMilestoneLabel(amount: number) {
  if (amount >= 1_000_000_000) return `${amount / 1_000_000_000}B`;
  return `${amount / 1_000_000}M`;
}

export default function JourneyClient({
  snapshots,
  milestones,
}: {
  snapshots: Snapshot[];
  milestones: Milestone[];
}) {
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? snapshots : computeHighlights(snapshots);

  const barData = (showAll ? snapshots : displayed).map((s, i) => {
    const prev = snapshots[snapshots.indexOf(s) - 1];
    const growth = prev && prev.total_value_idr > 0
      ? ((s.total_value_idr - prev.total_value_idr) / prev.total_value_idr) * 100
      : 0;
    return { month: s.month, value: s.total_value_idr, growth, cost: s.total_cost_idr };
  });

  const streak = (() => {
    let count = 0;
    const now = new Date();
    let d = new Date(now.getFullYear(), now.getMonth(), 1);
    while (true) {
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!snapshots.find((s) => s.month === m)) break;
      count++;
      d.setMonth(d.getMonth() - 1);
    }
    return count;
  })();

  const totalReturn = snapshots.length > 1
    ? snapshots[snapshots.length - 1].total_value_idr - snapshots[0].total_cost_idr
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Journey</h1>
          <p className="text-[#6B7280] text-sm mt-1">Your portfolio highlight reel</p>
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="text-sm text-[#6366f1] hover:text-[#4f46e5] font-medium"
        >
          {showAll ? "Show highlights" : "Show all months"} →
        </button>
      </div>

      {snapshots.length === 0 ? (
        <div className="card py-20 flex flex-col items-center justify-center text-center">
          <svg width="56" height="56" fill="none" viewBox="0 0 56 56" className="mb-5 opacity-25">
            <path d="M8 42L18 28l10 10L38 20l14 10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-lg font-semibold text-[#111827] mb-2">No journey yet</p>
          <p className="text-sm text-[#9CA3AF]">Add assets and record your first monthly snapshot to begin.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main timeline */}
          <div className="lg:col-span-2 space-y-4">
            {/* Bar chart */}
            <div className="card p-6">
              <p className="text-sm font-semibold text-[#111827] mb-4">Monthly Portfolio Value</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
                  <XAxis
                    dataKey="month"
                    tickFormatter={getMonthLabel}
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />
                  <Tooltip
                    formatter={(v: unknown) => [formatIDR(Number(v ?? 0)), "Portfolio"]}
                    labelFormatter={(label: unknown) => getMonthLabel(String(label ?? ""))}
                    contentStyle={{ borderRadius: 10, border: "1px solid #E4E7EC", fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((d, i) => (
                      <Cell key={i} fill={d.growth >= 0 ? "#059669" : "#EF4444"} fillOpacity={0.75}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Moment cards */}
            <div className="space-y-3">
              {displayed.map((s, idx) => {
                const prevIdx = snapshots.indexOf(s) - 1;
                const prev = prevIdx >= 0 ? snapshots[prevIdx] : null;
                const growth = prev && prev.total_value_idr > 0
                  ? ((s.total_value_idr - prev.total_value_idr) / prev.total_value_idr) * 100
                  : null;
                const milestone = MILESTONES.find(
                  (m) => s.total_value_idr >= m && (!prev || prev.total_value_idr < m)
                );

                return (
                  <div key={s.id} className="card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${milestone ? "bg-[#6366f1]" : growth === null ? "bg-[#9CA3AF]" : growth >= 0 ? "bg-[#059669]" : "bg-red-400"}`}/>
                        <div>
                          <p className="font-semibold text-[#111827]">{getMonthLabel(s.month)}</p>
                          {milestone && (
                            <p className="text-xs text-[#6366f1] font-medium">
                              🎯 Milestone: Rp {getMilestoneLabel(milestone)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#111827]">{formatIDR(s.total_value_idr)}</p>
                        {growth !== null && (
                          <p className={`text-xs font-medium ${growth >= 0 ? "text-[#059669]" : "text-red-500"}`}>
                            {formatPercent(growth)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Consistency */}
            <div className="card p-5">
              <p className="text-sm font-semibold text-[#111827] mb-3">Consistency</p>
              <div className="flex items-end gap-2 mb-3">
                <p className="text-4xl font-bold text-[#6366f1]">{streak}</p>
                <p className="text-sm text-[#6B7280] mb-1">month streak</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 12 }, (_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - (11 - i));
                  const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                  const has = snapshots.some((s) => s.month === m);
                  return (
                    <div
                      key={m}
                      title={m}
                      className={`w-6 h-6 rounded ${has ? "bg-[#059669]" : "bg-[#F3F4F6]"}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="card p-5">
              <p className="text-sm font-semibold text-[#111827] mb-3">Summary</p>
              <div className="space-y-2.5">
                <Row label="Snapshots" value={`${snapshots.length} months`} />
                <Row
                  label="Total Return"
                  value={formatIDR(Math.abs(totalReturn))}
                  color={totalReturn >= 0 ? "#059669" : "#EF4444"}
                />
                <Row
                  label="Latest Value"
                  value={formatIDR(snapshots[snapshots.length - 1]?.total_value_idr ?? 0)}
                />
                <Row label="Journey Start" value={getMonthLabel(snapshots[0]?.month ?? "")} />
              </div>
            </div>

            {/* Milestones list */}
            {milestones.length > 0 && (
              <div className="card p-5">
                <p className="text-sm font-semibold text-[#111827] mb-3">Milestones Reached</p>
                <div className="space-y-2">
                  {milestones.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                        <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                          <path d="M5 1l1 3H9l-2.5 2 1 3L5 7.5 2.5 9l1-3L1 4h3L5 1z" stroke="#6366f1" strokeWidth="1" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#111827]">Rp {getMilestoneLabel(m.amount)}</p>
                        <p className="text-xs text-[#9CA3AF]">{getMonthLabel(m.snapshot_month)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next milestone */}
            {(() => {
              const latest = snapshots[snapshots.length - 1]?.total_value_idr ?? 0;
              const next = MILESTONES.find((m) => m > latest);
              if (!next) return null;
              const pct = (latest / next) * 100;
              return (
                <div className="card p-5">
                  <p className="text-sm font-semibold text-[#111827] mb-2">Next Milestone</p>
                  <p className="text-[#6366f1] font-bold">Rp {getMilestoneLabel(next)}</p>
                  <div className="mt-3 bg-[#F3F4F6] rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-[#6366f1] transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-1.5">{pct.toFixed(1)}% there</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#9CA3AF]">{label}</span>
      <span className="font-medium" style={{ color: color ?? "#111827" }}>{value}</span>
    </div>
  );
}
