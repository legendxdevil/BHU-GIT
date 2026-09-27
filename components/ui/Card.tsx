import React from "react";
import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "accent" | "outline";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  hoverable = false,
  className,
  ...props
}) => {
  const baseStyles = "rounded-card transition-all duration-200 border";

  const variants = {
    default: "bg-paper border-mist shadow-card text-ink",
    subtle: "bg-fog border-mist text-ink",
    accent: "bg-blush-light border-blush/40 text-sienna",
    outline: "bg-transparent border-mist-dark text-ink",
  };

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={clsx(
        baseStyles,
        variants[variant],
        paddings[padding],
        hoverable && "hover:shadow-editorial hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
