"use client";

import ScrollReveal from "./ScrollReveal";

export default function VisualBreak() {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=2070&auto=format&fit=crop')",
          filter: "brightness(0.4) sepia(0.2)"
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <ScrollReveal>
          <p className="font-serif text-3xl md:text-5xl text-white/90 leading-tight italic">
            &ldquo;Savor the silence between bites.<br />
            Let the spice tell its story.&rdquo;
          </p>
          <div className="mt-8 h-px w-24 bg-accent-gold mx-auto" />
        </ScrollReveal>
      </div>
    </section>
  );
}
