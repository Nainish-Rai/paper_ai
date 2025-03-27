import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div
      className={cn(
        "animate-spin rounded-full border-b-2 border-gray-900 dark:border-white",
        className ?? "h-8 w-8"
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}
