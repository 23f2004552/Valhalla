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
    activeOrderId,
    setActiveOrderId,
    clearActiveOrder
  } = useCart();

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [activeOrderDetails, setActiveOrderDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add("cart-open");
    } else {
      document.body.classList.remove("cart-open");
    }
    return () => document.body.classList.remove("cart-open");
  }, [isCartOpen]);

  useEffect(() => {
    if (!activeOrderId || !isCartOpen) return;

    const fetchOrderStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${activeOrderId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveOrderDetails(data);
          // If cancelled or completed, maybe clear it after a delay, but let's just keep it so they can see it's done.
        } else if (res.status === 404) {
          clearActiveOrder();
        }
      } catch (e) {
        console.error("Failed to fetch order status", e);
      }
    };

    fetchOrderStatus();
    const interval = setInterval(fetchOrderStatus, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [activeOrderId, isCartOpen, clearActiveOrder]);

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

      // Process Payment
      const paymentRes = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderData.id,
          amount: cartTotal,
        }),
      });

      if (!paymentRes.ok) {
        throw new Error("Payment service unavailable.");
      }

      const paymentData = await paymentRes.json();
      if (paymentData.status === "failed") {
        throw new Error("Payment declined.");
      }

      clearCart();
      setActiveOrderId(orderData.id);
      setStatus("idle");
      setSelectedTable(null);
      setCustomerName("");
      // Removed the alert to provide a smoother transition to the tracking view
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
          <h2 className="text-2xl font-serif text-accent-gold">
            {cartItems.length === 0 && activeOrderDetails ? "Live Tracking" : "Your Selection"}
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-white/50 hover:text-white transition-colors w-11 h-11 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          activeOrderDetails ? (
            <div className="flex-1 flex flex-col pt-4">
              <div className="text-center mb-8">
                <div className="text-xs text-white/40 uppercase tracking-[0.3em] mb-2">Order #{activeOrderDetails.id}</div>
                <div className="text-4xl font-serif text-white capitalize mb-4">{activeOrderDetails.status}</div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden flex">
                  <div className={`h-full transition-all duration-1000 ${
                    activeOrderDetails.status === 'pending' ? 'w-1/3 bg-yellow-400' :
                    activeOrderDetails.status === 'preparing' ? 'w-2/3 bg-blue-400' :
                    activeOrderDetails.status === 'ready' ? 'w-full bg-green-400' :
                    activeOrderDetails.status === 'completed' ? 'w-full bg-white/40' :
                    'w-full bg-red-400'
                  }`} />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-5 border border-white/10 mb-6">
                <div className="flex justify-between text-sm mb-2 text-white/60">
                  <span>Guest</span>
                  <span className="text-white">{activeOrderDetails.customer_name || 'Guest'}</span>
                </div>
                <div className="flex justify-between text-sm text-white/60">
                  <span>Table</span>
                  <span className="text-accent-gold">Table {activeOrderDetails.table_number}</span>
                </div>
              </div>

              <div className="mt-auto">
                {activeOrderDetails.status === 'completed' || activeOrderDetails.status === 'cancelled' ? (
                  <button
                    onClick={() => {
                      clearActiveOrder();
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-white/10 text-white py-4 font-serif text-lg hover:bg-white/20 transition-colors duration-300"
                  >
                    Close Tracker
                  </button>
                ) : (
                  <p className="text-center text-xs text-white/30 uppercase tracking-widest">
                    Updating live...
                  </p>
                )}
              </div>
            </div>
          ) : (
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
          )
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar space-y-4">
              {/* Items */}
              <div className="space-y-4">
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

            {/* ── Payment Method ── */}
            <div className="mt-4">
              <label className="block text-[10px] text-white/40 uppercase tracking-[0.3em] mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["card", "upi", "cash"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 rounded text-xs font-sans uppercase tracking-widest transition-all duration-200 ${
                      paymentMethod === method
                        ? "bg-accent-gold text-black font-bold shadow-lg shadow-accent-gold/20"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* UPI QR Code Display */}
            {paymentMethod === "upi" && (
              <div className="mt-4 flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-xs text-white/60 mb-3 font-mono tracking-widest uppercase">Scan to Pay</p>
                <div className="bg-white p-2 rounded-lg">
                  <img src="/upi-qr.png" alt="UPI QR Code" className="w-32 h-32 object-contain" />
                </div>
              </div>
            )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-accent-gold/20 shrink-0">
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
                    Processing Payment…
                  </span>
                ) : (
                  `Pay ₹${cartTotal} · Table ${selectedTable || "?"}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
