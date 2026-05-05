"use client";

import { useState, useEffect } from "react";
import { LuTrendingUp, LuDollarSign, LuShoppingBag } from "react-icons/lu";
import SalesChart from "../../../components/admin/SalesChart";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AnalyticsPage() {
  const [topItems, setTopItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [itemsRes, salesRes] = await Promise.all([
          fetch(`${API_URL}/analytics/top-items`),
          fetch(`${API_URL}/analytics/daily-sales`),
        ]);

        if (itemsRes.ok) setTopItems(await itemsRes.json());
        if (salesRes.ok) setSales(await salesRes.json());
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalOrders = sales.reduce((acc, curr) => acc + (curr.order_count || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white/30">
        <div className="w-8 h-8 border-2 border-white/20 border-t-accent-gold rounded-full animate-spin mb-4" />
        <p className="font-serif tracking-widest uppercase text-xs">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto text-admin-text space-y-8">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl md:text-3xl font-serif text-admin-text mb-1">Analytics Overview</h1>
        <p className="text-white/40 text-xs md:text-sm tracking-widest uppercase">
          Performance & Sales Data
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-admin-card border border-white/10 p-6 rounded-lg relative overflow-hidden group hover:border-accent-gold/30 transition-colors">
          <LuDollarSign className="absolute -right-4 -bottom-4 text-8xl text-white/5 group-hover:text-accent-gold/5 transition-colors" />
          <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Total Revenue</div>
          <div className="text-4xl font-mono text-accent-gold">
            ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-admin-card border border-white/10 p-6 rounded-lg relative overflow-hidden group hover:border-blue-400/30 transition-colors">
          <LuShoppingBag className="absolute -right-4 -bottom-4 text-8xl text-white/5 group-hover:text-blue-400/5 transition-colors" />
          <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Total Orders</div>
          <div className="text-4xl font-mono text-blue-400">{totalOrders || "-"}</div>
        </div>

        <div className="bg-admin-card border border-white/10 p-6 rounded-lg relative overflow-hidden group hover:border-green-400/30 transition-colors">
          <LuTrendingUp className="absolute -right-4 -bottom-4 text-8xl text-white/5 group-hover:text-green-400/5 transition-colors" />
          <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Top Selling Item</div>
          <div className="text-2xl font-serif text-green-400 mt-2 truncate">
            {topItems.length > 0 ? topItems[0].name : "N/A"}
          </div>
          {topItems.length > 0 && (
            <div className="text-xs text-white/40 mt-1 font-mono">
              {topItems[0].quantity_sold} units sold
            </div>
          )}
        </div>
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-serif text-white mb-4">Revenue Trend</h2>
          <SalesChart />
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-lg font-serif text-white mb-4">Top Items</h2>
          <div className="bg-admin-card border border-white/10 rounded-lg overflow-hidden">
            {topItems.length === 0 ? (
              <div className="p-8 text-center text-white/30 italic font-serif">No data available</div>
            ) : (
              <ul className="divide-y divide-white/5">
                {topItems.map((item, index) => (
                  <li key={item.menu_item_id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-accent-gold/40 font-mono text-xs w-4">
                        {index + 1}.
                      </span>
                      <span className="text-white font-serif">{item.name}</span>
                    </div>
                    <span className="text-white/60 font-mono text-sm">
                      {item.quantity_sold} <span className="text-[10px] uppercase tracking-wider text-white/30">sold</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
