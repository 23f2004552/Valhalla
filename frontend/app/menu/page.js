"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import MenuSection from "../../components/MenuSection";
import MenuSkeleton from "../../components/MenuSkeleton";
import Footer from "../../components/Footer";
import ScrollReveal from "../../components/ScrollReveal";
import { useCart } from "../../context/CartContext";

const API_URL = "/api";

function TableAssigner() {
  const searchParams = useSearchParams();
  const { setTableNumber } = useCart();

  useEffect(() => {
    const tableParam = searchParams.get("table");
    if (tableParam) {
      const num = parseInt(tableParam, 10);
      if (num >= 1 && num <= 12) {
        setTableNumber(num);
      }
    }
  }, [searchParams, setTableNumber]);

  return null;
}

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const [menuRes, catRes, invRes] = await Promise.all([
          fetch(`${API_URL}/menu`).then((r) => r.json()),
          fetch(`${API_URL}/menu/categories`).then((r) => r.json()).catch(() => []),
          fetch(`${API_URL}/inventory`).then((r) => r.json()).catch(() => []),
        ]);
        const availableMenuRes = Array.isArray(menuRes) ? menuRes.filter(item => item.is_available !== false) : [];
        setItems(availableMenuRes);
        setCategories(Array.isArray(catRes) ? catRes : []);
        setInventory(Array.isArray(invRes) ? invRes : []);
      } catch (err) {
        setError("Menu temporarily unavailable.");
        console.error("Menu fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.id - b.id),
    [categories]
  );

  return (
    <main className="bg-background-primary min-h-screen pt-24">
      <Navbar />

      {/* Suspense-wrapped search params reader */}
      <Suspense fallback={null}>
        <TableAssigner />
      </Suspense>

      {/* Header */}
      <ScrollReveal className="text-center py-12 px-6">
        <span className="font-sans text-xs tracking-[0.3em] uppercase text-accent-olive block mb-4">
          The Collection
        </span>
        <h1 className="font-serif text-5xl md:text-6xl text-text-primary">
          Our Menu
        </h1>
      </ScrollReveal>

      {/* Content */}
      {loading ? (
        <div className="max-w-3xl mx-auto px-6">
          <MenuSkeleton count={8} />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-accent-olive">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-0 pb-20">
          {sortedCategories.map((category) => {
            const categoryItems = items.filter(
              (item) => item.category_id === category.id
            );
            if (categoryItems.length === 0) return null;
            return (
              <MenuSection
                key={category.id}
                title={category.name}
                items={categoryItems}
                inventory={inventory}
              />
            );
          })}

          {/* Uncategorized */}
          {items.some((item) => !item.category_id) && (
            <MenuSection
              title="Chef's Specials"
              items={items.filter((item) => !item.category_id)}
              inventory={inventory}
            />
          )}

          {items.length === 0 && (
            <div className="text-center py-20 text-accent-olive">
              <p>Menu temporarily unavailable.</p>
            </div>
          )}
        </div>
      )}

      <Footer />
    </main>
  );
}
