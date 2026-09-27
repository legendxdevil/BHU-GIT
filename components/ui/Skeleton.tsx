import React from "react";
import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "circle";
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = "text" }) => {
  const baseStyle = "animate-pulse bg-mist-dark/60";

  const variants = {
    text: "h-4 rounded-md w-full",
    card: "h-36 rounded-card w-full",
    circle: "h-10 w-10 rounded-full",
  };

  return <div className={clsx(baseStyle, variants[variant], className)} />;
};
