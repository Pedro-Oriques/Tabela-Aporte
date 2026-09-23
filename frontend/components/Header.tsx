"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Ações", href: "/stocks" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="w-full px-8 h-20 grid grid-cols-[auto_1fr_auto] items-center">
        <Link href="/" className="flex items-center gap-2 justify-self-start">
          <Image
            src="/logo.png"
            alt="Investchê"
            width={180}
            height={54}
            style={{ height: 54, width: "auto", objectFit: "contain" }}
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link px-4 py-2 text-sm font-medium${active ? " nav-link-active" : ""}`}
                style={{
                  color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
                  borderBottom: active ? "2px solid var(--color-accent)" : "2px solid transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="justify-self-end flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "var(--color-text-secondary)" }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="md:hidden px-6 pb-4 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
                  background: active ? "var(--color-surface-2)" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
