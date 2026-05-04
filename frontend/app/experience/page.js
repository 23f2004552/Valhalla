"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Hero from "../../components/Hero"; // LCP - Static

// Lazy load heavy/below-fold components
const Philosophy = dynamic(() => import("../../components/Philosophy"));
const IngredientsSection = dynamic(() => import("../../components/IngredientsSection"));
const MenuSection = dynamic(() => import("../../components/MenuSection"));
import MenuSkeleton from "../../components/MenuSkeleton";
import ScrollReveal from "../../components/ScrollReveal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function ExperiencePage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const [itemsRes, catsRes] = await Promise.all([
          fetch(`${API_URL}/menu`).then((r) => r.json()),
          fetch(`${API_URL}/categories`).then((r) => r.json()),
        ]);
        setMenuItems(itemsRes);
        setCategories(catsRes);
      } catch (err) {
        console.error("Menu fetch failed:", err);
      } finally {
        setLoadingMenu(false);
      }
    }
    fetchMenu();
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.id - b.id),
    [categories]
  );

  return (
    <main className="bg-background-primary min-h-screen text-text-primary">
      <Navbar />
      <Hero />
      <Philosophy />
      <IngredientsSection />

      {/* Menu Section — uses global CartContext */}
      <section className="py-24 px-6 md:px-12 bg-background-primary" id="menu-section">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <span className="text-accent-olive text-xs tracking-[0.3em] uppercase block mb-4">
              The Collection
            </span>
            <h2 className="font-serif text-4xl md:text-5xl">Curate Your Journey</h2>
          </ScrollReveal>

          {loadingMenu ? (
            <div className="max-w-3xl mx-auto">
              <MenuSkeleton count={6} />
            </div>
          ) : (
            <div className="space-y-0">
              {sortedCategories.map((cat) => {
                const catItems = menuItems.filter((i) => i.category_id === cat.id);
                if (catItems.length === 0) return null;
                return <MenuSection key={cat.id} title={cat.name} items={catItems} />;
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
