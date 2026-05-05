"use client";

import { useState, useEffect } from "react";
import { LuDownload, LuPrinter, LuQrCode } from "react-icons/lu";

const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function TableQRPage() {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.origin}/menu`);
    }
  }, []);

  const getQRUrl = (table) => {
    const menuUrl = `${baseUrl}?table=${table}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`;
  };

  const downloadQR = async (table) => {
    try {
      const res = await fetch(getQRUrl(table));
      const blob = await res.blob();
      const link = document.createElement("a");
      link.download = `valhalla-table-${table}-qr.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const printAll = () => {
    window.print();
  };

  return (
    <div className="max-w-[1920px] mx-auto text-admin-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 border-b border-white/5 pb-4 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-white mb-1">Table QR Codes</h1>
          <p className="text-white/40 text-xs md:text-sm tracking-widest uppercase">
            SCAN TO AUTO-ASSIGN TABLE
          </p>
        </div>
        <button
          onClick={printAll}
          className="flex items-center gap-2 bg-admin-card border border-white/10 px-4 py-2 rounded-full text-xs text-accent-gold hover:bg-accent-gold/10 hover:border-accent-gold/30 transition-all font-mono tracking-widest uppercase"
        >
          <LuPrinter size={14} />
          PRINT ALL
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-accent-gold/5 border border-accent-gold/20 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <LuQrCode className="text-accent-gold shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-white/80 text-sm mb-1">
              Each table has a unique QR code. When a customer scans it, they are taken directly to the menu page
              with their table number automatically assigned.
            </p>
            <p className="text-white/40 text-xs font-mono">
              URL Format: <span className="text-accent-gold">{baseUrl || "..."}?table=<span className="text-blue-400">[number]</span></span>
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {TABLES.map((table) => (
          <div
            key={table}
            className="bg-admin-card border border-white/10 rounded-xl p-6 flex flex-col items-center hover:border-accent-gold/30 transition-all duration-300 group"
          >
            <div className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-3 font-mono">
              Table {table}
            </div>

            {/* QR Code Image */}
            <div className="bg-white rounded-lg p-3 mb-4 shadow-lg shadow-black/20">
              {baseUrl ? (
                <img
                  src={getQRUrl(table)}
                  alt={`QR Code for Table ${table}`}
                  width={200}
                  height={200}
                  className="w-[200px] h-[200px]"
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400 text-xs">
                  Loading...
                </div>
              )}
            </div>

            <p className="text-white/30 text-[10px] font-mono mb-4 text-center break-all">
              {baseUrl}?table={table}
            </p>

            <button
              onClick={() => downloadQR(table)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs text-white/60 hover:text-accent-gold hover:border-accent-gold/30 transition-all font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100"
            >
              <LuDownload size={12} />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
