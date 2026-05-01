import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
};

export function LoadingSpinner({
  className,
  size = "md",
  label = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
      data-ocid="loading_state"
      aria-busy="true"
      aria-label={label}
    >
      <span
        className={cn(
          "block rounded-full border-primary/30 border-t-primary animate-spin",
          sizeClasses[size],
        )}
        aria-hidden="true"
      />
      {size === "lg" && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
}
