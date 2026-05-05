"use client";

import { useState, useEffect, useCallback } from "react";
import { LuRefreshCw, LuCheck, LuX } from "react-icons/lu";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const STATUS_CONFIG = {
  completed: { label: "Completed", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", icon: <LuCheck /> },
  failed:    { label: "Failed",    color: "text-red-400",   bg: "bg-red-400/10",   border: "border-red-400/20",   icon: <LuX /> },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/payments`);
      if (res.ok) {
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch payments:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 15000);
    return () => clearInterval(interval);
  }, [fetchPayments]);

  const filteredPayments = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successCount = payments.filter((p) => p.status === "completed").length;
  const failedCount = payments.filter((p) => p.status === "failed").length;

  return (
    <div className="max-w-[1920px] mx-auto text-admin-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 border-b border-white/5 pb-4 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-admin-text mb-1">Payments</h1>
          <p className="text-white/40 text-xs md:text-sm tracking-widest uppercase">
            {payments.length} total · ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })} collected
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchPayments(); }}
          className="flex items-center gap-2 bg-admin-card border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs text-white/60 hover:text-white hover:border-white/20 transition-all"
        >
          <LuRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-admin-card border border-white/10 p-4 rounded-lg">
          <div className="text-xs text-white/40 uppercase mb-2">Total Payments</div>
          <div className="text-3xl font-mono text-admin-text">{payments.length}</div>
        </div>
        <div className="bg-admin-card border border-green-500/20 p-4 rounded-lg">
          <div className="text-xs text-green-400/60 uppercase mb-2">Successful</div>
          <div className="text-3xl font-mono text-green-400">{successCount}</div>
        </div>
        <div className="bg-admin-card border border-red-500/20 p-4 rounded-lg">
          <div className="text-xs text-red-400/60 uppercase mb-2">Failed</div>
          <div className="text-3xl font-mono text-red-400">{failedCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "completed", "failed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              filter === s
                ? "bg-accent-gold text-black font-bold"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {s === "all"
              ? `All (${payments.length})`
              : `${STATUS_CONFIG[s]?.label} (${payments.filter((p) => p.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-admin-card border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading && payments.length === 0 ? (
            <div className="p-8 text-center text-white/30">
              <div className="w-8 h-8 border-2 border-white/20 border-t-accent-gold rounded-full animate-spin mx-auto mb-4" />
              Loading payments...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-white/30 font-serif italic text-lg">
              No payments found.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 text-white/40 text-xs uppercase tracking-widest font-mono">
                <tr>
                  <th className="p-4 font-normal">Payment ID</th>
                  <th className="p-4 font-normal">Order ID</th>
                  <th className="p-4 font-normal text-right">Amount</th>
                  <th className="p-4 font-normal text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayments.map((payment) => {
                  const cfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.completed;
                  return (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-white">#{payment.id}</td>
                      <td className="p-4 font-mono text-white/60">Order #{payment.order_id}</td>
                      <td className="p-4 text-right text-accent-gold font-mono">
                        ₹{(payment.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 ${cfg.color} ${cfg.bg} border ${cfg.border} px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
