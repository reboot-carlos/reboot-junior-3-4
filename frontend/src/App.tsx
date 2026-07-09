import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { FormulaEditor } from "./FormulaEditor";

interface Theme {
  name: string;
  description: string;
  subcategories: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConversationHistory {
  id: string;
  theme: string | string[];
  subcategory: string | string[];
  level: string;
  timestamp: number;
  messageCount: number;
  messages: Message[];
}

function App() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [isMultiThemeMode, setIsMultiThemeMode] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<Array<{ theme: string; subcategory: string }>>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState<string>("lycéen");
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [city, setCity] = useState<string>("Paris");
  const [formulaPositions, setFormulaPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [showFormulaEditor, setShowFormulaEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const levels = ["collégien", "lycéen", "étudiant", "professionnel"];

  // Couleur bleu-violet pour tous les thèmes
  const themeColors: Record<string, string> = {
    "Maths": "from-blue-500 to-purple-600",
    "Physique": "from-blue-500 to-purple-600",
    "Chimie": "from-blue-500 to-purple-600",
    "Technologie": "from-blue-500 to-purple-600",
    "Littérature": "from-blue-500 to-purple-600",
    "Vocabulaire": "from-blue-500 to-purple-600",
    "Economie": "from-blue-500 to-purple-600",
    "Philosophie": "from-blue-500 to-purple-600",
    "Sciences du vivant et de la Terre": "from-blue-500 to-purple-600",
    "Comment marche l'IA": "from-blue-500 to-purple-600",
    "Arts": "from-blue-500 to-purple-600",
    "Grammaire": "from-blue-500 to-purple-600",
    "Langues": "from-blue-500 to-purple-600",
  };

  // Charger les thèmes et la localisation au démarrage
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch("/api/themes");
        const data = await res.json();
        setThemes(data.themes);
      } catch (error) {
        console.error("Erreur lors du chargement des thèmes:", error);
      }
    };

