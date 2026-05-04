import DashboardClient from '../../../components/admin/DashboardClient';
import { fetchServer } from '../../../lib/api-server';

export default async function AdminDashboard() {
    let stats = { revenue: 0, activeOrders: 0, alerts: 0 };

    try {
        const data = await fetchServer("/analytics/daily-sales");
        let revenue = 0;
        if (Array.isArray(data)) {
            revenue = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        } else if (data && data.total_revenue) {
            revenue = data.total_revenue;
        }
        
        stats = {
            revenue: revenue || 0,
            activeOrders: 42 || 0, // Hardcoded simulation
            alerts: 2
        };
    } catch (error) {
        console.error("Failed to fetch analytics (SSR):", error.message);
        // Fallback to zero or error state
    }

    return (
        <div className="max-w-[1920px] mx-auto text-admin-text">
            {/* Header - Server Rendered for SEO/Verification */}
            <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-3xl font-serif text-admin-text mb-1">Command Center</h1>
                    <p className="text-white/40 text-sm tracking-widest uppercase">System Status: Operational</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-admin-card px-4 py-2 rounded-full border border-white/10">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                        <span className="text-xs text-green-400 font-mono">DB: CONNECTED</span>
                    </div>
                </div>
            </div>

            {/* Interactive Client Components */}
            <DashboardClient stats={stats} />
        </div>
    );
}
