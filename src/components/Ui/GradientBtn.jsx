import React from "react";
import { Link } from "react-router-dom";

const GradientButton = ({
  label = "See more",
  to,
  onClick,
  className = "",
}) => {
  const baseClasses = `
    group relative 
    h-14 sm:h-16 
    w-full sm:w-64 
    border rounded-lg overflow-hidden 
    flex items-center justify-center sm:justify-start 
    px-4 font-grotesk 
    text-sm sm:text-base font-bold 
    transition-all duration-500

    /* Light Theme */
    bg-bgLight text-textLight border-gray-300
    hover:text-primary hover:border-primary

    /* Dark Theme */
    dark:bg-bgDark dark:text-textDark dark:border-gray-700
    dark:hover:text-secondary dark:hover:border-secondary

    underline underline-offset-2 hover:underline hover:underline-offset-4

    /* Glow Effect */
    before:absolute before:w-12 before:h-12 before:content-[''] 
    before:right-1 before:top-1 before:z-10 
    before:bg-primary dark:before:bg-secondary
    before:rounded-full before:blur-lg before:duration-500

    after:absolute after:z-10 after:w-20 after:h-20 after:content-[''] 
    after:bg-accent dark:after:bg-secondary
    after:right-8 after:top-3 after:rounded-full after:blur-lg after:duration-500

    hover:before:right-12 hover:before:-bottom-8 hover:before:blur
    hover:after:-right-8

    ${className}
  `;

  const ButtonElement = (
    <button onClick={onClick} className={baseClasses}>
      {label}
    </button>
  );

  return to ? (
    <Link to={to} className="inline-block w-full sm:w-auto">
      {ButtonElement}
    </Link>
  ) : (
    ButtonElement
  );
};

export default GradientButton;
