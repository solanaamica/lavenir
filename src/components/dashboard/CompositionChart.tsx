"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatIDR } from "@/lib/utils";
import { ASSET_COLORS, ASSET_LABELS, type AssetType } from "@/types";

interface Slice {
  type: AssetType;
  value: number;
  pct: number;
}

interface Props {
  data: Slice[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-3 shadow-lg text-sm">
      <p className="font-medium text-[#111827]">{ASSET_LABELS[d.type as AssetType]}</p>
      <p className="text-[#6B7280] text-xs">{formatIDR(d.value)}</p>
      <p className="text-[#6B7280] text-xs">{d.pct.toFixed(1)}%</p>
    </div>
  );
}

export default function CompositionChart({ data }: Props) {
  return (
    <div className="card p-6">
      <p className="text-sm font-semibold text-[#111827] mb-4">Composition</p>
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-[#9CA3AF] text-sm">
          <svg width="32" height="32" fill="none" viewBox="0 0 32 32" className="mb-2 opacity-40">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M16 8v8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          No assets yet
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.type} fill={ASSET_COLORS[entry.type]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {data.map((d) => (
              <div key={d.type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ASSET_COLORS[d.type] }}/>
                  <span className="text-[#6B7280]">{ASSET_LABELS[d.type]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#111827] font-medium">{d.pct.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
