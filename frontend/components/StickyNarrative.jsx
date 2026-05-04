"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";

export default function StickyNarrative() {
  const containerRef = useRef(null);
  const bgRef = useRef(null);

  // Refs for each layer's elements (label + heading + subtitle)
  const l1 = useRef(null);
  const l1Label = useRef(null);
  const l1Head = useRef(null);
  const l1Sub = useRef(null);
  const l1Line = useRef(null);

  const l2 = useRef(null);
  const l2Label = useRef(null);
  const l2Head = useRef(null);
  const l2Sub = useRef(null);
  const l2Line = useRef(null);

  const l3 = useRef(null);
  const l3Label = useRef(null);
  const l3Head = useRef(null);
  const l3Sub = useRef(null);
  const l3Line = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      // Background slow zoom + slight darken
      tl.to(bgRef.current, { scale: 1.15, ease: "none", duration: 1 }, 0);

      // ═══════════════════════════════════════════════════
      // LAYER 1: "The Promise" — visible at start, exits by 28%
      // ═══════════════════════════════════════════════════

      // Staggered entrance (instant — already visible on load)
      tl.set(l1.current, { opacity: 1 });
      tl.fromTo(l1Line.current,
        { scaleX: 0 }, { scaleX: 1, duration: 0.08, ease: "power2.out" }, 0
      );
      tl.fromTo(l1Label.current,
        { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.02
      );
      tl.fromTo(l1Head.current,
        { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08, ease: "power3.out" }, 0.04
      );
      tl.fromTo(l1Sub.current,
        { opacity: 0, y: 20 }, { opacity: 0.5, y: 0, duration: 0.08, ease: "power2.out" }, 0.07
      );

      // Exit: blur-fade upward
      tl.to(l1Sub.current, { opacity: 0, y: -30, duration: 0.06, ease: "power2.in" }, 0.22);
      tl.to(l1Head.current, { opacity: 0, y: -50, duration: 0.06, ease: "power2.in" }, 0.23);
      tl.to(l1Label.current, { opacity: 0, y: -20, duration: 0.04 }, 0.25);
      tl.to(l1Line.current, { scaleX: 0, duration: 0.04 }, 0.26);
      tl.set(l1.current, { opacity: 0 }, 0.30);

      // ═══════════════════════════════════════════════════
      // LAYER 2: "The System" — enters at 34%, exits by 62%
      // ═══════════════════════════════════════════════════

      // Staggered entrance from below
      tl.set(l2.current, { opacity: 1 }, 0.33);
      tl.fromTo(l2Line.current,
        { scaleX: 0 }, { scaleX: 1, duration: 0.08, ease: "power2.out" }, 0.34
      );
      tl.fromTo(l2Label.current,
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.35
      );
      tl.fromTo(l2Head.current,
        { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.10, ease: "power3.out" }, 0.36
      );
      tl.fromTo(l2Sub.current,
        { opacity: 0, y: 25 }, { opacity: 0.5, y: 0, duration: 0.08, ease: "power2.out" }, 0.40
      );

      // Exit: blur-fade upward
      tl.to(l2Sub.current, { opacity: 0, y: -30, duration: 0.06, ease: "power2.in" }, 0.56);
      tl.to(l2Head.current, { opacity: 0, y: -50, duration: 0.06, ease: "power2.in" }, 0.57);
      tl.to(l2Label.current, { opacity: 0, y: -20, duration: 0.04 }, 0.59);
      tl.to(l2Line.current, { scaleX: 0, duration: 0.04 }, 0.60);
      tl.set(l2.current, { opacity: 0 }, 0.64);

      // ═══════════════════════════════════════════════════
      // LAYER 3: "The Result" — enters at 68%, stays
      // ═══════════════════════════════════════════════════

      tl.set(l3.current, { opacity: 1 }, 0.67);
      tl.fromTo(l3Line.current,
        { scaleX: 0 }, { scaleX: 1, duration: 0.10, ease: "power2.out" }, 0.68
      );
      tl.fromTo(l3Label.current,
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.70
      );
      tl.fromTo(l3Head.current,
        { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.12, ease: "power3.out" }, 0.72
      );
      tl.fromTo(l3Sub.current,
        { opacity: 0, y: 25 }, { opacity: 0.5, y: 0, duration: 0.10, ease: "power2.out" }, 0.78
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  /* ── Text layer template ── */
  const Layer = ({ layerRef, labelRef, headRef, subRef, lineRef, label, head, sub, startVisible }) => (
    <div ref={layerRef}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center"
      style={{ opacity: startVisible ? 1 : 0 }}
    >
      {/* Decorative line */}
      <div ref={lineRef}
        className="w-16 h-px bg-[#F8E47D]/40 mb-6 origin-center"
        style={{ transform: startVisible ? "scaleX(1)" : "scaleX(0)" }}
      />

      {/* Category label */}
      <p ref={labelRef}
        className="font-sans text-[#F8E47D]/60 text-[11px] tracking-[0.5em] uppercase mb-8"
        style={{ opacity: startVisible ? 1 : 0 }}
      >
        {label}
      </p>

      {/* Main heading */}
      <h2 ref={headRef}
        className="font-luxury text-[#FFF9EB] leading-[0.95]"
        style={{
          fontSize: "clamp(2.8rem, 8vw, 8rem)",
          opacity: startVisible ? 1 : 0
        }}
      >
        {head}
      </h2>

      {/* Italic subtitle */}
      <h3 ref={subRef}
        className="font-luxury text-[#FFF9EB]/50 italic leading-[0.95] mt-2"
        style={{
          fontSize: "clamp(2.2rem, 6.5vw, 6.5rem)",
          opacity: 0
        }}
      >
        {sub}
      </h3>
    </div>
  );

  return (
    <section ref={containerRef} className="relative w-full h-[350vh] bg-text-primary">

      {/* Sticky Viewport Lock */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">

        {/* Background Texture */}
        <div ref={bgRef} className="absolute inset-0 z-0 origin-center">
          <Image
            src="/images/wood_bg.png"
            alt="Deep texture background"
            fill
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-text-primary/60" />
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 z-1 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(55,8,8,0.8) 100%)"
          }}
        />

        {/* Text Layers */}
        <Layer layerRef={l1} labelRef={l1Label} headRef={l1Head} subRef={l1Sub} lineRef={l1Line}
          label="The promise" head="Unrivaled" sub="operational power" startVisible={true}
        />
        <Layer layerRef={l2} labelRef={l2Label} headRef={l2Head} subRef={l2Sub} lineRef={l2Line}
          label="The system" head="Command" sub="without compromise" startVisible={false}
        />
        <Layer layerRef={l3} labelRef={l3Label} headRef={l3Head} subRef={l3Sub} lineRef={l3Line}
          label="The result" head="Precision" sub="at every table" startVisible={false}
        />

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-40 z-20 bg-linear-to-t from-text-primary to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
