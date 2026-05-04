"use client";

import ScrollReveal from "./ScrollReveal";

export default function Philosophy() {
  return (
    <section className="py-24 md:py-32 bg-background-secondary px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="font-serif text-4xl md:text-6xl text-text-primary leading-tight mb-8">
            &ldquo;We craft moments, not just meals. A symphony of earth, fire, and time.&rdquo;
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="font-sans text-sm md:text-base text-white/60 max-w-lg leading-relaxed tracking-wide">
            <p className="mb-6">
              Valhalla Suite exists at the intersection of wild nature and refined culinary art.
              Our ingredients are sourced from the soil, our techniques are forged in fire,
              and our atmosphere is designed to transport you.
            </p>
            <p>
              Every dish tells a story of its origin. Every pour is a tribute to the craft.
              Welcome to our table.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
