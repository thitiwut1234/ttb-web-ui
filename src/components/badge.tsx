import React, { forwardRef } from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

export type BadgeAppearance = "soft" | "solid" | "outline";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeShape = "rounded" | "pill";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color variant of the badge */
  variant?: BadgeVariant;
  /** Visual appearance style: soft (tinted), solid (filled), outline (bordered) */
  appearance?: BadgeAppearance;
  /** Size of the badge */
  size?: BadgeSize;
  /** Shape border radius: rounded (box) or pill (circular capsule) */
  shape?: BadgeShape;
  /** Shows a status dot indicator before the content */
  dot?: boolean;
  /** If true when dot is enabled, animates the dot with a pulse/ping effect */
  dotPing?: boolean;
  /** Optional icon or element to display before the label */
  leftIcon?: React.ReactNode;
  /** Optional icon or element to display after the label */
  rightIcon?: React.ReactNode;
  /** If provided, renders an interactive remove (X) button */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessible label for the remove button */
  removeAriaLabel?: string;
  /** Children content */
  children?: React.ReactNode;
}

// Styling maps for combinations of variant and appearance
const variantStyles: Record<BadgeVariant, Record<BadgeAppearance, string>> = {
  default: {
    soft: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60",
    solid: "bg-blue-600 text-white border-transparent shadow-xs dark:bg-blue-600 dark:text-white",
    outline: "bg-transparent text-blue-700 border-blue-300 dark:text-blue-400 dark:border-blue-700",
  },
  primary: {
    soft: "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60",
    solid: "bg-indigo-600 text-white border-transparent shadow-xs dark:bg-indigo-600 dark:text-white",
    outline: "bg-transparent text-indigo-700 border-indigo-300 dark:text-indigo-400 dark:border-indigo-700",
  },
  secondary: {
    soft: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/70 dark:text-zinc-300 dark:border-zinc-700/60",
    solid: "bg-zinc-800 text-zinc-100 border-transparent shadow-xs dark:bg-zinc-200 dark:text-zinc-900",
    outline: "bg-transparent text-zinc-700 border-zinc-300 dark:text-zinc-300 dark:border-zinc-700",
  },
  success: {
    soft: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60",
    solid: "bg-emerald-600 text-white border-transparent shadow-xs dark:bg-emerald-600 dark:text-white",
    outline: "bg-transparent text-emerald-700 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700",
  },
  warning: {
    soft: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60",
    solid: "bg-amber-500 text-white border-transparent shadow-xs dark:bg-amber-600 dark:text-white",
    outline: "bg-transparent text-amber-800 border-amber-300 dark:text-amber-400 dark:border-amber-700",
  },
  danger: {
    soft: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60",
    solid: "bg-rose-600 text-white border-transparent shadow-xs dark:bg-rose-600 dark:text-white",
    outline: "bg-transparent text-rose-700 border-rose-300 dark:text-rose-400 dark:border-rose-700",
  },
  info: {
    soft: "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60",
    solid: "bg-sky-600 text-white border-transparent shadow-xs dark:bg-sky-600 dark:text-white",
    outline: "bg-transparent text-sky-700 border-sky-300 dark:text-sky-400 dark:border-sky-700",
  },
  purple: {
    soft: "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60",
    solid: "bg-purple-600 text-white border-transparent shadow-xs dark:bg-purple-600 dark:text-white",
    outline: "bg-transparent text-purple-700 border-purple-300 dark:text-purple-400 dark:border-purple-700",
  },
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-blue-500 dark:bg-blue-400",
  primary: "bg-indigo-500 dark:bg-indigo-400",
  secondary: "bg-zinc-500 dark:bg-zinc-400",
  success: "bg-emerald-500 dark:bg-emerald-400",
  warning: "bg-amber-500 dark:bg-amber-400",
  danger: "bg-rose-500 dark:bg-rose-400",
  info: "bg-sky-500 dark:bg-sky-400",
  purple: "bg-purple-500 dark:bg-purple-400",
};

const sizeStyles: Record<BadgeSize, { badge: string; dot: string; icon: string }> = {
  sm: {
    badge: "text-[11px] font-medium px-2 py-0.5 gap-1",
    dot: "w-1.5 h-1.5",
    icon: "[&>svg]:w-3 [&>svg]:h-3",
  },
  md: {
    badge: "text-xs font-medium px-2.5 py-1 gap-1.5",
    dot: "w-2 h-2",
    icon: "[&>svg]:w-3.5 [&>svg]:h-3.5",
  },
  lg: {
    badge: "text-sm font-medium px-3 py-1.5 gap-2",
    dot: "w-2.5 h-2.5",
    icon: "[&>svg]:w-4 [&>svg]:h-4",
  },
};

const shapeStyles: Record<BadgeShape, string> = {
  rounded: "rounded-md",
  pill: "rounded-full",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      appearance = "soft",
      size = "md",
      shape = "pill",
      dot = false,
      dotPing = false,
      leftIcon,
      rightIcon,
      onRemove,
      removeAriaLabel = "Remove badge",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const selectedVariantStyle =
      variantStyles[variant]?.[appearance] || variantStyles.default.soft;
    const selectedSizeStyle = sizeStyles[size] || sizeStyles.md;
    const selectedShapeStyle = shapeStyles[shape] || shapeStyles.pill;
    const dotColor = dotColors[variant] || dotColors.default;

    return (
      <span
        ref={ref}
        className={`inline-flex items-center justify-center font-medium border leading-none transition-colors select-none ${selectedVariantStyle} ${selectedSizeStyle.badge} ${selectedShapeStyle} ${className}`}
        {...props}
      >
        {/* Optional Status Dot */}
        {dot && (
          <span className="relative flex items-center justify-center">
            {dotPing && (
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotColor}`}
              />
            )}
            <span
              className={`relative inline-flex rounded-full ${selectedSizeStyle.dot} ${
                appearance === "solid" ? "bg-white dark:bg-zinc-100" : dotColor
              }`}
            />
          </span>
        )}

        {/* Left Icon */}
        {leftIcon && (
          <span className={`inline-flex items-center shrink-0 ${selectedSizeStyle.icon}`}>
            {leftIcon}
          </span>
        )}

        {/* Main Content */}
        {children && <span>{children}</span>}

        {/* Right Icon */}
        {rightIcon && (
          <span className={`inline-flex items-center shrink-0 ${selectedSizeStyle.icon}`}>
            {rightIcon}
          </span>
        )}

        {/* Optional Remove Button */}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={removeAriaLabel}
            className="inline-flex items-center justify-center -mr-1 ml-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-current"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
