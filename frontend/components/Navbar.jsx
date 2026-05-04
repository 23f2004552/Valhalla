"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { cartCount, cartTotal, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change or resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 flex justify-between items-center px-5 md:px-16 py-4 md:py-6 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
          scrolled
            ? "bg-[#FFF9EB]/95 backdrop-blur-md py-3 md:py-4"
            : "bg-transparent"
        }`}
      >
        {/* Brand */}
        <Link href="/" className="group relative z-50">
          <span className={`font-luxury text-[24px] md:text-[28px] transition-colors duration-500 ${
            scrolled ? "text-text-primary" : "text-[#FFF9EB]"
          } group-hover:text-[#F8E47D]`}>
            valhalla
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <div className={`flex gap-8 font-sans text-[13px] tracking-wide transition-colors duration-500 ${
            scrolled ? "text-text-primary/70" : "text-[#FFF9EB]/70"
          }`}>
            {["Menu", "Admin"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className={`relative transition-colors duration-300 ${
                  scrolled ? "hover:text-text-primary" : "hover:text-[#FFF9EB]"
                } before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-px ${
                  scrolled ? "before:bg-text-primary" : "before:bg-[#FFF9EB]"
                } hover:before:w-full before:transition-all before:duration-500`}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Cart pill — desktop */}
          <div
            onClick={() => setIsCartOpen(true)}
            className={`flex items-center gap-3 cursor-pointer group px-4 py-2 rounded-sm border transition-all duration-500 ${
              scrolled
                ? "border-text-primary/15 hover:bg-text-primary/5"
                : "border-[#FFF9EB]/15 hover:bg-[#FFF9EB]/5"
            }`}
          >
            <span className={`font-sans text-[12px] tracking-wide transition-colors duration-500 ${
              scrolled ? "text-text-primary" : "text-[#FFF9EB]"
            }`}>
              Cart ({cartCount})
            </span>
            <div className={`w-4 h-px transition-all duration-500 group-hover:w-6 ${
              scrolled ? "bg-text-primary/30" : "bg-[#FFF9EB]/30"
            }`} />
            <span className={`font-sans text-[12px] tracking-wide transition-colors duration-500 ${
              scrolled ? "text-text-primary" : "text-[#FFF9EB]"
            }`}>
              ₹{cartTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Mobile: Cart + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {/* Mobile cart pill */}
          <div
            onClick={() => setIsCartOpen(true)}
            className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-sm border transition-all duration-500 ${
              scrolled
                ? "border-text-primary/15"
                : "border-[#FFF9EB]/15"
            }`}
          >
            <span className={`font-sans text-[11px] tracking-wide transition-colors duration-500 ${
              scrolled ? "text-text-primary" : "text-[#FFF9EB]"
            }`}>
              Cart ({cartCount})
            </span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-5 transition-all duration-300 ${
              mobileMenuOpen 
                ? "rotate-45 translate-y-[3px] bg-[#FFF9EB]" 
                : scrolled ? "bg-text-primary" : "bg-[#FFF9EB]"
            }`} />
            <span className={`block h-px w-5 transition-all duration-300 ${
              mobileMenuOpen 
                ? "-rotate-45 -translate-y-[3px] bg-[#FFF9EB]" 
                : scrolled ? "bg-text-primary" : "bg-[#FFF9EB]"
            }`} />
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-text-primary flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {["Menu", "Admin"].map((item) => (
          <Link
            key={item}
            href={`/${item.toLowerCase()}`}
            onClick={() => setMobileMenuOpen(false)}
            className="font-luxury text-[#FFF9EB] text-4xl tracking-wider hover:text-[#F8E47D] transition-colors duration-300"
          >
            {item}
          </Link>
        ))}
        <div className="mt-4 border-t border-[#FFF9EB]/10 pt-6">
          <div
            onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }}
            className="cursor-pointer text-center"
          >
            <span className="font-sans text-[#FFF9EB]/50 text-xs tracking-[0.3em] uppercase block mb-2">Your Selection</span>
            <span className="font-serif text-[#F8E47D] text-2xl">₹{cartTotal.toLocaleString()}</span>
            <span className="font-sans text-[#FFF9EB]/40 text-sm block mt-1">{cartCount} items</span>
          </div>
        </div>
      </div>
    </>
  );
}
