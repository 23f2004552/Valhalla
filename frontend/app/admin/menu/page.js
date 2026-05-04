"use client";
import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function AdminMenuPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMenu = async () => {
        try {
            const data = await api.get('/menu');
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch menu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    return (
        <div className="max-w-[1920px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-1">Menu Management</h1>
                    <p className="text-white/40 text-sm tracking-widest uppercase">The Collection</p>
                </div>
                <button className="bg-accent-gold/10 border border-accent-gold/30 text-accent-gold px-4 py-2 rounded text-sm hover:bg-accent-gold/20 transition-all font-mono uppercase tracking-widest">
                    + Add Dish
                </button>
            </div>

            {/* Menu List */}
            <div className="bg-admin-card border border-white/10 rounded-lg overflow-hidden flex flex-col h-full">
                <div className="overflow-x-auto flex-1">
                    {loading ? (
                        <div className="p-8 text-center text-white/30">Loading operations...</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/20 text-white/40 text-xs uppercase tracking-widest font-mono">
                                <tr>
                                    <th className="p-4 font-normal">Item</th>
                                    <th className="p-4 font-normal">Category</th>
                                    <th className="p-4 font-normal text-right">Price</th>
                                    <th className="p-4 font-normal text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-medium text-white">{item.name}</td>
                                        <td className="p-4 font-mono text-white/40">ID: {item.category_id || 'N/A'}</td>
                                        <td className="p-4 text-right text-accent-gold">₹{item.price}</td>
                                        <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-white/40 hover:text-white mr-3 transition-colors">Edit</button>
                                            <button className="text-red-400/40 hover:text-red-400 transition-colors">Hide</button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-white/40 italic">No menu items found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
