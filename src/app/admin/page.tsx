import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-600 mt-1">
          Welcome to Denop Hostel Wifi management.
        </p>
      </div>

      {/* Stats placeholders - will be live once Supabase is connected */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Routers" value="—" />
        <StatCard label="Packages" value="—" />
        <StatCard label="Unused Vouchers" value="—" />
        <StatCard label="Today Revenue" value="—" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href="/admin/routers"
              className="block w-full text-left px-4 py-3 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 text-sm font-medium transition"
            >
              + Add Router & Generate Script
            </Link>
            <Link
              href="/admin/packages"
              className="block w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 text-sm font-medium transition"
            >
              Manage Packages
            </Link>
            <Link
              href="/admin/vouchers"
              className="block w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 text-sm font-medium transition"
            >
              Generate Vouchers
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Setup Checklist</h3>
          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="font-bold text-sky-600">1.</span>
              Create Supabase project and run <code className="bg-slate-100 px-1 rounded">supabase/schema.sql</code>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-sky-600">2.</span>
              Add environment variables (see README)
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-sky-600">3.</span>
              Add your first router and download the .rsc script
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-sky-600">4.</span>
              Paste script into MikroTik and upload HTML files
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-sky-600">5.</span>
              Connect mobile money API
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
