"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '../../components/admin/Sidebar';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  
  // The login page at /admin should NOT show the sidebar
  const isLoginPage = pathname === '/admin';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="bg-admin-bg text-admin-text min-h-screen font-sans selection:bg-accent-gold selection:text-admin-bg flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 pt-16 md:p-6 md:pt-16 lg:p-8 lg:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
