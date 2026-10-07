"use client";

import { useState } from "react";
import { generateRouterScript } from "@/lib/mikrotik/script-generator";
import type { Package } from "@/lib/types";

// Demo packages until Supabase is connected
const DEMO_PACKAGES: Package[] = [
  {
    id: "1",
    name: "1 Hour",
    description: null,
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
    description: null,
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
    description: null,
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
    description: null,
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
];

export default function RoutersPage() {
  const [name, setName] = useState("Denop Main Router");
  const [identity, setIdentity] = useState("Denop-Hostel-Wifi");
  const [hotspotInterface, setHotspotInterface] = useState("bridge-hotspot");
  const [wanInterface, setWanInterface] = useState("ether1");
  const [dnsName, setDnsName] = useState("");
  const [portalDomain, setPortalDomain] = useState("denop-hotspot.onrender.com");
  const [script, setScript] = useState("");
  const [showScript, setShowScript] = useState(false);

  function handleGenerate() {
    const generated = generateRouterScript({
      routerName: name,
      identity,
      hotspotInterface,
      wanInterface,
      dnsName,
      portalDomain,
      packages: DEMO_PACKAGES,
    });
    setScript(generated);
    setShowScript(true);
  }

  function downloadScript() {
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `denop-${identity.toLowerCase().replace(/\s+/g, "-")}.rsc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyScript() {
    navigator.clipboard.writeText(script);
    alert("Script copied to clipboard!");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Routers</h2>
        <p className="text-slate-600 mt-1">
          Add a router and generate a complete MikroTik configuration script.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-semibold text-slate-900">Generate Configuration Script</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Router Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. Main Building Router"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              System Identity
            </label>
            <input
              type="text"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Denop-Hostel-Wifi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hotspot Interface
            </label>
            <input
              type="text"
              value={hotspotInterface}
              onChange={(e) => setHotspotInterface(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="bridge-hotspot / ether2 / wifi1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Interface clients connect to (or bridge name)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              WAN Interface
            </label>
            <input
              type="text"
              value={wanInterface}
              onChange={(e) => setWanInterface(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="ether1"
            />
            <p className="text-xs text-slate-500 mt-1">Internet-facing interface</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              DNS Name (optional)
            </label>
            <input
              type="text"
              value={dnsName}
              onChange={(e) => setDnsName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="wifi.denophostel.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Portal Domain (your Render URL)
            </label>
            <input
              type="text"
              value={portalDomain}
              onChange={(e) => setPortalDomain(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="denop-hotspot.onrender.com"
            />
            <p className="text-xs text-slate-500 mt-1">
              Used for Walled Garden so clients can reach the payment page
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleGenerate}
            className="px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition"
          >
            Generate Script
          </button>
        </div>
      </div>

      {showScript && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-900 text-sm">
              Generated RouterOS Script
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyScript}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Copy
              </button>
              <button
                onClick={downloadScript}
                className="px-3 py-1.5 text-xs font-medium bg-sky-600 text-white rounded-md hover:bg-sky-700"
              >
                Download .rsc
              </button>
            </div>
          </div>
          <pre className="p-4 text-xs overflow-auto max-h-[500px] bg-slate-900 text-green-400 font-mono leading-relaxed">
            {script}
          </pre>
          <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 text-sm text-amber-900">
            <strong>Important:</strong> Make a backup first. Paste the script in
            MikroTik Terminal. Then upload the captive portal HTML files (download
            from Packages or Portal section) into the <code>hotspot</code> folder.
          </div>
        </div>
      )}

      <div className="bg-sky-50 rounded-xl border border-sky-200 p-5 text-sm text-sky-900">
        <h4 className="font-semibold mb-2">What the script configures</h4>
        <ul className="list-disc list-inside space-y-1 text-sky-800">
          <li>IP gateway <strong>172.16.0.1/16</strong> + address pool</li>
          <li>DHCP server for clients</li>
          <li>Hotspot server + profile with login by HTTP CHAP/PAP + cookies</li>
          <li>User profiles matching your packages (time, speed, data)</li>
          <li>NAT masquerade on WAN</li>
          <li>Firewall rules + client isolation</li>
          <li>Walled Garden for your payment portal + Apple/Android captive detection</li>
          <li>Bridge horizon for AP isolation</li>
          <li>NTP for correct timeouts</li>
        </ul>
      </div>
    </div>
  );
}
