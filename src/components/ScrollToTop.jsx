import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Use window.scrollTo for browser scroll
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use instant for immediate effect
    });

    // Also try scrolling the document element directly
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // Fallback for older browsers
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
