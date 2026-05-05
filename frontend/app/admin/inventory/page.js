"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LuRefreshCw, LuPlus, LuX, LuTriangleAlert } from "react-icons/lu";
import api from "../../../lib/api";

export default function AdminInventoryPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", current_stock: "", threshold: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      const data = await api.get("/inventory");
      setIngredients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        current_stock: parseInt(formData.current_stock),
        threshold: parseInt(formData.threshold),
      };

      if (editItem) {
        await api.put(`/inventory/${editItem.id}`, payload);
      } else {
        await api.post("/inventory", payload);
      }

      closeModal();
      fetchInventory();
    } catch (err) {
      console.error("Failed to save ingredient:", err);
      alert("Failed to save ingredient");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (item) => {
    setFormData({
      name: item.name,
      current_stock: item.current_stock,
      threshold: item.threshold,
    });
    setEditItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
    setFormData({ name: "", current_stock: "", threshold: "" });
  };

  const lowStockCount = ingredients.filter((i) => i.current_stock <= i.threshold).length;

  return (
    <div className="max-w-[1920px] mx-auto min-h-screen text-admin-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 border-b border-white/5 pb-4 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-white mb-1">Inventory</h1>
          <p className="text-white/40 text-xs md:text-sm tracking-widest uppercase">
            {ingredients.length} ingredients · {lowStockCount} low stock
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setLoading(true); fetchInventory(); }}
            className="flex items-center gap-2 bg-admin-card border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs text-white/60 hover:text-white hover:border-white/20 transition-all"
          >
            <LuRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => { setEditItem(null); setIsModalOpen(true); }}
            className="bg-accent-gold/10 border border-accent-gold/30 text-accent-gold px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs hover:bg-accent-gold/20 transition-all font-mono uppercase tracking-widest flex items-center gap-2"
          >
            <LuPlus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-admin-card border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-white/30">
              <div className="w-8 h-8 border-2 border-white/20 border-t-accent-gold rounded-full animate-spin mx-auto mb-4" />
              Loading inventory...
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 text-white/40 text-xs uppercase tracking-widest font-mono">
                <tr>
                  <th className="p-4 font-normal">Ingredient</th>
                  <th className="p-4 font-normal text-right">Current Stock</th>
                  <th className="p-4 font-normal text-right">Threshold</th>
                  <th className="p-4 font-normal text-center">Status</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ingredients.map((item) => {
                  const isLow = item.current_stock <= item.threshold;
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-medium text-white">{item.name}</td>
                      <td className={`p-4 text-right font-mono ${isLow ? "text-red-400" : "text-white/70"}`}>
                        {item.current_stock}
                      </td>
                      <td className="p-4 text-right font-mono text-white/40">{item.threshold}</td>
                      <td className="p-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider">
                            <LuTriangleAlert size={10} /> Low
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-white/40 hover:text-white transition-colors text-xs"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {ingredients.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-white/40 italic font-serif">
                      No ingredients found. Add your first ingredient to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card border border-white/10 p-8 rounded-lg max-w-md w-full relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
            >
              <LuX size={18} />
            </button>
            <h2 className="text-xl font-serif text-accent-gold mb-6">
              {editItem ? "Edit Ingredient" : "Add New Ingredient"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-accent-gold/50 outline-none transition-colors"
                  placeholder="e.g. Tomatoes"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Current Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-accent-gold/50 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Threshold</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-accent-gold/50 outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 text-sm text-white/40 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 text-sm bg-accent-gold text-black rounded font-medium hover:bg-accent-gold/80 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Ingredient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
