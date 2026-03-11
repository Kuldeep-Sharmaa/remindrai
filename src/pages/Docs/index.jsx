import React, { useState, useRef, useEffect } from "react";
import { SEARCH_INDEX } from "./docsConfig";
import DocsHome from "./components/DocsHome";
import SectionView from "./components/SectionView";

export default function Docs() {
  const [active, setActive] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setResults(
      SEARCH_INDEX.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.intro.toLowerCase().includes(q) ||
          r.label.toLowerCase().includes(q),
      ).slice(0, 7),
    );
    setShowResults(true);
  }, [query]);

  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowResults(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const navigate = (id) => {
    window.scrollTo(0, 0);
    setActive(id);
    setShowResults(false);
    setQuery("");
  };

  const goHome = () => {
    window.scrollTo(0, 0);
    setActive(null);
    setShowResults(false);
    setQuery("");
  };

  const searchProps = {
    query,
    setQuery,
    setShowResults,
    searchRef,
    results,
    showResults,
  };

  if (!active) {
    return <DocsHome onNavigate={navigate} {...searchProps} />;
  }

  return (
    <SectionView
      active={active}
      onNavigate={navigate}
      onHome={goHome}
      {...searchProps}
    />
  );
}
