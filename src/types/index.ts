export type AssetType = "saham_id" | "saham_us" | "crypto" | "reksa_dana" | "cash";

export interface Asset {
  id: string;
  user_id: string;
  type: AssetType;
  name: string;
  symbol?: string;
  quantity: number;
  avg_price: number;
  currency: "IDR" | "USD";
  expected_return?: number; // reksa_dana only
  created_at: string;
  updated_at: string;
}

export interface Snapshot {
  id: string;
  user_id: string;
  month: string; // "YYYY-MM"
  total_value_idr: number;
  total_cost_idr: number;
  created_at: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  amount: number;
  achieved_at: string;
  snapshot_month: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export const ASSET_COLORS: Record<AssetType, string> = {
  saham_id: "#8B1A1A",
  saham_us: "#1a3a8b",
  crypto: "#F7931A",
  reksa_dana: "#059669",
  cash: "#6B7280",
};

export const ASSET_LABELS: Record<AssetType, string> = {
  saham_id: "ID Stock",
  saham_us: "US Stock",
  crypto: "Crypto",
  reksa_dana: "Mutual Fund",
  cash: "Cash",
};

export const MILESTONES = [
  100_000_000,
  250_000_000,
  500_000_000,
  1_000_000_000,
  2_500_000_000,
  5_000_000_000,
  10_000_000_000,
];
