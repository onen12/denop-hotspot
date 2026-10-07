"use client";

import { useState } from "react";
import { formatCurrency, minutesToHuman } from "@/lib/utils";

const PACKAGES = [
  {
    id: "1",
    name: "1 Hour",
    price: 500,
    duration_minutes: 60,
    data_mb: 500,
    speed: "3 Mbps",
  },
  {
    id: "2",
    name: "3 Hours",
    price: 1000,
    duration_minutes: 180,
    data_mb: 1500,
    speed: "5 Mbps",
  },
  {
    id: "3",
    name: "12 Hours",
    price: 2000,
    duration_minutes: 720,
    data_mb: 5000,
    speed: "8 Mbps",
  },
  {
    id: "4",
    name: "24 Hours",
    price: 3000,
    duration_minutes: 1440,
    data_mb: null,
    speed: "10 Mbps",
  },
  {
    id: "5",
    name: "7 Days",
    price: 15000,
    duration_minutes: 10080,
    data_mb: null,
    speed: "15 Mbps",
  },
];

type Mode = "packages" | "pay" | "voucher" | "success";

export default function PortalPage() {
  const [mode, setMode] = useState<Mode>("packages");
  const [selected, setSelected] = useState<(typeof PACKAGES)[0] | null>(null);
  const [phone, setPhone] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function selectPackage(pkg: (typeof PACKAGES)[0]) {
    setSelected(pkg);
    setMode("pay");
    setMessage("");
  }

  async function handlePay() {
    if (!phone || phone.length < 9) {
      setMessage("Enter a valid phone number");
      return;
    }
    setLoading(true);
    setMessage("");
    // Placeholder – replace with real mobile money API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setMode("success");
    setMessage(
      `Payment request sent to ${phone}. After successful payment you will receive a voucher code or be logged in automatically.`
    );
  }

  async function handleVoucher() {
    if (!voucherCode.trim()) {
      setMessage("Enter a voucher code");
      return;
    }
    setLoading(true);
    setMessage("");
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    // Placeholder validation
    setMessage(
      "Voucher validation will work after Supabase is connected. Use the code on the MikroTik login page for now."
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-600 to-sky-800 flex flex-col">
      {/* Header */}
      <header className="px-4 py-6 text-center text-white">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur mb-3">
          <span className="text-2xl font-bold">D</span>
        </div>
        <h1 className="text-2xl font-bold">Denop Hostel Wifi</h1>
        <p className="text-sky-100 text-sm mt-1">Fast internet · Easy payment</p>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {mode === "packages" && (
            <div className="space-y-3">
              <p className="text-center text-sky-100 text-sm mb-4">
                Choose a package to get online
              </p>
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => selectPackage(pkg)}
                  className="w-full bg-white rounded-2xl p-4 text-left shadow-lg hover:shadow-xl transition active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-lg">
                        {pkg.name}
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        {minutesToHuman(pkg.duration_minutes)} ·{" "}
                        {pkg.data_mb ? `${pkg.data_mb} MB` : "Unlimited"} ·{" "}
                        {pkg.speed}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sky-600 text-lg">
                        {formatCurrency(pkg.price)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              <button
                onClick={() => {
                  setMode("voucher");
                  setMessage("");
                }}
                className="w-full mt-4 py-3 text-center text-white/90 text-sm font-medium underline"
              >
                I already have a voucher code
              </button>
            </div>
          )}

          {mode === "pay" && selected && (
            <div className="bg-white rounded-2xl p-6 shadow-xl space-y-5">
              <button
                onClick={() => setMode("packages")}
                className="text-sm text-sky-600 font-medium"
              >
                ← Back
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selected.name}
                </h2>
                <p className="text-slate-500 text-sm">
                  {formatCurrency(selected.price)} ·{" "}
                  {minutesToHuman(selected.duration_minutes)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mobile Money Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              {message && (
                <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  {message}
                </p>
              )}
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 disabled:opacity-60 transition"
              >
                {loading ? "Sending request..." : `Pay ${formatCurrency(selected.price)}`}
              </button>
              <p className="text-xs text-center text-slate-400">
                You will receive an STK push / payment prompt on your phone
              </p>
            </div>
          )}

          {mode === "voucher" && (
            <div className="bg-white rounded-2xl p-6 shadow-xl space-y-5">
              <button
                onClick={() => setMode("packages")}
                className="text-sm text-sky-600 font-medium"
              >
                ← Back
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Enter Voucher Code
                </h2>
                <p className="text-slate-500 text-sm">
                  Type the code you received after payment
                </p>
              </div>
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                maxLength={12}
              />
              {message && (
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                  {message}
                </p>
              )}
              <button
                onClick={handleVoucher}
                disabled={loading}
                className="w-full py-3.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 disabled:opacity-60 transition"
              >
                {loading ? "Checking..." : "Redeem Voucher"}
              </button>
            </div>
          )}

          {mode === "success" && (
            <div className="bg-white rounded-2xl p-6 shadow-xl text-center space-y-4">
              <div className="text-5xl">✅</div>
              <h2 className="text-xl font-bold text-slate-900">
                Payment Initiated
              </h2>
              <p className="text-slate-600 text-sm">{message}</p>
              <button
                onClick={() => {
                  setMode("packages");
                  setSelected(null);
                  setPhone("");
                  setMessage("");
                }}
                className="w-full py-3 bg-slate-100 text-slate-700 font-medium rounded-xl"
              >
                Back to Packages
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-sky-200 text-xs">
        Denop Hostel Wifi · Secure payment
      </footer>
    </div>
  );
}
