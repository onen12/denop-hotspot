"use client";

import { useState } from "react";
import { formatCurrency, minutesToHuman } from "@/lib/utils";
import type { Package } from "@/lib/types";

const INITIAL: Package[] = [
  {
    id: "1",
    name: "1 Hour",
    description: "Quick browse",
    price: 500,
    duration_minutes: 60,
    data_mb: 500,
    download_speed: "3M",
    upload_speed: "1M",
    shared_users: 1,
    is_active: true,
    sort_order: 1,
    created_at: "",
  },
  {
    id: "2",
    name: "3 Hours",
    description: "Half day",
    price: 1000,
    duration_minutes: 180,
    data_mb: 1500,
    download_speed: "5M",
    upload_speed: "2M",
    shared_users: 1,
    is_active: true,
    sort_order: 2,
    created_at: "",
  },
  {
    id: "3",
    name: "12 Hours",
    description: "Day pass",
    price: 2000,
    duration_minutes: 720,
    data_mb: 5000,
    download_speed: "8M",
    upload_speed: "3M",
    shared_users: 1,
    is_active: true,
    sort_order: 3,
    created_at: "",
  },
  {
    id: "4",
    name: "24 Hours",
    description: "Full day unlimited",
    price: 3000,
    duration_minutes: 1440,
    data_mb: null,
    download_speed: "10M",
    upload_speed: "5M",
    shared_users: 1,
    is_active: true,
    sort_order: 4,
    created_at: "",
  },
  {
    id: "5",
    name: "7 Days",
    description: "Weekly",
    price: 15000,
    duration_minutes: 10080,
    data_mb: null,
    download_speed: "15M",
    upload_speed: "5M",
    shared_users: 2,
    is_active: true,
    sort_order: 5,
    created_at: "",
  },
];

export default function PackagesPage() {
  const [packages] = useState<Package[]>(INITIAL);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Packages</h2>
          <p className="text-slate-600 mt-1">
            Internet packages shown to customers and used in MikroTik profiles.
          </p>
        </div>
        <button
          disabled
          className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg opacity-60 cursor-not-allowed"
          title="Connect Supabase to enable"
        >
          + Add Package
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Price</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Duration</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Data</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Speed</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{pkg.name}</div>
                  {pkg.description && (
                    <div className="text-xs text-slate-500">{pkg.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{formatCurrency(pkg.price)}</td>
                <td className="px-4 py-3">{minutesToHuman(pkg.duration_minutes)}</td>
                <td className="px-4 py-3">
                  {pkg.data_mb ? `${pkg.data_mb} MB` : "Unlimited"}
                </td>
                <td className="px-4 py-3">
                  {pkg.upload_speed} / {pkg.download_speed}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      pkg.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {pkg.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500">
        These packages are embedded into the MikroTik script as user profiles.
        After connecting Supabase the list becomes fully editable.
      </p>
    </div>
  );
}
