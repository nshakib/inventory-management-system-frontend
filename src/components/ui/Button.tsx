import { forwardRef, type ButtonHTMLAttributes } from "react";
import { FaSpinner } from "react-icons/fa";

type Variant = "primary" | "danger" | "warning" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

// Single source of truth for button colors/spacing/radius so every
// button in the app (Login, Products, Categories, Suppliers, Users...)
// looks and behaves the same way.
const variantStyles: Record<Variant, string> = {
  primary:
    "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus-visible:ring-blue-400",
  danger:
    "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus-visible:ring-red-400",
  warning:
    "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white focus-visible:ring-amber-400",
  secondary:
    "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 focus-visible:ring-gray-400",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-600 focus-visible:ring-gray-400",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      isLoading = false,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
          transition-colors duration-150 cursor-pointer whitespace-nowrap
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-60
          ${variantStyles[variant]} ${className}`}
        {...rest}
      >
        {isLoading && <FaSpinner className="animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
