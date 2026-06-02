"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type AssetType, ASSET_LABELS, ASSET_COLORS } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultType?: AssetType;
}

const assetTypes: AssetType[] = ["saham_id", "saham_us", "crypto", "reksa_dana", "cash"];

export default function AddAssetModal({ open, onClose, defaultType = "saham_id" }: Props) {
  const router = useRouter();
  const [type, setType] = useState<AssetType>(defaultType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    symbol: "",
    name: "",
    quantity: "",
    avg_price: "",
    currency: "IDR",
    expected_return: "",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload: any = {
      user_id: user.id,
      type,
      name: form.name || form.symbol,
      symbol: form.symbol || null,
      quantity: parseFloat(form.quantity) || 0,
      avg_price: parseFloat(form.avg_price) || 0,
      currency: type === "saham_us" || type === "crypto" ? "USD" : "IDR",
    };

    if (type === "reksa_dana") {
      payload.expected_return = parseFloat(form.expected_return) || 0;
      payload.symbol = null;
    }

    if (type === "cash") {
      payload.symbol = null;
      payload.quantity = 1;
      payload.avg_price = parseFloat(form.avg_price) || 0;
      payload.currency = form.currency as "IDR" | "USD";
    }

    const { error } = await supabase.from("assets").insert([payload]);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.refresh();
    onClose();
    setLoading(false);
    setForm({ symbol: "", name: "", quantity: "", avg_price: "", currency: "IDR", expected_return: "" });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#111827]">Add Asset</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path d="M4 4l10 10M14 4L4 14" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 flex-wrap mb-6">
          {assetTypes.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                type === t
                  ? "text-white border-transparent"
                  : "bg-white border-[#E4E7EC] text-[#6B7280] hover:border-[#D1D5DB]"
              }`}
              style={type === t ? { background: ASSET_COLORS[t] } : {}}
            >
              {ASSET_LABELS[t]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Saham ID */}
          {type === "saham_id" && (
            <>
              <Field label="Stock Code" placeholder="e.g. BBCA" value={form.symbol} onChange={(v) => set("symbol", v)} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lot" placeholder="e.g. 10" value={form.quantity} onChange={(v) => set("quantity", v)} type="number" required />
                <Field label="Avg Price (IDR/share)" placeholder="e.g. 9500" value={form.avg_price} onChange={(v) => set("avg_price", v)} type="number" required />
              </div>
            </>
          )}

          {/* Saham US */}
          {type === "saham_us" && (
            <>
              <Field label="Ticker" placeholder="e.g. AAPL" value={form.symbol} onChange={(v) => set("symbol", v)} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Shares" placeholder="e.g. 5" value={form.quantity} onChange={(v) => set("quantity", v)} type="number" required />
                <Field label="Avg Price (USD)" placeholder="e.g. 185" value={form.avg_price} onChange={(v) => set("avg_price", v)} type="number" required />
              </div>
            </>
          )}

          {/* Crypto */}
          {type === "crypto" && (
            <>
              <Field label="Coin" placeholder="e.g. BTC, ETH, SOL" value={form.symbol} onChange={(v) => set("symbol", v.toUpperCase())} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Amount" placeholder="e.g. 0.05" value={form.quantity} onChange={(v) => set("quantity", v)} type="number" required />
                <Field label="Buy Price (USD)" placeholder="e.g. 42000" value={form.avg_price} onChange={(v) => set("avg_price", v)} type="number" required />
              </div>
            </>
          )}

          {/* Reksa Dana */}
          {type === "reksa_dana" && (
            <>
              <Field label="Fund Name" placeholder="e.g. Schroder Dana Istimewa" value={form.name} onChange={(v) => set("name", v)} required />
              <Field label="Amount Invested (IDR)" placeholder="e.g. 5000000" value={form.avg_price} onChange={(v) => set("avg_price", v)} type="number" required />
              <Field label="Expected Return (%/yr)" placeholder="e.g. 12" value={form.expected_return} onChange={(v) => set("expected_return", v)} type="number" />
            </>
          )}

          {/* Cash */}
          {type === "cash" && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Currency</label>
                <div className="flex gap-2">
                  {["IDR", "USD"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set("currency", c)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.currency === c
                          ? "bg-[#6366f1] text-white border-[#6366f1]"
                          : "bg-white border-[#E4E7EC] text-[#6B7280]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <Field
                label={`Amount (${form.currency})`}
                placeholder="e.g. 10000000"
                value={form.avg_price}
                onChange={(v) => set("avg_price", v)}
                type="number"
                required
              />
            </>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-colors disabled:opacity-60"
            style={{ background: ASSET_COLORS[type] }}
          >
            {loading ? "Adding..." : `Add ${ASSET_LABELS[type]}`}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B7280] mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        step="any"
        className="w-full border border-[#E4E7EC] rounded-lg px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1] transition-colors"
      />
    </div>
  );
}
