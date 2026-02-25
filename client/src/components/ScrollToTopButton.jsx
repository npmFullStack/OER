import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTopButton = ({ showAfter = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Check initial scroll position
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-primary hover:bg-primaryDark text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 hover:scale-110 opacity-100 visible"
          aria-label="Scroll to top"
          style={{ opacity: 1, visibility: "visible" }}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;
