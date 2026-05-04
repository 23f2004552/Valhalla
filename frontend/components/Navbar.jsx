"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { cartCount, cartTotal, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 flex justify-between items-center px-8 md:px-16 py-6 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
        scrolled
          ? "bg-[#FFF9EB]/95 backdrop-blur-md py-4"
          : "bg-transparent"
      }`}
    >
      {/* Brand — lowercase serif, like savor's "savor" */}
      <Link href="/" className="group relative z-50">
        <span className={`font-luxury text-[28px] transition-colors duration-500 ${
          scrolled ? "text-text-primary" : "text-[#FFF9EB]"
        } group-hover:text-[#F8E47D]`}>
          valhalla
        </span>
      </Link>

      {/* Nav links — right side, clean sans, like savor's "Process Foods Care Mission Journal Contact" */}
      <div className="flex items-center gap-8">
        <div className={`hidden md:flex gap-8 font-sans text-[13px] tracking-wide transition-colors duration-500 ${
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

        {/* Cart pill */}
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
    </nav>
  );
}
