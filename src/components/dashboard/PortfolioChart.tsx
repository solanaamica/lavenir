"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useState } from "react";
import { formatIDR, getMonthLabel } from "@/lib/utils";

interface DataPoint {
  month: string;
  value: number;
  cost: number;
}

interface Props {
  data: DataPoint[];
}

const PERIODS = [
  { label: "YTD", months: 12 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
  { label: "All", months: 999 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const cost = payload[1]?.value;
  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-3 shadow-lg text-sm">
      <p className="text-[#6B7280] text-xs mb-1">{getMonthLabel(label)}</p>
      <p className="font-bold text-[#111827]">{formatIDR(val)}</p>
      {cost && <p className="text-[#6B7280] text-xs mt-0.5">Cost: {formatIDR(cost)}</p>}
    </div>
  );
}

export default function PortfolioChart({ data }: Props) {
  const [period, setPeriod] = useState("All");

  const filtered = (() => {
    const months = PERIODS.find((p) => p.label === period)?.months ?? 999;
    if (months >= 999) return data;
    return data.slice(-months);
  })();

  const first = filtered[0]?.value ?? 0;
  const last = filtered[filtered.length - 1]?.value ?? 0;
  const change = first > 0 ? ((last - first) / first) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-[#6B7280] mb-1">Portfolio Growth</p>
          <p className="text-3xl font-bold text-[#111827]">{formatIDR(last)}</p>
          <div className={`inline-flex items-center gap-1 mt-1 text-sm font-medium ${isPositive ? "text-[#059669]" : "text-red-500"}`}>
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path
                d={isPositive ? "M2 10L5 7l2.5 2L11 4" : "M2 4L5 7l2.5-2L11 10"}
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            {isPositive ? "+" : ""}{change.toFixed(2)}% ({period})
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPeriod(p.label)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === p.label
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={filtered} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#portfolioGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#059669", stroke: "white", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#E4E7EC"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 4"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-3 text-xs text-[#9CA3AF]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#059669] inline-block rounded"/>
          Portfolio value
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#E4E7EC] inline-block rounded" style={{borderTop: "1.5px dashed #E4E7EC"}}/>
          Cost basis
        </span>
      </div>
    </div>
  );
}
