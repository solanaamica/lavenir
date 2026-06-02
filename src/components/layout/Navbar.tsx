"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Assets", href: "/#assets" },
  { label: "How it works", href: "/#how-it-works" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E4E7EC]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M2 12 L5 7 L8 9 L11 4 L14 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-[#111827] text-lg tracking-tight">Lavenir</span>
          </Link>
          {isHome && (
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="btn-primary text-sm"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
