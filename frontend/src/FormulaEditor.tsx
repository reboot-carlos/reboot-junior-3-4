import { useState } from "react";
import { MathDisplay } from "./MathDisplay";

interface FormulaEditorProps {
  onInsertFormula: (formula: string) => void;
}

export function FormulaEditor({ onInsertFormula }: FormulaEditorProps) {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});

  const templates = {
    sigma: {
      label: "Sigma (Σ)",
      params: ["bas", "haut", "expression"],
      generate: (p: Record<string, string>) =>
        `$$\\sum_{${p.bas}}^{${p.haut}} ${p.expression}$$`,
    },
    integral: {
      label: "Intégrale (∫)",
      params: ["bas", "haut", "expression", "dx"],
      generate: (p: Record<string, string>) =>
        `$$\\int_{${p.bas}}^{${p.haut}} ${p.expression} \\, ${p.dx}$$`,
    },
    fraction: {
      label: "Fraction",
      params: ["numerateur", "denominateur"],
      generate: (p: Record<string, string>) =>
        `$$\\frac{${p.numerateur}}{${p.denominateur}}$$`,
    },
    sqrt: {
      label: "Racine",
      params: ["indice", "expression"],
      generate: (p: Record<string, string>) =>
        p.indice
          ? `$$\\sqrt[${p.indice}]{${p.expression}}$$`
          : `$$\\sqrt{${p.expression}}$$`,
    },
    power: {
      label: "Exposant",
      params: ["base", "exposant"],
      generate: (p: Record<string, string>) =>
        `$$${p.base}^{${p.exposant}}$$`,
    },
    subscript: {
      label: "Indice",
      params: ["base", "indice"],
      generate: (p: Record<string, string>) =>
        `$$${p.base}_{${p.indice}}$$`,
    },
    matrix: {
      label: "Matrice 2×2",
      params: ["a11", "a12", "a21", "a22"],
      generate: (p: Record<string, string>) =>
        `$$\\begin{pmatrix} ${p.a11} & ${p.a12} \\\\ ${p.a21} & ${p.a22} \\end{pmatrix}$$`,
    },
    limit: {
      label: "Limite",
      params: ["variable", "vers", "expression"],
      generate: (p: Record<string, string>) =>
        `$$\\lim_{${p.variable} \\to ${p.vers}} ${p.expression}$$`,
    },
    derivative: {
      label: "Dérivée",
      params: ["fonction", "variable"],
      generate: (p: Record<string, string>) =>
        `$$\\frac{d${p.fonction}}{d${p.variable}}$$`,
    },
  };

  const allSpecialChars = [
    { char: "α", latex: "\\alpha" },
    { char: "β", latex: "\\beta" },
    { char: "γ", latex: "\\gamma" },
    { char: "δ", latex: "\\delta" },
    { char: "ε", latex: "\\epsilon" },
    { char: "ζ", latex: "\\zeta" },
    { char: "η", latex: "\\eta" },
    { char: "θ", latex: "\\theta" },
    { char: "ι", latex: "\\iota" },
    { char: "κ", latex: "\\kappa" },
    { char: "λ", latex: "\\lambda" },
    { char: "μ", latex: "\\mu" },
    { char: "ν", latex: "\\nu" },
    { char: "ξ", latex: "\\xi" },
    { char: "π", latex: "\\pi" },
    { char: "ρ", latex: "\\rho" },
    { char: "σ", latex: "\\sigma" },
    { char: "τ", latex: "\\tau" },
    { char: "υ", latex: "\\upsilon" },
    { char: "φ", latex: "\\phi" },
    { char: "χ", latex: "\\chi" },
    { char: "ψ", latex: "\\psi" },
    { char: "ω", latex: "\\omega" },
    { char: "Α", latex: "A" },
    { char: "Β", latex: "B" },
    { char: "Γ", latex: "\\Gamma" },
    { char: "Δ", latex: "\\Delta" },
    { char: "Ε", latex: "E" },
    { char: "Ζ", latex: "Z" },
    { char: "Η", latex: "H" },
    { char: "Θ", latex: "\\Theta" },
    { char: "Ι", latex: "I" },
    { char: "Κ", latex: "K" },
    { char: "Λ", latex: "\\Lambda" },
    { char: "Μ", latex: "M" },
    { char: "Ν", latex: "N" },
    { char: "Ξ", latex: "\\Xi" },
    { char: "Π", latex: "\\Pi" },
    { char: "Ρ", latex: "P" },
    { char: "Σ", latex: "\\Sigma" },
    { char: "Τ", latex: "T" },
    { char: "Υ", latex: "\\Upsilon" },
    { char: "Φ", latex: "\\Phi" },
    { char: "Χ", latex: "X" },
    { char: "Ψ", latex: "\\Psi" },
    { char: "Ω", latex: "\\Omega" },
    { char: "∑", latex: "\\sum" },
    { char: "∫", latex: "\\int" },
    { char: "∂", latex: "\\partial" },
    { char: "∇", latex: "\\nabla" },
    { char: "√", latex: "\\sqrt{}" },
    { char: "∞", latex: "\\infty" },
    { char: "≤", latex: "\\leq" },
    { char: "≥", latex: "\\geq" },
    { char: "≠", latex: "\\neq" },
    { char: "≈", latex: "\\approx" },
    { char: "±", latex: "\\pm" },
    { char: "∓", latex: "\\mp" },
    { char: "×", latex: "\\times" },
    { char: "÷", latex: "\\div" },
    { char: "∈", latex: "\\in" },
    { char: "∉", latex: "\\notin" },
    { char: "⊂", latex: "\\subset" },
    { char: "⊆", latex: "\\subseteq" },
    { char: "∪", latex: "\\cup" },
    { char: "∩", latex: "\\cap" },
    { char: "∀", latex: "\\forall" },
    { char: "∃", latex: "\\exists" },
    { char: "¬", latex: "\\neg" },
    { char: "∧", latex: "\\wedge" },
    { char: "∨", latex: "\\vee" },
    { char: "⟹", latex: "\\Rightarrow" },
    { char: "⟺", latex: "\\Leftrightarrow" },
    { char: "→", latex: "\\to" },
    { char: "←", latex: "\\leftarrow" },
    { char: "↑", latex: "\\uparrow" },
    { char: "↓", latex: "\\downarrow" },
    { char: "↔", latex: "\\leftrightarrow" },
    { char: "⊥", latex: "\\perp" },
    { char: "∥", latex: "\\parallel" },
    { char: "°", latex: "^\\circ" },
    { char: "′", latex: "'" },
    { char: "″", latex: "''" },
    { char: "‴", latex: "'''" },
  ];

  const [charPage, setCharPage] = useState(0);
  const charsPerPage = 30; // 10 colonnes × 3 lignes
  const totalPages = Math.ceil(allSpecialChars.length / charsPerPage);
  const specialChars = allSpecialChars.slice(
    charPage * charsPerPage,
    (charPage + 1) * charsPerPage
  );

  const handleTemplateSelect = (key: string) => {
    setActiveTemplate(key);
    setParams({});
    const template = templates[key as keyof typeof templates];
    template.params.forEach((param) => {
      setParams((p) => ({ ...p, [param]: "" }));
    });
  };

  const handleParamChange = (param: string, value: string) => {
    setParams((p) => ({ ...p, [param]: value }));
  };

  const generateFormula = () => {
    if (!activeTemplate) return;
    const template = templates[activeTemplate as keyof typeof templates];
    const formula = template.generate(params);
    onInsertFormula(formula);
    setActiveTemplate(null);
    setParams({});
  };

  const insertChar = (char: string) => {
    onInsertFormula(`$${char}$`);
  };

  const insertCharIntoParam = (param: string, char: string) => {
    setParams((p) => ({ ...p, [param]: (p[param] || "") + char }));
  };

  return (
    <div className="bg-white border-t border-gray-300 p-4">
      {/* Onglets */}
      <div className="flex gap-2 mb-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTemplate(null)}
          className={`px-4 py-2 text-sm font-bold ${
            activeTemplate === null
              ? "border-b-2 border-black text-black"
              : "text-gray-600"
          }`}
        >
          Caractères spéciaux
        </button>
        <button
          onClick={() => setActiveTemplate("templates")}
          className={`px-4 py-2 text-sm font-bold ${
            activeTemplate === "templates"
              ? "border-b-2 border-black text-black"
              : "text-gray-600"
          }`}
        >
          Templates d'équations
        </button>
      </div>

      {/* Caractères spéciaux */}
      {activeTemplate === null && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">
              Cliquez sur un caractère ({charPage + 1}/{totalPages})
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCharPage((p) => Math.max(0, p - 1))}
                disabled={charPage === 0}
                className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-xs disabled:opacity-50"
              >
                ◀
              </button>
              <button
                onClick={() => setCharPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={charPage === totalPages - 1}
                className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-xs disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {specialChars.map((item) => (
              <button
                key={item.latex}
                onClick={() => insertChar(item.char)}
                className="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold transition"
                title={item.latex}
              >
                {item.char}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates d'équations */}
      {activeTemplate === "templates" && (
        <div>
          <p className="text-xs text-gray-600 mb-3">
            Sélectionnez un template et remplissez les paramètres
          </p>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleTemplateSelect(key)}
                className="p-2 bg-black text-white rounded hover:bg-gray-800 text-xs font-bold transition"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire de paramètres */}
      {activeTemplate && activeTemplate !== "templates" && (
        <div className="bg-gray-100 p-3 rounded">
          <h3 className="font-bold text-sm mb-3">
            {templates[activeTemplate as keyof typeof templates].label}
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {templates[activeTemplate as keyof typeof templates].params.map(
              (param) => (
                <div key={param}>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {param}
                  </label>
                  <input
                    type="text"
                    value={params[param] || ""}
                    onChange={(e) =>
                      handleParamChange(param, e.target.value)
                    }
                    placeholder={`Ex: ${param}`}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs mb-1"
                  />
                  {/* Mini-palette de caractères pour ce champ */}
                  <div className="grid grid-cols-6 gap-0.5">
                    {specialChars.slice(0, 6).map((item) => (
                      <button
                        key={item.latex}
                        onClick={() => insertCharIntoParam(param, item.char)}
                        className="p-0.5 bg-gray-300 hover:bg-gray-400 rounded text-xs font-bold transition"
                        type="button"
                      >
                        {item.char}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Aperçu LaTeX rendu */}
          <div className="bg-white p-4 rounded border border-gray-300 mb-3 flex items-center justify-center min-h-16">
            <p className="text-xs text-gray-600 absolute top-2 left-3">Aperçu :</p>
            <MathDisplay
              formula={templates[
                activeTemplate as keyof typeof templates
              ].generate(params)}
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-2">
            <button
              onClick={generateFormula}
              className="flex-1 bg-black text-white px-3 py-2 rounded font-bold text-sm hover:bg-gray-800 transition"
            >
              Insérer dans le chat
            </button>
            <button
              onClick={() => setActiveTemplate(null)}
              className="px-3 py-2 bg-gray-300 rounded font-bold text-sm hover:bg-gray-400 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
