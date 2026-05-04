"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuLayoutDashboard,
  LuClipboardList,
  LuCoffee,
  LuSettings,
  LuLogOut,
} from "react-icons/lu";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <LuLayoutDashboard /> },
  { name: "Orders", path: "/admin/orders", icon: <LuClipboardList /> },
  { name: "Menu", path: "/admin/menu", icon: <LuCoffee /> },
  { name: "Settings", path: "/admin/settings", icon: <LuSettings /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1a1a1a] border-r border-white/5 h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-8 border-b border-white/5">
        <h1 className="text-accent-gold font-serif text-xl tracking-widest">
          VALHALLA
          <br />
          STUDIO
        </h1>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2">
        <div className="mb-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 group ${
                  isActive
                    ? "bg-accent-olive/20 text-accent-gold border-r-2 border-accent-gold"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <span
                  className={`text-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-accent-gold" : "group-hover:text-white"}`}
                >
                  {item.icon}
                </span>
                <span className="font-sans text-sm tracking-wide uppercase">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-4 px-4 py-3 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            <LuLogOut />
          </span>
          <span className="font-sans text-sm tracking-wide uppercase">
            Exit Studio
          </span>
        </Link>
      </div>
    </aside>
  );
}
