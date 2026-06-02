"use client";

import { useState } from "react";
import { type Asset, type AssetType, ASSET_COLORS, ASSET_LABELS } from "@/types";
import { formatIDR, formatUSD } from "@/lib/utils";
import AddAssetModal from "./AddAssetModal";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const TABS: { type: AssetType | "all"; label: string; color: string }[] = [
  { type: "all", label: "All", color: "#6366f1" },
  { type: "saham_id", label: "ID Stock", color: "#8B1A1A" },
  { type: "saham_us", label: "US Stock", color: "#1a3a8b" },
  { type: "crypto", label: "Crypto", color: "#F7931A" },
  { type: "reksa_dana", label: "Mutual Fund", color: "#059669" },
  { type: "cash", label: "Cash", color: "#6B7280" },
];

export default function AssetsList({ initialAssets }: { initialAssets: Asset[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AssetType | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<AssetType>("saham_id");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = activeTab === "all"
    ? initialAssets
    : initialAssets.filter((a) => a.type === activeTab);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("assets").delete().eq("id", id);
    router.refresh();
    setDeletingId(null);
  }

  return (
    <>
      <AddAssetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {TABS.map((tab) => {
          const count = tab.type === "all"
            ? initialAssets.length
            : initialAssets.filter((a) => a.type === tab.type).length;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeTab === tab.type
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white border-[#E4E7EC] text-[#6B7280] hover:border-[#D1D5DB]"
              }`}
              style={activeTab === tab.type ? { background: tab.color } : {}}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.type ? "bg-white/20" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => {
            setModalType(activeTab === "all" ? "saham_id" : activeTab as AssetType);
            setModalOpen(true);
          }}
          className="ml-auto flex items-center gap-2 bg-[#6366f1] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4f46e5] transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add asset
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card py-16 flex flex-col items-center justify-center text-center">
          <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mb-4 opacity-30">
            <rect x="6" y="12" width="36" height="28" rx="4" stroke="#6366f1" strokeWidth="1.5"/>
            <path d="M16 12V8a8 8 0 0116 0v4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="font-medium text-[#111827] mb-2">No assets here yet</p>
          <p className="text-sm text-[#9CA3AF] mb-5">Add your first {activeTab === "all" ? "" : ASSET_LABELS[activeTab as AssetType] + " "}asset</p>
          <button
            onClick={() => {
              setModalType(activeTab === "all" ? "saham_id" : activeTab as AssetType);
              setModalOpen(true);
            }}
            className="bg-[#6366f1] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4f46e5] transition-colors"
          >
            Add asset
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onDelete={() => handleDelete(asset.id)}
              deleting={deletingId === asset.id}
            />
          ))}
        </div>
      )}
    </>
  );
}

function AssetCard({
  asset,
  onDelete,
  deleting,
}: {
  asset: Asset;
  onDelete: () => void;
  deleting: boolean;
}) {
  const color = ASSET_COLORS[asset.type];
  const displayName = asset.symbol ?? asset.name;
  const costBasis = asset.quantity * asset.avg_price;
  const isUSD = asset.currency === "USD";

  return (
    <div className="bg-white rounded-[14px] border border-[#E4E7EC] shadow-sm overflow-hidden">
      {/* Colored top border */}
      <div className="h-1" style={{ background: color }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: color }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[#111827] text-sm">{displayName}</p>
              <p className="text-xs text-[#9CA3AF]">{ASSET_LABELS[asset.type]}</p>
            </div>
          </div>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 text-[#9CA3AF] hover:text-red-500"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path d="M2 3h10M5 3V2h4v1M4 3l.5 8h5L10 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#9CA3AF]">Qty / Lots</span>
            <span className="font-medium text-[#111827]">{asset.quantity}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#9CA3AF]">Avg price</span>
            <span className="font-medium text-[#111827]">
              {isUSD ? formatUSD(asset.avg_price) : formatIDR(asset.avg_price)}
            </span>
          </div>
          <div className="flex justify-between text-xs pt-2 border-t border-[#F9FAFB]">
            <span className="text-[#9CA3AF]">Cost basis</span>
            <span className="font-semibold text-[#111827]">
              {isUSD ? formatUSD(costBasis) : formatIDR(costBasis)}
            </span>
          </div>
        </div>

        <button
          onClick={onDelete}
          disabled={deleting}
          className="mt-4 w-full py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
        >
          {deleting ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}
