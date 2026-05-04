"use client";

import Image from "next/image";
import Link from "next/link";
import MaskRevealText from "./MaskRevealText";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">

      {/* — Background Image — full bleed cinematic shot */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero_bg.jpg"
          alt="Valhalla Suite"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Warm gradient overlay — bottom-heavy for text readability against the dark kitchen scene */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10" />
      </div>

      {/* — Content — pinned to bottom, left-heavy like savor.it */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end px-8 md:px-16 pb-[8vh]">

        {/* Main heading — large sentence-case serif, like savor's "Feel good fats from scratch" */}
        <h1 className="font-luxury text-[#FFF9EB] leading-[0.92] max-w-[85vw] md:max-w-[75vw]"
          style={{ fontSize: "clamp(3.5rem, 11vw, 12rem)" }}
        >
          <MaskRevealText className="block">Where fire</MaskRevealText>
          <MaskRevealText className="block">meets saffron</MaskRevealText>
        </h1>

        {/* Bottom row: descriptor + CTA pill — matches savor's layout exactly */}
        <div className="mt-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 max-w-5xl">
          
          {/* Left: small descriptor text */}
          <MaskRevealText>
            <p className="font-sans text-[#FFF9EB]/70 text-sm md:text-[15px] leading-relaxed tracking-wide max-w-md">
              Restaurant intelligence,<br/>
              crafted with precision
            </p>
          </MaskRevealText>

          {/* Right: Pill CTA — exactly like savor's "Watch — Episode" */}
          <MaskRevealText>
            <Link
              href="/admin"
              className="group inline-flex items-center gap-5 bg-[#FFF9EB] text-text-primary px-7 py-3.5 rounded-sm hover:bg-[#F8E47D] transition-colors duration-500"
            >
              <span className="font-sans text-[13px] tracking-wide">Enter</span>
              <span className="w-8 h-px bg-text-primary/40 group-hover:w-12 transition-all duration-500" />
              <span className="font-sans text-[13px] tracking-wide">workspace</span>
            </Link>
          </MaskRevealText>
        </div>
      </div>

    </section>
  );
}
