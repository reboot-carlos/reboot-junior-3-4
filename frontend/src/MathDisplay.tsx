import { useEffect, useRef } from "react";
import katex from "katex";

interface MathDisplayProps {
  formula: string;
  inline?: boolean;
  className?: string;
}

export function MathDisplay({
  formula,
  inline = false,
  className = "",
}: MathDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        const cleanFormula = formula
          .replace(/^\$\$/, "")
          .replace(/\$\$$/, "")
          .replace(/^\$/, "")
          .replace(/\$$/, "");

        containerRef.current.innerHTML = "";
        katex.render(cleanFormula, containerRef.current, {
          displayMode: !inline,
          throwOnError: false,
        });
      } catch (error) {
        console.error("KaTeX rendering error:", error);
        containerRef.current.textContent = formula;
      }
    }
  }, [formula, inline]);

  return (
    <div
      ref={containerRef}
      className={`math-display ${inline ? "inline" : "block"} ${className}`}
    />
  );
}
