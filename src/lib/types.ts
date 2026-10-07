export type Router = {
  id: string;
  name: string;
  identity: string;
  hotspot_interface: string;
  wan_interface: string;
  dns_name: string;
  status: "active" | "inactive" | "pending";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Package = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  data_mb: number | null; // null = unlimited
  download_speed: string; // e.g. "5M"
  upload_speed: string;
  shared_users: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Voucher = {
  id: string;
  code: string;
  package_id: string;
  package?: Package;
  status: "unused" | "used" | "expired" | "disabled";
  used_at: string | null;
  used_by_mac: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  phone: string;
  amount: number;
  package_id: string;
  package?: Package;
  status: "pending" | "success" | "failed" | "cancelled";
  provider_ref: string | null;
  voucher_id: string | null;
  voucher?: Voucher;
  router_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type HotspotUser = {
  id: string;
  username: string;
  password: string;
  package_id: string;
  mac_address: string | null;
  status: "active" | "expired" | "disabled";
  expires_at: string | null;
  created_at: string;
};