    const detectCity = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.city) {
            setCity(data.city);
          }
        }
      } catch (error) {
        // Garder la valeur par défaut "Paris"
        console.debug("Géolocalisation non disponible");
      }
    };

    fetchThemes();
    detectCity();
  }, []);

  // Charger l'historique depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("conversationHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sauvegarder l'historique quand une conversation change
  useEffect(() => {
    if (messages.length > 0 && (selectedTheme || isMultiThemeMode)) {
      const themeKey = isMultiThemeMode
        ? selectedThemes.map(t => `${t.theme}-${t.subcategory}`).join("+")
        : `${selectedTheme}-${selectedSubcategory}`;

      const newEntry: ConversationHistory = {
        id: `${themeKey}-${Date.now()}`,
        theme: isMultiThemeMode ? selectedThemes.map(t => t.theme) : selectedTheme,
        subcategory: isMultiThemeMode ? selectedThemes.map(t => t.subcategory) : selectedSubcategory,
        level: level,
        timestamp: Date.now(),
        messageCount: messages.length,
        messages: messages,
      };

      let updated: ConversationHistory[];
      const existingIndex = history.findIndex((h) => h.id.startsWith(themeKey));
      if (existingIndex >= 0) {
        updated = [...history];
        updated[existingIndex] = newEntry;
      } else {
        updated = [newEntry, ...history];
      }

      setHistory(updated);
      localStorage.setItem("conversationHistory", JSON.stringify(updated));
    }
  }, [messages, selectedTheme, selectedSubcategory, isMultiThemeMode, selectedThemes]);

  // Écouter les touches sur la page d'accueil
  useEffect(() => {
    const handleKeyPress = () => {
      if (!selectedTheme && themes.length > 0) {
        setSelectedTheme(themes[0].name);
        if (themes[0].subcategories.length > 0) {
          setSelectedSubcategory(themes[0].subcategories[0]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedTheme, themes]);


  const handleDeleteHistoryEntry = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("conversationHistory", JSON.stringify(updated));
  };

  const handleLoadConversation = (entry: ConversationHistory) => {
    setLevel(entry.level);
    setMessages(entry.messages);
    setShowHistory(false);

    // Déterminer si c'était une conversation multi-thèmes ou simple
    if (Array.isArray(entry.theme)) {
      // Mode multi-thèmes
      setIsMultiThemeMode(true);
      const themes = entry.theme as string[];
      const subcats = entry.subcategory as string[];
      setSelectedThemes(
        themes.map((t, i) => ({
          theme: t,
          subcategory: subcats[i] || "",
        }))
      );
      // Réinitialiser les sélections simples
      setSelectedTheme(null);
      setSelectedSubcategory(null);
    } else {
      // Mode simple
      setIsMultiThemeMode(false);
      setSelectedTheme(entry.theme as string);
      setSelectedSubcategory(entry.subcategory as string);
      setSelectedThemes([]);
    }
  };

  const handleFormulaHover = (id: string, event: React.MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const offsetX = (event.clientX - centerX) * -0.5;
    const offsetY = (event.clientY - centerY) * -0.5;

    setFormulaPositions((prev) => ({
      ...prev,
      [id]: { x: offsetX, y: offsetY },
    }));
  };

  const handleFormulaLeave = (id: string) => {
    setFormulaPositions((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0 },
    }));
  };

  const handleInsertFormula = (formula: string) => {
    setInputValue((prev) => prev + " " + formula + " ");
    setShowFormulaEditor(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (isMultiThemeMode && selectedThemes.length === 0) return;
    if (!isMultiThemeMode && (!selectedTheme || !selectedSubcategory)) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: isMultiThemeMode ? selectedThemes.map(t => t.theme) : selectedTheme,
          subcategory: isMultiThemeMode ? selectedThemes.map(t => t.subcategory) : selectedSubcategory,
          level: level,
          city: city,
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error("Erreur lors de l'appel au chat:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Erreur lors de la communication. Veuillez réessayer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 flex flex-col overflow-hidden">
      {!selectedTheme && (
        /* Page d'accueil fullscreen */
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden z-40">
          {/* Formules flottantes */}
          <div className="absolute inset-0">
            {[
              { id: "formula1", text: "∫ f(x)dx", left: "10%", top: "15%", size: "4xl", animClass: "float-formula" },
              { id: "formula2", text: "E=mc²", left: "80%", top: "20%", size: "3xl", animClass: "float-formula-2" },
              { id: "formula3", text: "∑ aₙ", left: "20%", top: "70%", size: "3xl", animClass: "float-formula-3" },
              { id: "formula4", text: "∇·F=0", left: "75%", top: "75%", size: "4xl", animClass: "float-formula-4" },
              { id: "formula5", text: "π ≈ 3.14159", left: "50%", top: "10%", size: "2xl", animClass: "float-formula-5" },
              { id: "formula6", text: "α + β = γ", left: "15%", top: "40%", size: "2xl", animClass: "float-formula" },
              { id: "formula7", text: "🧬", left: "85%", top: "50%", size: "5xl", animClass: "float-formula-3" },
              { id: "formula8", text: "√2 ≈ 1.414", left: "60%", top: "60%", size: "2xl", animClass: "float-formula-4" },
            ].map((formula) => (
              <div
                key={formula.id}
                onMouseMove={(e) => handleFormulaHover(formula.id, e)}
                onMouseLeave={() => handleFormulaLeave(formula.id)}
                style={{
                  position: "absolute",
                  left: formula.left,
                  top: formula.top,
                  transform: `translate(${formulaPositions[formula.id]?.x || 0}px, ${formulaPositions[formula.id]?.y || 0}px)`,
                }}
                className={`floating-formula ${formula.animClass} text-white opacity-70 hover:opacity-100 cursor-grab active:cursor-grabbing transition-all duration-300 select-none`}
              >
                <span className={`text-${formula.size} font-light`}>{formula.text}</span>
              </div>
            ))}
          </div>

          {/* Contenu central */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center px-6">
              <h1 className="text-7xl md:text-8xl font-bold mb-6 text-white tracking-tight drop-shadow-lg">
                AI Lesson
              </h1>
              <p className="text-2xl md:text-3xl text-blue-200 mb-12 font-light">
                Apprendre avec un tuteur IA expert
              </p>
              <button
                onClick={() => {
                  if (themes.length > 0) {
                    setSelectedTheme(themes[0].name);
                    if (themes[0].subcategories.length > 0) {
                      setSelectedSubcategory(themes[0].subcategories[0]);
                    }
                  }
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                ✨ Commencer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête avec niveau (visible seulement quand on est en chat) */}
      {selectedTheme && (
      <div className="bg-gradient-to-r from-purple-900 to-purple-950 border-b border-purple-800 px-8 py-6 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">AI Lesson</h1>
            <p className="text-sm text-purple-200 mt-1">Tuteur IA Expert</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
              title="Historique des conversations"
            >
              📚 Historique {history.length > 0 && `(${history.length})`}
            </button>
            <div className="flex items-center gap-2 border border-purple-700 rounded-lg px-3 py-2 text-white">
              <span className="text-base">📍</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ville"
                className="bg-transparent text-sm text-white placeholder-purple-300 focus:outline-none w-20"
              />
            </div>
            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setMessages([]);
              }}
              className="px-4 py-2 border border-purple-600 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all"
            >
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      )}


      {/* Contenu principal */}
      <div className="flex flex-1 gap-4 p-4 bg-gradient-to-br from-purple-950 to-slate-950 overflow-hidden">
        {/* Sidebar - Navigation */}
        {selectedTheme && (
        <div className="w-72 bg-gray-900 text-white rounded-xl p-6 flex-shrink-0 sidebar-enter shadow-lg overflow-y-auto" style={{height: "calc(100vh - 160px)"}}>
          {/* Bouton Croiser les thèmes */}
          <button
            onClick={() => {
              setIsMultiThemeMode(!isMultiThemeMode);
              if (isMultiThemeMode) {
                setSelectedThemes([]);
                setMessages([]);
              }
            }}
            className={`w-full px-4 py-2 mb-4 rounded-lg text-sm font-bold transition-all ${
              isMultiThemeMode
                ? "bg-gradient-to-r from-green-500 to-cyan-600 text-white shadow-lg"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {isMultiThemeMode ? "✓ Mode Croisé" : "+ Croiser les thèmes"}
          </button>

          {/* Accordions Thèmes / Mode Croisé */}
          <div className="space-y-2">
            {themes.map((theme) => {
              const isThemeSelected = isMultiThemeMode
                ? selectedThemes.some(t => t.theme === theme.name)
                : selectedTheme === theme.name;

              return (
                <div key={theme.name}>
                  {isMultiThemeMode ? (
                    // Mode multi-thèmes : checkboxes
                    <div>
                      <label className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-all cursor-pointer bg-gray-800 hover:bg-gray-700 font-medium">
                        <input
                          type="checkbox"
                          checked={isThemeSelected}
                          onChange={() => {
                            if (isThemeSelected) {
                              setSelectedThemes(selectedThemes.filter(t => t.theme !== theme.name));
                            } else {
                              const firstSub = theme.subcategories.length > 0 ? theme.subcategories[0] : "";
                              setSelectedThemes([...selectedThemes, { theme: theme.name, subcategory: firstSub }]);
                            }
                            setMessages([]);
                          }}
                          className="rounded"
                        />
                        <span className="flex-1">{theme.name}</span>
                        {isThemeSelected && selectedThemes.find(t => t.theme === theme.name) && (
                          <span className="text-xs text-blue-200 truncate">
                            ({selectedThemes.find(t => t.theme === theme.name)?.subcategory})
                          </span>
                        )}
                      </label>

                      {/* Sous-thèmes en mode croisé */}
                      {isThemeSelected && theme.subcategories.length > 0 && (
                        <div className="pl-6 mt-2 space-y-1">
                          {theme.subcategories.map((sub) => {
                            const selectedThemeSub = selectedThemes.find(t => t.theme === theme.name);
                            const isSubSelected = selectedThemeSub?.subcategory === sub;

                            return (
                              <button
                                key={sub}
                                onClick={() => {
                                  setSelectedThemes(selectedThemes.map(t =>
                                    t.theme === theme.name ? { ...t, subcategory: sub } : t
                                  ));
                                  setMessages([]);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all font-medium ${
                                  isSubSelected
                                    ? "bg-gradient-to-r from-green-500 to-cyan-600 text-white"
                                    : "bg-gray-700 hover:bg-gray-600 text-white"
                                }`}
                              >
                                {sub}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Mode simple : sélection unique
                    <>
                      <button
                        onClick={() => {
                          setExpandedTheme(
                            expandedTheme === theme.name ? null : theme.name
                          );
                          setSelectedTheme(theme.name);
                          setSelectedSubcategory(
                            theme.subcategories.length > 0
                              ? theme.subcategories[0]
                              : null
                          );
                          setMessages([]);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center justify-between font-medium bg-gradient-to-r text-white ${
                          selectedTheme === theme.name
                            ? `${themeColors[theme.name] || "from-blue-500 to-purple-600"} shadow-md translate-x-2`
                            : `${themeColors[theme.name] || "from-blue-500 to-purple-600"} opacity-75 hover:opacity-100`
                        }`}
                      >
                        <span>{theme.name}</span>
                        {theme.subcategories.length > 0 && (
                          <span className="text-xs">
                            {expandedTheme === theme.name ? "▼" : "▶"}
                          </span>
                        )}
                      </button>

                      {/* Sous-thèmes (Accordion) */}
                      {expandedTheme === theme.name &&
                        theme.subcategories.length > 0 && (
                          <div className="pl-4 mt-2 space-y-1 bg-gray-800 rounded-lg p-3">
                            {theme.subcategories.map((sub) => (
                              <button
                                key={sub}
                                onClick={() => {
                                  setSelectedSubcategory(sub);
                                  setMessages([]);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all font-medium bg-gradient-to-r from-blue-400 to-purple-500 text-white ${
                                  selectedSubcategory === sub
                                    ? "translate-x-2 shadow-md"
                                    : "opacity-75 hover:opacity-100"
                                }`}
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        )}
                    </>
                  )}
                </div>
              );
            })}
          </div>


          {/* Réinitialiser la conversation */}
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="w-full px-3 py-2 mt-4 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold transition"
            >
              Nouvelle conversation
            </button>
          )}
        </div>
        )}

        {/* Zone principale - Chat */}
      <div className={`flex-1 flex flex-col relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 rounded-xl overflow-hidden shadow-lg ${selectedTheme ? 'chat-area-enter' : ''}`}>
        {/* En-tête */}
        {selectedTheme || isMultiThemeMode ? (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-8 rounded-t-xl border-b border-purple-500">
            {isMultiThemeMode && selectedThemes.length > 0 ? (
              <>
                <h1 className="text-3xl font-bold tracking-tight">
                  {selectedThemes.map(t => t.theme).join(" + ")}
                </h1>
                <p className="text-blue-100 text-sm mt-2">
                  {selectedThemes.map(t => t.subcategory).filter(Boolean).join(" • ")}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight">{selectedTheme}</h1>
                {selectedSubcategory && (
                  <p className="text-blue-100 text-sm mt-2">{selectedSubcategory}</p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-16 rounded-t-xl">
            <h1 className="text-4xl font-bold tracking-tight">AILesson</h1>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-white relative">
          {/* Formules en fond de la zone de discussion */}
          {selectedTheme && (
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
              <div className="absolute top-10 left-10 text-3xl font-light text-blue-400 whitespace-nowrap">
                ∫∫∫ f(x,y,z) dxdydz
              </div>
              <div className="absolute top-1/4 right-20 text-2xl font-light text-purple-400 whitespace-nowrap">
                ∑ₙ₌₁^∞ aₙ cos(nθ)
              </div>
              <div className="absolute bottom-32 left-20 text-2xl font-light text-blue-400 whitespace-nowrap">
                ∫ₐᵇ f(x)g'(x)dx
              </div>
              <div className="absolute bottom-20 right-32 text-3xl font-light text-purple-400 whitespace-nowrap">
                e^(iπ) + 1 = 0
              </div>
            </div>
          )}
          <div className="relative z-10">
          {!selectedTheme ? (
            <div className="flex items-center justify-center h-full text-center px-6">
              <div className="max-w-2xl">
                <h2 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 tracking-tight">AILesson</h2>
                <p className="text-2xl md:text-3xl font-light mb-8 text-gray-700">Commencez à travailler avec AILesson</p>
                <p className="text-lg text-gray-600 mb-12">
                  Choisissez un sujet et apprenez avec un tuteur IA expert en temps réel
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <span>💡</span>
                  <span className="text-sm">Appuyez sur n'importe quelle touche pour commencer</span>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg font-light mb-2">Bienvenue !</p>
                <p className="text-sm">
                  Posez une question pour commencer votre cours.
                </p>
              </div>
            </div>
          ) : null}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl px-6 py-4 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl rounded-tr-lg shadow-lg"
                    : "bg-gray-100 text-gray-900 rounded-2xl rounded-tl-lg border border-purple-300 border-opacity-50 shadow-md"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                ) : (
                  <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-h1:my-3 prose-h2:my-2 prose-h3:my-1 prose-ul:my-2 prose-ol:my-2">
                    <Markdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.content}
                    </Markdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-300 px-6 py-4 rounded-lg rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bouton palette d'équation */}
        <div className="p-4 border-t border-purple-500 border-opacity-50 bg-gradient-to-r from-slate-900 to-purple-900">
          <button
            onClick={() => setShowFormulaEditor(!showFormulaEditor)}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition text-sm"
          >
            {showFormulaEditor ? "✕ Fermer palette d'équation" : "📐 Palette d'équation"}
          </button>
        </div>

        {/* Éditeur de formules */}
        {showFormulaEditor && (
          <FormulaEditor onInsertFormula={handleInsertFormula} />
        )}

        {/* Input */}
        <div className="bg-gradient-to-r from-slate-900 to-purple-900 border-t border-purple-500 border-opacity-30 rounded-b-xl p-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleSendMessage();
                  }
                }}
                placeholder="Posez votre question..."
                disabled={loading || (!selectedSubcategory && !isMultiThemeMode)}
                className="flex-1 border border-purple-500 border-opacity-50 rounded-lg px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition bg-gray-800"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim() || (!selectedSubcategory && !isMultiThemeMode)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition text-lg"
                title="Envoyer (Entrée)"
              >
                →
              </button>
            </div>
        </div>
        </div>
      </div>

      {/* Historique Panel */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex history-panel-enter">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white w-96 max-w-full h-full overflow-y-auto p-8 shadow-2xl rounded-r-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-white">Historique</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-2xl font-bold text-white hover:opacity-70 transition"
              >
                ✕
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-gray-300 text-center py-8">Aucune conversation sauvegardée</p>
            ) : (
              <div className="space-y-3">
                {history.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-gradient-to-r from-slate-800 to-purple-800 hover:from-slate-700 hover:to-purple-700 rounded-lg transition history-item-enter border border-purple-500 border-opacity-50 hover:border-opacity-100"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        onClick={() => handleLoadConversation(entry)}
                        className="flex-1 cursor-pointer"
                      >
                        <h3 className="font-bold text-sm text-white">
                          {Array.isArray(entry.theme) ? entry.theme.join(" + ") : entry.theme}
                        </h3>
                        <p className="text-xs text-gray-200">
                          {Array.isArray(entry.subcategory) ? entry.subcategory.join(" • ") : entry.subcategory}
                        </p>
                        <div className="flex justify-between mt-2 text-xs text-gray-300">
                          <span>{entry.level}</span>
                          <span>{entry.messageCount} messages</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistoryEntry(entry.id);
                        }}
                        className="ml-2 text-red-400 hover:text-red-300 transition font-bold"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
