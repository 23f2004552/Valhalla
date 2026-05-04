"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-background-primary overflow-hidden">

      {/* Top section: links + CTA */}
      <div className="relative z-10 pt-24 pb-16 px-8 md:px-16">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">

          {/* Left: footer nav stack — like savor's footer nav */}
          <div className="flex flex-col gap-3 font-sans text-[14px] text-text-primary/60">
            {["Menu"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="hover:text-text-primary transition-colors duration-300 w-fit"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Right: CTA button — like savor's "Join — now" */}
          <Link
            href="/admin"
            className="group inline-flex items-center gap-5 bg-text-primary text-[#FFF9EB] px-8 py-4 rounded-sm hover:bg-[#1a0404] transition-colors duration-500"
          >
            <span className="font-sans text-[13px] tracking-wide">Enter</span>
            <span className="w-8 h-px bg-[#FFF9EB]/40 group-hover:w-12 transition-all duration-500" />
            <span className="font-sans text-[13px] tracking-wide">studio</span>
          </Link>
        </div>
      </div>

      {/* The MASSIVE wordmark — like savor's giant "savor" filling the footer */}
      <div className="relative px-4 md:px-8 pb-4 overflow-hidden">
        <h1
          className="font-luxury text-text-primary leading-none select-none whitespace-nowrap"
          style={{ fontSize: "clamp(8rem, 25vw, 28rem)" }}
        >
          valhalla
        </h1>
      </div>

      {/* Bottom strip — like savor's "Press Kit · Terms of Service · Privacy Policy · hello@savor.it · ©Savor 2026" */}
      <div className="px-8 md:px-16 py-4 border-t border-text-primary/10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 font-sans text-[11px] text-text-primary/40">
            <a href="#" className="hover:text-text-primary/70 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-text-primary/70 transition-colors">Privacy Policy</a>
          </div>
          <p className="font-sans text-[11px] text-text-primary/40">
            hello@valhalla.suite
          </p>
          <p className="font-sans text-[11px] text-text-primary/40">
            ©Valhalla 2026.
          </p>
        </div>
      </div>
    </footer>
  );
}
