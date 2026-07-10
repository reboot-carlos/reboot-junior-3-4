import { useState } from "react";
import { MathDisplay } from "./MathDisplay";

interface FormulaEditorProps {
  onInsertFormula: (formula: string) => void;
}

export function FormulaEditor({ onInsertFormula }: FormulaEditorProps) {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});
  const [paramWithTemplateMenu, setParamWithTemplateMenu] = useState<string | null>(null);

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
    <div className="bg-gradient-to-r from-blue-700 via-purple-700 to-purple-800 border-t border-purple-600 p-4">
      {/* Onglets */}
      <div className="flex gap-2 mb-4 border-b border-purple-600">
        <button
          onClick={() => setActiveTemplate(null)}
          className={`px-4 py-2 text-sm font-bold ${
            activeTemplate === null
              ? "border-b-2 border-white text-white"
              : "text-gray-200"
          }`}
        >
          Caractères spéciaux
        </button>
        <button
          onClick={() => setActiveTemplate("templates")}
          className={`px-4 py-2 text-sm font-bold ${
            activeTemplate === "templates"
              ? "border-b-2 border-white text-white"
              : "text-gray-200"
          }`}
        >
          Templates d'équations
        </button>
      </div>

      {/* Caractères spéciaux */}
      {activeTemplate === null && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white">
              Cliquez sur un caractère ({charPage + 1}/{totalPages})
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCharPage((p) => Math.max(0, p - 1))}
                disabled={charPage === 0}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs disabled:opacity-50 text-white font-bold"
              >
                ◀
              </button>
              <button
                onClick={() => setCharPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={charPage === totalPages - 1}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs disabled:opacity-50 text-white font-bold"
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
                className="w-full p-2 bg-blue-600 hover:bg-blue-500 rounded text-lg font-bold transition text-white"
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
          <p className="text-xs text-white mb-3">
            Sélectionnez un template et remplissez les paramètres
          </p>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleTemplateSelect(key)}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-500 hover:to-purple-500 text-xs font-bold transition"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire de paramètres */}
      {activeTemplate && activeTemplate !== "templates" && (
        <div className="bg-blue-800 bg-opacity-40 p-3 rounded">
          <h3 className="font-bold text-sm mb-3 text-white">
            {templates[activeTemplate as keyof typeof templates].label}
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {templates[activeTemplate as keyof typeof templates].params.map(
              (param) => (
                <div key={param}>
                  <label className="text-xs font-bold text-white block mb-1">
                    {param}
                  </label>
                  <input
                    type="text"
                    value={params[param] || ""}
                    onChange={(e) =>
                      handleParamChange(param, e.target.value)
                    }
                    placeholder={`Ex: ${param}`}
                    className="w-full px-2 py-1 border border-blue-400 rounded text-xs mb-1 bg-blue-900 bg-opacity-50 text-white"
                  />
                  {/* Mini-palette de caractères + bouton templates */}
                  <div className="flex gap-1 mb-1">
                    <button
                      onClick={() => setParamWithTemplateMenu(paramWithTemplateMenu === param ? null : param)}
                      className="flex-1 p-1 bg-purple-600 hover:bg-purple-500 rounded text-xs font-bold transition text-white"
                      type="button"
                      title="Insérer un template"
                    >
                      📐
                    </button>
                    <div className="grid grid-cols-5 gap-0.5 flex-1">
                      {specialChars.slice(0, 5).map((item) => (
                        <button
                          key={item.latex}
                          onClick={() => insertCharIntoParam(param, item.char)}
                          className="p-0.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition text-white"
                          type="button"
                        >
                          {item.char}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Menu de sélection de templates pour ce champ */}
                  {paramWithTemplateMenu === param && (
                    <div className="grid grid-cols-2 gap-1 mb-1 bg-blue-900 bg-opacity-50 p-2 rounded border border-blue-500">
                      {Object.entries(templates).map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() => {
                            insertCharIntoParam(param, template.generate({}));
                            setParamWithTemplateMenu(null);
                          }}
                          className="p-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded text-xs font-bold transition text-white"
                          type="button"
                        >
                          {template.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Aperçu LaTeX rendu */}
          <div className="bg-blue-900 bg-opacity-30 p-4 rounded border border-blue-500 mb-3 flex items-center justify-center min-h-16">
            <p className="text-xs text-white absolute top-2 left-3">Aperçu :</p>
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
              className="flex-1 bg-gradient-to-r from-green-500 to-cyan-600 text-white px-3 py-2 rounded font-bold text-sm hover:from-green-400 hover:to-cyan-500 transition"
            >
              Insérer dans le chat
            </button>
            <button
              onClick={() => setActiveTemplate(null)}
              className="px-3 py-2 bg-red-600 rounded font-bold text-sm hover:bg-red-500 transition text-white"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
