'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Is this the home page?
  const isHome = pathname === '/';
  // Admin pages don't get the public navbar
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdminPage) return null;

  const bgClass = isHome && !isScrolled
    ? 'bg-transparent text-white'
    : 'glass text-gray-900 shadow-sm';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 top-0 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="heading-font text-2xl font-semibold tracking-wider">
              VILLA SERENITY
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`hover:text-[#d4af37] transition px-3 py-2 text-sm uppercase tracking-wide ${pathname === '/' ? 'text-[#d4af37] font-medium' : ''}`}>Inicio</Link>
            <Link href="/gallery" className={`hover:text-[#d4af37] transition px-3 py-2 text-sm uppercase tracking-wide ${pathname === '/gallery' ? 'text-[#d4af37] font-medium' : ''}`}>Galería</Link>
            <Link href="/book" className="bg-[#d4af37] hover:bg-[#c5a028] text-white px-6 py-2.5 rounded-sm transition text-sm uppercase tracking-wide font-medium shadow">Reservar</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:text-[#d4af37] focus:outline-none p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-dark absolute w-full text-white pb-4 border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
            <Link onClick={() => setMobileMenuOpen(false)} href="/" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-white/10">Inicio</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/gallery" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-white/10">Galería</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/book" className="block px-3 py-3 mt-2 rounded-md text-base font-medium bg-[#d4af37] text-white">Reservar Ahora</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
