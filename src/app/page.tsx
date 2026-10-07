import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">Denop Hostel Wifi</h1>
              <p className="text-xs text-slate-500">Hotspot Billing System</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/portal"
              className="px-4 py-2 text-sm font-medium text-sky-700 hover:text-sky-900"
            >
              Customer Portal
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
            >
              Admin Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Fast WiFi. Easy Payments.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Complete MikroTik hotspot billing system with mobile money, vouchers,
              and one-click router configuration for Denop Hostel.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/portal"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition shadow-sm"
              >
                Buy Internet Access
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Mobile Money"
              description="Customers pay with mobile money and get instant access or a voucher code."
            />
            <FeatureCard
              title="One-Click Router Setup"
              description="Add a router and generate a complete MikroTik script with hotspot, firewall, NAT and isolation."
            />
            <FeatureCard
              title="Vouchers & Packages"
              description="Create time/data packages, generate bulk vouchers, and track every transaction."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Denop Hostel Wifi · Powered by Next.js + Supabase
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
