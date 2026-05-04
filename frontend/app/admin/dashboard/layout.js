import Link from "next/link";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-admin-bg text-admin-text p-8">
            {/* Nav Bar */}
            <nav className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-white/40 hover:text-white/70 text-xs uppercase tracking-widest transition-colors">
                        ← Back to Site
                    </Link>
                    <span className="text-white/10">|</span>
                    <span className="text-accent-gold font-serif text-lg tracking-wider">VALHALLA</span>
                    <span className="text-white/20 text-xs font-mono uppercase">{`// Admin`}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-white/30 font-mono">SYSTEM v2.0</span>
                    <Link 
                        href="/admin" 
                        className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-1 rounded hover:bg-red-500/10 transition-all"
                    >
                        Logout
                    </Link>
                </div>
            </nav>
            {children}
        </div>
    );
}
