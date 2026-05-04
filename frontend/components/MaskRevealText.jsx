"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export default function MaskRevealText({ children, className = "" }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Set initial hidden state via GSAP (not CSS) so text is visible if JS fails
    gsap.set(textRef.current, { y: "110%", letterSpacing: "0.1em" });

    const matchMedia = gsap.matchMedia();

    matchMedia.add("(min-width: 300px)", () => {
      gsap.to(textRef.current, {
        y: "0%",
        letterSpacing: "normal",
        ease: "power4.out",
        duration: 1.2,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => matchMedia.revert();
  }, []);

  return (
    <div ref={containerRef} className={`mask-reveal-container ${className}`}>
      {/* 
        We use styling here to set the initial state so no flash of unstyled content happens.
        Globals CSS provides the 'mask-reveal-text' initial transform block.
      */}
      <span ref={textRef} className="mask-reveal-text tracking-widest block">
        {children}
      </span>
    </div>
  );
}
