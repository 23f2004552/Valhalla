"use client";

import { useState, useEffect, useCallback } from "react";
import { LuRefreshCw, LuClock, LuChefHat, LuCheck, LuX } from "react-icons/lu";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const STATUS_CONFIG = {
  pending:   { label: "Pending",     color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: <LuClock /> },
  preparing: { label: "Preparing",   color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   icon: <LuChefHat /> },
  ready:     { label: "Ready",       color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  icon: <LuCheck /> },
  completed: { label: "Completed",   color: "text-white/40",   bg: "bg-white/5",       border: "border-white/10",      icon: <LuCheck /> },
  cancelled: { label: "Cancelled",   color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    icon: <LuX /> },
};

const STATUS_FLOW = ["pending", "preparing", "ready", "completed"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_URL}/menu`);
        if (res.ok) {
          const data = await res.json();
          const map = {};
          data.forEach(item => { map[item.id] = item.name });
          setMenuItems(map);
        }
      } catch (e) {
        console.error("Failed to fetch menu:", e);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const formatTime = (iso) => {
    if (!iso) return "—";
    let safeIso = iso;
    // If the backend returns a naive UTC string without timezone info, append 'Z'
    if (!safeIso.endsWith("Z") && !safeIso.includes("+") && !safeIso.match(/-\d{2}:\d{2}$/)) {
      safeIso += "Z";
    }
    const d = new Date(safeIso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div className="max-w-[1920px] mx-auto text-admin-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 border-b border-white/5 pb-4 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-admin-text mb-1">Live Orders</h1>
          <p className="text-white/40 text-xs md:text-sm tracking-widest uppercase">
            {orders.length} total · {orders.filter((o) => o.status === "pending").length} pending
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchOrders(); }}
          className="flex items-center gap-2 bg-admin-card border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs text-white/60 hover:text-white hover:border-white/20 transition-all"
        >
          <LuRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", ...Object.keys(STATUS_CONFIG)].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              filter === s
                ? "bg-accent-gold text-black font-bold"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {s === "all" ? `All (${orders.length})` : `${STATUS_CONFIG[s]?.label} (${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <div className="w-8 h-8 border-2 border-white/20 border-t-accent-gold rounded-full animate-spin mx-auto mb-4" />
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-serif italic text-lg">
          No orders found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const next = getNextStatus(order.status);

            return (
              <div
                key={order.id}
                className={`${cfg.bg} border ${cfg.border} rounded-lg p-5 transition-all hover:scale-[1.01] hover:shadow-lg`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-lg font-bold">#{order.id}</span>
                      {order.table_number && (
                        <span className="bg-accent-gold/20 text-accent-gold text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Table {order.table_number}
                        </span>
                      )}
                    </div>
                    <p className="text-white/30 text-xs mt-1">
                      {order.customer_name || "Guest"} · {formatTime(order.created_at)}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 ${cfg.color} text-xs font-mono uppercase shrink-0`}>
                    {cfg.icon}
                    {cfg.label}
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <ul className="space-y-1.5 border-t border-white/5 pt-3">
                      {order.items.map((i, idx) => (
                        <li key={idx} className="flex justify-between items-start text-white/70 text-sm font-serif">
                          <span><span className="text-accent-gold mr-2 font-sans text-xs">{i.qty}x</span> {menuItems[i.menu_item_id] || `Item #${i.menu_item_id}`}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-end mb-4 pt-3 border-t border-white/5">
                  <span className="text-white/30 text-xs uppercase tracking-wider">Total</span>
                  <span className="text-xl font-mono text-white">
                    ₹{(order.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {next && (
                    <button
                      onClick={() => updateStatus(order.id, next)}
                      className="flex-1 bg-white/10 hover:bg-accent-gold hover:text-black text-white text-xs font-mono uppercase tracking-wider py-2.5 rounded transition-all duration-200"
                    >
                      → {STATUS_CONFIG[next]?.label}
                    </button>
                  )}
                  {order.status !== "cancelled" && order.status !== "completed" && (
                    <button
                      onClick={() => updateStatus(order.id, "cancelled")}
                      className="px-3 bg-red-500/10 hover:bg-red-500/30 text-red-400 text-xs rounded transition-all"
                    >
                      <LuX />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
