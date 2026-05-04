"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export default function AnimatedSVGPath({ 
  className = "",
  pathD = "M0 0 Q 50 150 100 0", // default curve
  strokeColor = "rgba(255, 249, 235, 0.5)", // Cream
  strokeWidth = 1
}) {
  const pathRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const length = pathRef.current.getTotalLength();
    
    // Setup initial state: dashed line, completely hidden (offset = length)
    gsap.set(pathRef.current, {
      strokeDasharray: `${length} ${length}`,
      strokeDashoffset: length,
    });

    const matchMedia = gsap.matchMedia();

    matchMedia.add("(min-width: 768px)", () => {
      // Draw the line as the user scrolls
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%", // Start drawing when curve enters bottom half
          end: "top 30%",   // Finish drawing near the middle
          scrub: 1,         // Tie directly to scroll bar with 1s smoothing
        }
      });
    });

    return () => matchMedia.revert();
  }, []);

  return (
    <div ref={containerRef} className={`absolute pointer-events-none ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          // Add a secondary dash pattern on top of the animation mask
          // To get the exact "dashed" look from Savor, we use CSS variables inside GSAP 
          // or just standard styling if we want a solid drawing line.
          // Savor uses a dashed path that reveals itself.
          style={{ vectorEffect: "non-scaling-stroke" }}
        />
      </svg>
    </div>
  );
}
