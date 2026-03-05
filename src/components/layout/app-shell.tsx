'use client';

import { Header } from './header';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="h-[calc(100vh-3.5rem)]">{children}</main>
    </div>
  );
}
