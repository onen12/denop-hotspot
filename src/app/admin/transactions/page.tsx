export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Transactions</h2>
        <p className="text-slate-600 mt-1">
          Mobile money payments and voucher redemptions will appear here.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="text-slate-400 text-4xl mb-3">💳</div>
        <h3 className="font-semibold text-slate-700">No transactions yet</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Connect Supabase and your mobile money API. Successful payments will
          create vouchers automatically and show up in this list.
        </p>
      </div>
    </div>
  );
}
