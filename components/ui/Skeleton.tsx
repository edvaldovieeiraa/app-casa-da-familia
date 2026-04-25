type SkeletonVariant = "text" | "card" | "avatar";

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  count?: number;
}

function SkeletonShimmer({ className = "" }: { className?: string }) {
  return (
    <div className={["skeleton-shimmer", className].filter(Boolean).join(" ")} />
  );
}

export function Skeleton({ variant = "text", className = "", count = 1 }: SkeletonProps) {
  if (variant === "avatar") {
    return <SkeletonShimmer className={["w-12 h-12 rounded-full", className].join(" ")} />;
  }

  if (variant === "card") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div className="flex items-center gap-4">
              <SkeletonShimmer className="w-14 h-14 rounded-[16px]" />
              <div className="flex-1 flex flex-col gap-2.5">
                <SkeletonShimmer className="h-4 w-3/4" />
                <SkeletonShimmer className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonShimmer key={i} className={["h-4 w-full", className].join(" ")} />
      ))}
    </>
  );
}
