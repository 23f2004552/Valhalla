"use client";
import React from 'react';

export default function AdminSettingsPage() {
    return (
        <div className="max-w-[1920px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-1">System Settings</h1>
                    <p className="text-white/40 text-sm tracking-widest uppercase">Global Configurations</p>
                </div>
                <button className="bg-accent-gold text-black px-6 py-2 rounded text-sm hover:bg-white transition-all font-mono uppercase tracking-widest">
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-admin-card border border-white/10 rounded-lg p-6">
                        <h3 className="text-accent-gold font-serif text-lg mb-6">Tax & Accounting</h3>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">GST Rate (%)</label>
                                <input type="number" defaultValue={5} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-accent-gold/50 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Service Charge (%)</label>
                                <input type="number" defaultValue={10} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-accent-gold/50 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Currency Symbol</label>
                                <input type="text" defaultValue="₹" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-accent-gold/50 outline-none transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-admin-card border border-white/10 rounded-lg p-6">
                         <h3 className="text-accent-gold font-serif text-lg mb-6">Operations</h3>
                         <div className="space-y-4">
                             <label className="flex items-center gap-3 text-white/80">
                                 <input type="checkbox" defaultChecked className="accent-accent-gold w-4 h-4" />
                                 Auto-accept incoming orders
                             </label>
                             <label className="flex items-center gap-3 text-white/80">
                                 <input type="checkbox" defaultChecked className="accent-accent-gold w-4 h-4" />
                                 Deduct inventory upon order confirmation
                             </label>
                             <label className="flex items-center gap-3 text-white/80">
                                 <input type="checkbox" className="accent-accent-gold w-4 h-4" />
                                 Require Manager PIN for item cancellation
                             </label>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
