"use client";
import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function AdminMenuPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category_id: '', image_url: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleAddDish = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                name: newItem.name,
                description: newItem.description,
                price: parseFloat(newItem.price),
                category_id: newItem.category_id ? parseInt(newItem.category_id) : null,
                image_url: newItem.image_url || null,
                is_available: editItem ? editItem.is_available : true
            };

            if (editItem) {
                await api.put(`/menu/${editItem.id}`, payload);
            } else {
                await api.post('/menu', payload);
            }

            closeModal();
            fetchMenu(); // Refresh the list
        } catch (err) {
            console.error("Failed to save dish:", err);
            alert("Failed to save dish");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEdit = (item) => {
        setNewItem({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category_id: item.category_id || '',
            image_url: item.image_url || ''
        });
        setEditItem(item);
        setIsAddModalOpen(true);
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setEditItem(null);
        setNewItem({ name: '', description: '', price: '', category_id: '', image_url: '' });
    };

    const toggleVisibility = async (item) => {
        try {
            await api.put(`/menu/${item.id}`, {
                name: item.name,
                description: item.description,
                price: parseFloat(item.price),
                category_id: item.category_id,
                image_url: item.image_url,
                is_available: item.is_available === false ? true : false
            });
            fetchMenu();
        } catch (err) {
            console.error("Failed to update visibility:", err);
            alert("Failed to update status");
        }
    };

    return (
        <div className="max-w-[1920px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 border-b border-white/5 pb-4 gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif text-white mb-1">Menu Management</h1>
                    <p className="text-white/40 text-xs md:text-sm tracking-widest uppercase">The Collection</p>
                </div>
                <button 
                    onClick={() => { setEditItem(null); setIsAddModalOpen(true); }}
                    className="bg-accent-gold/10 border border-accent-gold/30 text-accent-gold px-3 md:px-4 py-2 rounded text-xs md:text-sm hover:bg-accent-gold/20 transition-all font-mono uppercase tracking-widest"
                >
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
                                    <tr key={item.id} className={`hover:bg-white/5 transition-colors group ${item.is_available === false ? 'opacity-50' : ''}`}>
                                        <td className="p-4 font-medium text-white">
                                            {item.name}
                                            {item.is_available === false && <span className="ml-2 text-[10px] text-red-400 border border-red-400/30 px-1 rounded">HIDDEN</span>}
                                        </td>
                                        <td className="p-4 font-mono text-white/40">ID: {item.category_id || 'N/A'}</td>
                                        <td className="p-4 text-right text-accent-gold">₹{item.price}</td>
                                        <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(item)} className="text-white/40 hover:text-white mr-3 transition-colors">Edit</button>
                                            <button onClick={() => toggleVisibility(item)} className="text-red-400/40 hover:text-red-400 transition-colors">
                                                {item.is_available === false ? 'Show' : 'Hide'}
                                            </button>
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

            {/* Add/Edit Dish Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-admin-card border border-white/10 p-8 rounded-lg max-w-md w-full">
                        <h2 className="text-xl font-serif text-accent-gold mb-6">
                            {editItem ? 'Edit Dish' : 'Add New Dish'}
                        </h2>
                        <form onSubmit={handleAddDish} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newItem.name}
                                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-accent-gold/50 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Description</label>
                                <textarea 
                                    value={newItem.description}
                                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-accent-gold/50 outline-none transition-colors h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Image URL (Optional)</label>
                                <input 
                                    type="url" 
                                    placeholder="https://example.com/image.jpg"
                                    value={newItem.image_url}
                                    onChange={e => setNewItem({...newItem, image_url: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-accent-gold/50 outline-none transition-colors text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Price (₹)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0"
                                        value={newItem.price}
                                        onChange={e => setNewItem({...newItem, price: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-accent-gold/50 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Category ID</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={newItem.category_id}
                                        onChange={e => setNewItem({...newItem, category_id: e.target.value})}
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
                                    {isSubmitting ? 'Saving...' : 'Save Dish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
