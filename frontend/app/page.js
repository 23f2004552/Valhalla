"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StickyNarrative from "../components/StickyNarrative";
import ImageTunnel from "../components/ImageTunnel";
import AnimatedSVGPath from "../components/AnimatedSVGPath";

const MenuSection = dynamic(() => import("../components/MenuSection"));

const API_URL = "/api";

const MOCK_MENU = [
  { 
    id: 1, 
    name: "Saffron & Gold Risotto", 
    price: 3200, 
    description: "Aged carnaroli rice, Iranian saffron, 24k gold leaf, preserved lemon zest.",
    image_url: "/images/menu_risotto.png",
  },
  { 
    id: 2, 
    name: "Smoked Wagyu Tartare", 
    price: 4500, 
    description: "A5 Japanese Wagyu, pine nut emulsion, charcoal oil, cured egg yolk.",
    image_url: "/images/menu_wagyu.png",
  },
  { 
    id: 3, 
    name: "Velvet Cacao Textures", 
    price: 1800, 
    description: "Single-origin dark chocolate, sea salt foam, hazelnut praline.",
    image_url: "/images/menu_chocolate.png",
  },
];

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch(`${API_URL}/menu`);
        if (!res.ok) throw new Error("Menu unavailable");
        const items = await res.json();
        const availableItems = Array.isArray(items) ? items.filter(item => item.is_available !== false) : [];
        setFeaturedItems(availableItems.slice(0, 3));
      } catch {
        setFeaturedItems(MOCK_MENU);
      } finally {
        setLoaded(true);
      }
    }
    loadFeatured();
  }, []);

  return (
    <main className="bg-background-primary min-h-screen">
      <Navbar />
      
      {/* 1. HERO — Full screen cinematic entrance */}
      <Hero />
      
      {/* 2. STICKY NARRATIVE — 300vh scroll pin with wood texture + text reveal */}
      <StickyNarrative />

      {/* 3. MANIFESTO BRIDGE — Full-width dark transition between sticky and tunnel */}
      <section className="relative w-full bg-text-primary py-40 overflow-hidden">
        {/* Animated SVG path drawn by scroll */}
        <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
          <AnimatedSVGPath 
            pathD="M -200 300 C 150 0, 650 600, 1000 100 S 1400 500, 1800 200"
            strokeColor="rgba(248, 228, 125, 0.7)"
            strokeWidth={1}
            className="w-full h-full"
          />
        </div>

        {/* Manifesto Copy */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center">
          <p className="font-sans text-[#FFF9EB]/30 text-xs tracking-[0.4em] uppercase mb-8">
            A Declaration
          </p>
          <h2 className="font-luxury text-[#FFF9EB] text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-12">
            Every great<br/>
            <span className="italic text-[#F8E47D]">dining experience</span><br/>
            begins backstage.
          </h2>
          <p className="font-sans text-[#FFF9EB]/50 text-sm md:text-base tracking-wide leading-relaxed max-w-2xl mx-auto">
            From the moment an order is placed to the second a plate is set down,<br/>
            the Valhalla Suite orchestrates every detail — silently, precisely, magnificently.
          </p>
        </div>
      </section>

      {/* 4. IMAGE TUNNEL — 4,800px Valhalla Visual Parallax */}
      <ImageTunnel />

      {/* 5. MENU SECTION — "The Collection" reveal */}
      <section className="bg-text-primary z-20 relative">
        {loaded && featuredItems.length > 0 && (
          <MenuSection title="The Collection" items={featuredItems} />
        )}
      </section>
      
      {/* 6. FOOTER — Large typographic closer */}
      <Footer />
    </main>
  );
}
