"use client";

import { LuExternalLink } from "react-icons/lu";

export default function MetricsPage() {
  const GRAFANA_URL = process.env.NEXT_PUBLIC_GRAFANA_URL || "http://localhost:3001";
  const dashboardUrl = `${GRAFANA_URL}/d/valhalla-overview/valhalla-overview?orgId=1&kiosk=tv`;

  return (
    <div className="max-w-[1920px] mx-auto text-admin-text h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 border-b border-white/5 pb-4 gap-3 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-white mb-1">System Metrics</h1>
          <p className="text-white/40 text-xs md:text-sm tracking-widest uppercase">
            GRAFANA LIVE MONITORING
          </p>
        </div>
        <a
          href={dashboardUrl.replace('&kiosk=tv', '')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-admin-card border border-white/10 px-4 py-2 rounded-full text-xs text-accent-gold hover:bg-accent-gold/10 hover:border-accent-gold/30 transition-all font-mono tracking-widest uppercase"
        >
          OPEN IN NEW TAB
          <LuExternalLink size={14} />
        </a>
      </div>

      {/* Grafana Iframe */}
      <div className="flex-1 bg-black/40 border border-white/10 rounded-lg overflow-hidden relative min-h-[600px]">
        <iframe
          src={dashboardUrl}
          className="w-full h-full absolute inset-0 border-0"
          title="Grafana Dashboard"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
}
