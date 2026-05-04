"use client";

import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
  } = useCart();

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add("cart-open");
    } else {
      document.body.classList.remove("cart-open");
    }
    return () => document.body.classList.remove("cart-open");
  }, [isCartOpen]);

  const handleCheckout = async () => {
    if (!selectedTable) {
      setErrorMessage("Please select a table number.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName || "Guest",
          table_number: selectedTable,
          total: cartTotal,
          items: cartItems.map((item) => ({
            menu_item_id: item.id,
            qty: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error("Please wait a moment before trying again.");
        if (res.status >= 500) throw new Error("Our kitchen is temporarily unavailable.");
        throw new Error("Failed to place order.");
      }

      const orderData = await res.json();
      clearCart();
      setIsCartOpen(false);
      setStatus("idle");
      setSelectedTable(null);
      setCustomerName("");
      alert(`Order #${orderData.id} placed for Table ${orderData.table_number}!`);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Failed to place order.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 z-[60]"
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          opacity: isCartOpen ? 1 : 0,
          pointerEvents: isCartOpen ? "auto" : "none",
          transition: "opacity 400ms ease",
        }}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-[#1C1A18] border-l border-accent-gold/20 z-[70] p-6 flex flex-col"
        style={{
          transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 400ms ease",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-serif text-accent-gold">Your Selection</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-white/50 hover:text-white transition-colors w-11 h-11 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <p className="text-white/50 font-serif italic text-lg">Your plate is empty.</p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-4 text-xs uppercase tracking-widest text-accent-gold border-b border-accent-gold"
              style={{ minHeight: 44 }}
            >
              Return to Menu
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start group">
                  <div className="flex-1">
                    <h4 className="text-white font-serif text-lg">{item.name}</h4>
                    <p className="text-accent-gold/60 text-sm">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-white/10 rounded px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-white/50 hover:text-white w-7 h-7 flex items-center justify-center">−</button>
                      <span className="text-xs text-white w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-white/50 hover:text-white w-7 h-7 flex items-center justify-center">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center">✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Table Selection ── */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <label className="block text-[10px] text-white/40 uppercase tracking-[0.3em] mb-3">
                Assign Table
              </label>
              <div className="grid grid-cols-6 gap-2">
                {TABLES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTable(t)}
                    className={`py-2 rounded text-xs font-mono transition-all duration-200 ${
                      selectedTable === t
                        ? "bg-accent-gold text-black font-bold shadow-lg shadow-accent-gold/20"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Guest Name ── */}
            <div className="mt-4">
              <label className="block text-[10px] text-white/40 uppercase tracking-[0.3em] mb-2">
                Guest Name (optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter name"
                className="w-full bg-white/5 border border-white/10 text-white font-sans text-sm py-2 px-3 rounded focus:border-accent-gold/50 outline-none transition-colors placeholder:text-white/20"
              />
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-accent-gold/20">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-white/50 text-xs uppercase tracking-widest block">Total</span>
                  {selectedTable && (
                    <span className="text-white/30 text-[10px] uppercase tracking-wider">Table {selectedTable}</span>
                  )}
                </div>
                <span className="text-3xl font-serif text-accent-gold">₹{cartTotal}</span>
              </div>

              {status === "error" && (
                <p className="text-red-400 text-xs text-center mb-3">{errorMessage}</p>
              )}

              <button
                onClick={handleCheckout}
                disabled={status === "loading"}
                className="w-full bg-accent-gold text-black py-4 font-serif text-lg hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ minHeight: 52 }}
              >
                {status === "loading" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : (
                  `Confirm · Table ${selectedTable || "?"}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
