"use client";

import React from 'react';
import SalesChart from './SalesChart';
import { LuTriangleAlert } from 'react-icons/lu';

export default function DashboardClient({ stats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 & 2: Analytics & Inventory */}
        <div className="lg:col-span-2 space-y-8">
            {/* Revenue Hero */}
            <div className="bg-linear-to-r from-accent-gold/10 to-transparent border border-accent-gold/20 rounded-lg p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <span className="text-accent-gold text-[150px] leading-none font-serif">₹</span>
                </div>
                <h2 className="text-accent-gold font-serif text-2xl mb-2">Total Revenue</h2>
                <div className="flex items-baseline gap-4">
                    <span className="text-7xl font-mono text-white font-light">
                        <span className="text-4xl text-accent-gold mr-2">₹</span>
                        {stats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs border border-emerald-500/20">
                        ↑ 12%
                    </span>
                </div>
            </div>

            {/* Charts */}
            <SalesChart />
        </div>

        {/* Column 3: Side Panel */}
        <div className="lg:col-span-1 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-admin-card border border-white/10 p-4 rounded-lg">
                    <div className="text-xs text-white/40 uppercase mb-2">Active Orders</div>
                    <div className="text-3xl font-mono text-admin-text">{stats.activeOrders}</div>
                </div>
                 <div className="bg-admin-card border border-red-500/20 p-4 rounded-lg relative overflow-hidden">
                    <div className="text-xs text-red-400/60 uppercase mb-2">Alerts</div>
                    <div className="text-3xl font-mono text-red-400">{stats.alerts}</div>
                    <span className="absolute -bottom-2 -right-2 text-red-500/10 text-6xl"><LuTriangleAlert /></span>
                </div>
            </div>

            {/* System Log */}
             <div className="bg-black/20 border border-white/5 rounded-lg p-4">
                <h3 className="text-xs text-white/30 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">System Log</h3>
                <div className="space-y-2 font-mono text-[10px] text-white/40">
                     <div className="flex justify-between"><span>10:42:01</span> <span className="text-green-500">PAYMENT_OK</span></div>
                     <div className="flex justify-between"><span>10:41:55</span> <span className="text-blue-500">STOCK_UPDATE</span></div>
                     <div className="flex justify-between"><span>10:41:12</span> <span className="text-green-500">ORDER_NEW</span></div>
                </div>
            </div>
        </div>
    </div>
  );
}
