"use client";

import ScrollReveal from "./ScrollReveal";
import Image from "next/image";

const ingredients = [
  {
    name: "Kashmiri Saffron",
    desc: "The red gold of the Himalayas.",
    img: "https://images.unsplash.com/photo-1599525419992-069927429177?q=80&w=2070&auto=format&fit=crop",
    colSpan: "md:col-span-2",
    height: "h-[400px]",
  },
  {
    name: "Black Lentils",
    desc: "Slow-cooked for 48 hours.",
    img: "https://images.unsplash.com/photo-1555541603-9bd5e04cb241?q=80&w=2070&auto=format&fit=crop",
    colSpan: "md:col-span-1",
    height: "h-[300px]",
  },
  {
    name: "The Clay Oven",
    desc: "Charcoal-fired ancient technique.",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
    colSpan: "md:col-span-1",
    height: "h-[300px]",
  },
  {
    name: "Handcrafted Naan",
    desc: "Leavened perfection.",
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop",
    colSpan: "md:col-span-2",
    height: "h-[400px]",
  },
];

export default function IngredientsSection() {
  return (
    <section className="py-32 bg-background-primary relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-bg via-secondary-bg/20 to-primary-bg opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-24">
            <div>
              <span className="text-accent-gold text-xs tracking-[0.3em] uppercase block mb-4">
                Our Foundation
              </span>
              <h2 className="font-serif text-5xl md:text-6xl text-text-primary">
                Origin &amp; Soil
              </h2>
            </div>
            <p className="text-accent-olive/60 font-serif italic text-lg mt-4 md:mt-0">
              &ldquo;Where every grain tells a story.&rdquo;
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ingredients.map((item, idx) => (
            <ScrollReveal key={idx} delay={idx * 100}>
              <div
                className={`relative group overflow-hidden ${item.colSpan} ${item.height}`}
              >
                <div className="absolute inset-0">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{
                      filter: "grayscale(20%) sepia(10%)",
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

                <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                  <h3 className="font-serif text-3xl text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {item.name}
                  </h3>
                  <div className="h-px bg-accent-gold w-0 group-hover:w-16 transition-all duration-500 delay-100 mb-2" />
                  <p className="text-white/80 font-sans text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    {item.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
