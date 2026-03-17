import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
