import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  to,
  icon,
  iconPosition = "right",
  showArrow = false,
  className = "",
  ...props
}) {
  const base = `
    relative inline-flex items-center justify-center gap-2
    font-grotesk font-medium tracking-tight
    transition-all duration-200 ease-out
    select-none whitespace-nowrap
    disabled:opacity-30 disabled:pointer-events-none
    group
  `;

  const sizes = {
    sm: "text-xs px-3.5 py-2 rounded-lg",
    md: "text-sm px-5 py-2.5 rounded-lg",
    lg: "text-base px-6 py-3 rounded-xl",
    icon: "p-2 rounded-lg",
  };

  const variants = {
    primary: `
      border border-black/15 dark:border-white/15
      text-textLight dark:text-textDark
      hover:border-black/30 dark:hover:border-white/30
      hover:text-textLight dark:hover:text-white
      bg-transparent
    `,
    ghost: `
      border-none
      text-textLight/40 dark:text-white/30
      hover:text-textLight/80 dark:hover:text-white/70
      bg-transparent px-0
    `,
    icon: `
      border border-black/10 dark:border-white/10
      text-textLight/40 dark:text-white/30
      hover:border-black/20 dark:hover:border-white/20
      hover:text-textLight/70 dark:hover:text-white/60
      bg-transparent
    `,
  };

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  const isIconOnly = variant === "icon";

  const content = (
    <>
      {isIconOnly ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          <span className="leading-none">{children}</span>
          {icon && iconPosition === "right" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {showArrow && (
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
          )}
        </>
      )}
    </>
  );

  if (to)
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  if (href)
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
