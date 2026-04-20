type SkeletonVariant = "text" | "card" | "avatar";

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  count?: number;
}

function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={["bg-[#E0E0E0] rounded animate-pulse", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function Skeleton({ variant = "text", className = "", count = 1 }: SkeletonProps) {
  if (variant === "avatar") {
    return <SkeletonPulse className={["w-12 h-12 rounded-full", className].join(" ")} />;
  }

  if (variant === "card") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-[16px] p-5 border border-[#E0E0E0]">
            <div className="flex items-center gap-4">
              <SkeletonPulse className="w-14 h-14 rounded-[12px]" />
              <div className="flex-1 flex flex-col gap-2">
                <SkeletonPulse className="h-4 w-3/4 rounded" />
                <SkeletonPulse className="h-3 w-1/2 rounded" />
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
        <SkeletonPulse
          key={i}
          className={["h-4 w-full rounded", className].join(" ")}
        />
      ))}
    </>
  );
}
