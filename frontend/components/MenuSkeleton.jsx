"use client";

const WIDTHS = [150, 200, 170, 220, 190, 240, 160, 210];
const DESC_WIDTHS = [200, 260, 230, 280, 210, 250, 220, 270];

export default function MenuSkeleton({ count = 6 }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="py-6 border-b border-accent-olive/10 flex flex-col md:flex-row md:items-baseline justify-between gap-2"
        >
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-2">
              {/* Name skeleton */}
              <div
                className="h-7 rounded"
                style={{
                  width: `${WIDTHS[i % WIDTHS.length]}px`,
                  background: "linear-gradient(90deg, #e5d6c6 25%, #f4efea 50%, #e5d6c6 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }}
              />
              {/* Dotted line placeholder */}
              <div className="flex-1 mx-6 h-px bg-accent-gold/10 hidden md:block" />
              {/* Price skeleton */}
              <div
                className="h-6 w-16 rounded"
                style={{
                  background: "linear-gradient(90deg, #e5d6c6 25%, #f4efea 50%, #e5d6c6 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                  animationDelay: `${i * 100}ms`,
                }}
              />
            </div>
            {/* Description skeleton */}
            <div
              className="h-4 rounded mt-2"
              style={{
                width: `${DESC_WIDTHS[i % DESC_WIDTHS.length]}px`,
                background: "linear-gradient(90deg, #e5d6c6 25%, #f4efea 50%, #e5d6c6 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
                animationDelay: `${i * 150}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
