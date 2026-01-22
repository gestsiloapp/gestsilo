import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, ...props }, ref) => {
    
    // Base: foco em geometria precisa e target de toque confortável (h-12)
    const baseStyles = "inline-flex items-center justify-center rounded-md text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silo-action disabled:pointer-events-none disabled:opacity-50 h-12 px-6 active:scale-[0.98]";

    const variants = {
      primary: "bg-silo-action text-white hover:bg-amber-700 shadow-md border border-transparent",
      outline: "border-2 border-silo-border bg-transparent hover:bg-gray-100 text-silo-text",
      ghost: "hover:bg-gray-100 text-silo-text",
      danger: "bg-silo-danger text-white hover:bg-red-800",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
