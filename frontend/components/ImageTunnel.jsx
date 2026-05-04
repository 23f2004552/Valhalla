"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";

/*
 * CINEMATIC IMAGE STORYTELLING
 * ─────────────────────────────
 * Inspired by savor.it: a pinned viewport where full-screen images
 * cross-fade as backgrounds, each paired with narrative text.
 * The scroll drives the timeline — each "frame" tells part of the
 * Valhalla story, from raw ingredients to the final dining experience.
 */

const frames = [
  {
    image: "/images/frame_kitchen.jpg",
    label: "The Kitchen",
    title: "Command",
    subtitle: "every station",
    description: "Real-time order flow, live ticket tracking, zero missed calls",
  },
  {
    image: "/images/frame_plating.jpg",
    label: "The Craft",
    title: "Precision",
    subtitle: "on every plate",
    description: "From prep to pass — every dish timed, tracked, perfected",
  },
  {
    image: "/images/frame_dining.jpg",
    label: "The Experience",
    title: "Ambiance",
    subtitle: "curated to detail",
    description: "Table management, reservations, and guest preferences — all in one view",
  },
  {
    image: "/images/frame_service.jpg",
    label: "The Service",
    title: "Seamless",
    subtitle: "front to back",
    description: "Flows from table to kitchen and back without a whisper",
  },
  {
    image: "/images/frame_prep.jpg",
    label: "The Foundation",
    title: "Inventory",
    subtitle: "always in control",
    description: "Smart stock alerts, supplier tracking, waste reduction — automatically",
  },
];

export default function ImageTunnel() {
  const containerRef = useRef(null);
  const frameRefs = useRef([]);
  const textRefs = useRef([]);
  const counterRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const totalFrames = frames.length;

      // Pin the section for the entire scroll duration
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${totalFrames * 200}vh`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      frames.forEach((_, i) => {
        const frameEl = frameRefs.current[i];
        const textEl = textRefs.current[i];
        if (!frameEl || !textEl) return;

        const segmentStart = i / totalFrames;
        const segmentEnd = (i + 1) / totalFrames;
        const segmentDuration = segmentEnd - segmentStart;

        if (i === 0) {
          // First frame: visible immediately, fades out at end of its segment
          tl.set(frameEl, { opacity: 1, scale: 1 }, 0);
          tl.set(textEl, { opacity: 1, y: 0 }, 0);

          // Slow zoom in
          tl.to(frameEl, {
            scale: 1.08,
            duration: segmentDuration * 0.8,
            ease: "none",
          }, segmentStart);

          // Text exits upward
          tl.to(textEl, {
            opacity: 0, y: -40,
            duration: segmentDuration * 0.2,
            ease: "power2.in",
          }, segmentStart + segmentDuration * 0.7);

          // Image fades out
          tl.to(frameEl, {
            opacity: 0,
            duration: segmentDuration * 0.15,
            ease: "power2.in",
          }, segmentStart + segmentDuration * 0.85);

        } else {
          // Subsequent frames: fade in with text stagger

          // Image fades in with zoom
          tl.fromTo(frameEl,
            { opacity: 0, scale: 1.15 },
            { opacity: 1, scale: 1.05, duration: segmentDuration * 0.25, ease: "power2.out" },
            segmentStart
          );

          // Text enters from below
          tl.fromTo(textEl,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: segmentDuration * 0.2, ease: "power3.out" },
            segmentStart + segmentDuration * 0.15
          );

          // If not last frame, exit
          if (i < totalFrames - 1) {
            // Slow zoom continues
            tl.to(frameEl, {
              scale: 1.12,
              duration: segmentDuration * 0.5,
              ease: "none",
            }, segmentStart + segmentDuration * 0.3);

            // Text exits
            tl.to(textEl, {
              opacity: 0, y: -40,
              duration: segmentDuration * 0.2,
              ease: "power2.in",
            }, segmentStart + segmentDuration * 0.7);

            // Image fades
            tl.to(frameEl, {
              opacity: 0,
              duration: segmentDuration * 0.15,
              ease: "power2.in",
            }, segmentStart + segmentDuration * 0.85);
          } else {
            // Last frame: just zooms subtly, stays visible
            tl.to(frameEl, {
              scale: 1.08,
              duration: segmentDuration * 0.5,
              ease: "none",
            }, segmentStart + segmentDuration * 0.3);
          }
        }

        // Update counter
        if (counterRef.current) {
          tl.set(counterRef.current, {
            textContent: `${String(i + 1).padStart(2, "0")}`,
          }, segmentStart + segmentDuration * 0.15);
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      {/* ── BACKGROUND FRAMES ── */}
      {frames.map((frame, i) => (
        <div
          key={i}
          ref={(el) => (frameRefs.current[i] = el)}
          className="absolute inset-0 z-0"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          <Image
            src={frame.image}
            alt={frame.title}
            fill
            className="object-cover"
            priority={i === 0}
          />
          {/* Dark cinematic overlay — stronger at bottom for text */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20" />
        </div>
      ))}

      {/* ── TEXT LAYERS ── */}
      {frames.map((frame, i) => (
        <div
          key={`text-${i}`}
          ref={(el) => (textRefs.current[i] = el)}
          className="absolute inset-0 z-10 flex flex-col justify-end pb-28 pl-12 md:pl-20 lg:pl-28"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          {/* Label */}
          <p className="font-sans text-[#F8E47D]/70 text-[10px] md:text-[11px] tracking-[0.5em] uppercase mb-4">
            {frame.label}
          </p>

          {/* Main title */}
          <h2
            className="font-luxury text-[#FFF9EB] leading-[0.9] mb-2"
            style={{ fontSize: "clamp(3rem, 10vw, 10rem)" }}
          >
            {frame.title}
          </h2>

          {/* Italic subtitle */}
          <p
            className="font-luxury italic text-[#FFF9EB]/50 leading-none mb-6"
            style={{ fontSize: "clamp(1.5rem, 4vw, 4rem)" }}
          >
            {frame.subtitle}
          </p>

          {/* Description */}
          <p className="font-sans text-[#FFF9EB]/40 text-sm md:text-base max-w-md tracking-wide">
            {frame.description}
          </p>
        </div>
      ))}

      {/* ── FRAME COUNTER ── bottom-right cinematic counter */}
      <div className="absolute bottom-28 right-12 md:right-20 lg:right-28 z-20 flex items-end gap-2">
        <span
          ref={counterRef}
          className="font-sans text-[#FFF9EB]/30 text-6xl md:text-8xl font-light tabular-nums"
        >
          01
        </span>
        <span className="font-sans text-[#FFF9EB]/20 text-lg md:text-xl mb-2">
          / {String(frames.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── SCROLL INDICATOR (initial) ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-30">
        <div className="w-px h-8 bg-[#FFF9EB]/40 animate-pulse" />
        <span className="font-sans text-[#FFF9EB]/40 text-[10px] tracking-[0.3em] uppercase">
          Scroll
        </span>
      </div>
    </section>
  );
}
