"use client";

import { useState, useRef, useEffect } from "react";
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

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<AssetType>("saham_id");

  // Edit modal
  const [editAsset, setEditAsset] = useState<Asset | null>(null);

  // Delete
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

  function openAdd() {
    setAddType(activeTab === "all" ? "saham_id" : activeTab as AssetType);
    setAddOpen(true);
  }

  return (
    <>
      {/* Add modal */}
      <AddAssetModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultType={addType}
      />

      {/* Edit modal */}
      <AddAssetModal
        open={!!editAsset}
        onClose={() => setEditAsset(null)}
        editAsset={editAsset}
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
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.type ? "bg-white/20" : "bg-[#F3F4F6] text-[#9CA3AF]"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={openAdd}
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
          <p className="text-sm text-[#9CA3AF] mb-5">
            Add your first {activeTab === "all" ? "" : ASSET_LABELS[activeTab as AssetType] + " "}asset
          </p>
          <button
            onClick={openAdd}
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
              onEdit={() => setEditAsset(asset)}
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
  onEdit,
  onDelete,
  deleting,
}: {
  asset: Asset;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const color = ASSET_COLORS[asset.type];
  const displayName = asset.symbol ?? asset.name;
  const isUSD = asset.currency === "USD";

  // Cost basis: reksa_dana stores total invested in avg_price directly (qty=1)
  const costBasis = asset.type === "reksa_dana"
    ? asset.avg_price
    : asset.quantity * asset.avg_price;

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function handleDeleteClick() {
    if (confirmDelete) {
      setMenuOpen(false);
      setConfirmDelete(false);
      onDelete();
    } else {
      setConfirmDelete(true);
    }
  }

  return (
    <div className="bg-white rounded-[14px] border border-[#E4E7EC] shadow-sm overflow-hidden">
      {/* Colored top stripe */}
      <div className="h-1" style={{ background: color }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: color }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[#111827] text-sm leading-tight">{displayName}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{ASSET_LABELS[asset.type]}</p>
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => { setMenuOpen((v) => !v); setConfirmDelete(false); }}
              className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#9CA3AF] hover:text-[#6B7280]"
              aria-label="Options"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
                <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 bg-white border border-[#E4E7EC] rounded-xl shadow-lg py-1 w-44">
                {/* Edit */}
                <button
                  onClick={() => { setMenuOpen(false); onEdit(); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="#6366f1" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                  Edit asset
                </button>

                <div className="h-px bg-[#F3F4F6] mx-2 my-1" />

                {/* Delete — with inline confirm */}
                {confirmDelete ? (
                  <div className="px-3.5 py-2.5">
                    <p className="text-xs text-[#6B7280] mb-2">Delete this asset?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteClick}
                        disabled={deleting}
                        className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                      >
                        {deleting ? "..." : "Yes, delete"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1.5 rounded-lg bg-[#F3F4F6] text-[#6B7280] text-xs font-medium hover:bg-[#E9EAEC] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleDeleteClick}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                      <path d="M2 3h10M5 3V2h4v1M4 3l.5 8h5L10 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Delete asset
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          {asset.type !== "cash" && (
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">
                {asset.type === "saham_id" ? "Lots" : asset.type === "reksa_dana" ? "Invested" : "Amount"}
              </span>
              <span className="font-medium text-[#111827]">
                {asset.type === "reksa_dana"
                  ? formatIDR(asset.avg_price)
                  : asset.quantity}
              </span>
            </div>
          )}
          {asset.type !== "reksa_dana" && (
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">
                {asset.type === "cash" ? "Amount" : "Avg price"}
              </span>
              <span className="font-medium text-[#111827]">
                {isUSD ? formatUSD(asset.avg_price) : formatIDR(asset.avg_price)}
              </span>
            </div>
          )}
          {asset.type === "reksa_dana" && asset.expected_return != null && (
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Expected return</span>
              <span className="font-medium text-[#059669]">{asset.expected_return}%/yr</span>
            </div>
          )}
          <div className="flex justify-between text-xs pt-2 border-t border-[#F9FAFB]">
            <span className="text-[#9CA3AF]">Cost basis</span>
            <span className="font-semibold text-[#111827]">
              {isUSD ? formatUSD(costBasis) : formatIDR(costBasis)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
