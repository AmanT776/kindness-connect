import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-card py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Bahir Dar University. All rights reserved.</p>
          <p className="mt-1">Complaint Management System</p>
        </div>
      </footer>
    </div>
  );
}
