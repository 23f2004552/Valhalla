"use client";

import Image from "next/image";
import { useCart } from "../context/CartContext";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export default function MenuSection({ title, items }) {
  const dishImages = {
    "Saffron Risotto": "/images/dish_risotto.jpg",
    "Wagyu Tartare": "/images/dish_wagyu.jpg",
    "Velvet Cacao": "/images/dish_chocolate.jpg",
  };
  const getImage = (item) => {
    let url = item.image_url || dishImages[item.name] || "/images/dish_default.jpg";
    
    // Automatically convert Google Drive links to direct image CDN links
    if (url.includes("drive.google.com")) {
      let fileId = null;
      if (url.includes("file/d/")) {
        const match = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
      } else if (url.includes("uc?")) {
        const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
      }
      if (fileId) {
        url = `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    }
    return url;
  };

  const { addToCart } = useCart();
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".menu-card");
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: i * 0.08,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [items]);

  const checkStock = (item) => {
    if (item.inventory_count === undefined || item.inventory_count === null)
      return true;
    return item.inventory_count > 0;
  };

  const handleAddToCart = (item) => {
    if (checkStock(item)) addToCart(item);
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 px-6 md:px-12 bg-text-primary overflow-hidden"
    >
      {/* Section Header — compact */}
      <div className="max-w-7xl mx-auto mb-10 flex items-end justify-between">
        <div>
          <span className="font-sans text-[#F8E47D] text-[10px] tracking-[0.4em] uppercase block mb-2 opacity-70">
            Curated Collection
          </span>
          <h2 className="font-luxury text-[#FFF9EB] text-3xl md:text-5xl leading-none tracking-tight">
            {title || "The Menu"}
          </h2>
        </div>
        <div className="hidden md:block w-16 h-px bg-[#F8E47D]/20 mb-2" />
      </div>

      {/* Cards Grid — compact 2-4 column responsive */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {!items || !Array.isArray(items) ? (
          <div className="text-[#FFF9EB]/30 text-center col-span-full py-12 font-sans tracking-widest text-sm">
            LOADING COLLECTION...
          </div>
        ) : (
          items.map((item) => {
            const isSoldOut = !checkStock(item);

            return (
              <div
                key={item.id}
                className="menu-card group relative opacity-0 bg-[#1a0808] rounded-lg overflow-hidden border border-[#FFF9EB]/5 hover:border-[#F8E47D]/20 transition-all duration-500"
              >
                {/* Image — compact 16:10 landscape */}
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <img
                    src={getImage(item)}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
                      isSoldOut ? "grayscale opacity-40" : ""
                    }`}
                    onError={(e) => {
                      e.target.src = "/images/dish_default.jpg";
                    }}
                  />

                  {/* Subtle gradient at bottom for text readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-[#1a0808]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Sold Out Badge */}
                  {isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                      <span className="font-sans text-[#FFF9EB]/60 text-[10px] tracking-[0.3em] uppercase border border-[#FFF9EB]/20 px-4 py-1.5">
                        Unavailable
                      </span>
                    </div>
                  )}

                  {/* Quick Add — hover overlay */}
                  {!isSoldOut && (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="absolute bottom-3 right-3 z-10 bg-[#F8E47D] text-text-primary font-sans text-[10px] tracking-[0.2em] uppercase px-4 py-2 rounded opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#FFF9EB] cursor-pointer"
                    >
                      + Add
                    </button>
                  )}
                </div>

                {/* Info — compact */}
                <div className="px-4 py-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-luxury text-[#FFF9EB] text-sm md:text-base leading-tight group-hover:text-[#F8E47D] transition-colors duration-400">
                      {item.name}
                    </h3>
                    <span className="font-sans text-[#F8E47D] text-xs tracking-wider shrink-0 mt-0.5">
                      ₹{item.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="font-sans text-[#FFF9EB]/30 text-[11px] tracking-wide leading-relaxed mt-1.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

    </section>
  );
}
