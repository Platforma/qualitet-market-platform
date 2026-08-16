import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
