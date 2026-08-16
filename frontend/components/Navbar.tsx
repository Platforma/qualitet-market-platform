"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-black text-white px-6 py-4 flex items-center gap-8 shadow-md">
      <Link href="/" className="font-bold text-lg hover:text-gray-300">
        QualitetMarket
      </Link>

      <div className="flex gap-6">
        <Link href="/parts" className="hover:text-gray-300">Części</Link>
        <Link href="/sellers" className="hover:text-gray-300">Sprzedawcy</Link>
        <Link href="/breakdowns" className="hover:text-gray-300">Awarie</Link>
        <Link href="/admin" className="hover:text-gray-300">Panel Admina</Link>
      </div>
    </nav>
  );
}
