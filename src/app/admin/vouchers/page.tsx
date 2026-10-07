"use client";

import { useState } from "react";
import { generateVoucherCode } from "@/lib/utils";

export default function VouchersPage() {
  const [count, setCount] = useState(10);
  const [packageId, setPackageId] = useState("1");
  const [generated, setGenerated] = useState<string[]>([]);

  function handleGenerate() {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(generateVoucherCode(8));
    }
    setGenerated(codes);
  }

  function downloadCsv() {
    const header = "code,package_id,status\n";
    const rows = generated.map((c) => `${c},${packageId},unused`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `denop-vouchers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Vouchers</h2>
        <p className="text-slate-600 mt-1">
          Generate voucher codes that customers can redeem on the login page.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Package
            </label>
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="1">1 Hour – 500 UGX</option>
              <option value="2">3 Hours – 1,000 UGX</option>
              <option value="3">12 Hours – 2,000 UGX</option>
              <option value="4">24 Hours – 3,000 UGX</option>
              <option value="5">7 Days – 15,000 UGX</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          className="px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition"
        >
          Generate Vouchers
        </button>
      </div>

      {generated.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <span className="text-sm font-medium text-slate-700">
              {generated.length} codes generated
            </span>
            <button
              onClick={downloadCsv}
              className="px-3 py-1.5 text-xs font-medium bg-sky-600 text-white rounded-md hover:bg-sky-700"
            >
              Download CSV
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-auto">
            {generated.map((code) => (
              <div
                key={code}
                className="font-mono text-sm bg-slate-100 rounded-md px-3 py-2 text-center"
              >
                {code}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-800">
            After connecting Supabase these codes will be saved to the database and
            can be validated on the portal. For now they are local only — save the CSV.
          </div>
        </div>
      )}
    </div>
  );
}
