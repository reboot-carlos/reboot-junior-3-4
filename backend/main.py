"""

Chatbot Tuteur — Le cerveau du projet.

Ce backend gère :
- Les thèmes (Maths, Physique, etc.) et leurs sous-catégories
- Les conversations avec Claude (tuteur expert qui donne des cours clairs, vérife les sources)
"""

from __future__ import annotations

import os
import httpx

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic

app = FastAPI(title="Chatbot Tuteur — Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser le client Anthropic
client = Anthropic()

# Formes de formules disponibles par sous-catégorie
FORMULA_FORMS = {
    "Algèbre": [
        "Forme développée",
        "Forme factorisée",
        "Forme canonique",
    ],
    "Analyse": [
        "Forme explicite",
        "Forme implicite",
        "Forme paramétrique",
    ],
    "Probabilités": [
        "Notation ensembliste",
        "Notation probabiliste",
        "Notation combinatoire",
    ],
    "Statistiques": [
        "Formule simple",
        "Formule avec symboles (Σ, Π)",
        "Formule matricielle",
    ],
    "Géométrie": [
        "Forme cartésienne",
        "Forme vectorielle",
        "Forme paramétrique",
    ],
    "Mécanique classique": [
        "Forme newtonienne",
        "Forme lagrangienne",
        "Forme hamiltonienne",
    ],
    "Relativité générale": [
        "Notation tensorielle",
        "Notation classique",
        "Forme covariante",
    ],
    "Mécanique quantique": [
        "Notation de Dirac (bra-ket)",
        "Notation d'onde",
        "Notation matricielle",
    ],
    "Thermodynamique": [
        "Forme intensive",
        "Forme extensive",
        "Forme massique",
    ],
    "Électromagnétisme": [
        "Forme intégrale",
        "Forme différentielle",
        "Forme complexe",
    ],
    "Atomes et molécules": [
        "Formule brute",
        "Formule développée",
        "Formule semi-développée",
    ],
    "Réactions chimiques": [
        "Équation chimique équilibrée",
        "Équation ionique complète",
        "Équation ionique nette",
    ],
    "Chimie biologique": [
        "Formule chimique",
        "Structure développée",
        "Notation biochimique",
    ],
}

# Structure des thèmes et sous-catégories
THEMES = {
    "Maths": {
        "subcategories": [
            "Algèbre",
            "Analyse",
            "Probabilités",
            "Statistiques",
            "Géométrie",
            "Combinatoire",
            "Topologie",
            "Mathématiciens",
        ],
        "description": "Les mathématiques : nombre, forme, structure et espace.",
    },
    "Physique": {
        "subcategories": [
            "Mécanique classique",
            "Relativité générale",
            "Mécanique quantique",
            "Thermodynamique",
            "Électromagnétisme",
            "Physiciens",
        ],
        "description": "Physique : étude du mouvement, de l'énergie et des forces.",
    },
    "Chimie": {
        "subcategories": [
            "Atomes et molécules",
            "Réactions chimiques",
            "Liaisons chimiques",
            "Tableau périodique",
            "Chimie biologique",
            "Chimistes",
        ],
        "description": "Chimie : transformation de la matière et réactions.",
    },
    "Technologie": {
        "subcategories": [
            "Informatique",
            "Électronique",
            "Énergie renouvelable",
            "Matériaux",
            "Télécommunications",
            "Robotique",
        ],
        "description": "Technologie : application pratique du savoir scientifique.",
    },
    "Littérature": {
        "subcategories": [
            "Genres littéraires",
            "Auteurs célèbres",
            "Analyse de texte",
            "Poésie",
            "Narration",
            "Stylistique",
        ],
        "description": "Littérature : art de l'écriture et de la narration.",
    },
    "Vocabulaire": {
        "subcategories": [
            "Étymologie",
            "Synonymes et antonymes",
            "Expressions idiomatiques",
            "Nuances de sens",
            "Néologismes",
            "Contexte et registres",
        ],
        "description": "Vocabulaire : enrichissement du lexique.",
    },
    "Economie": {
        "subcategories": [
            "Microéconomie",
            "Macroéconomie",
            "Finance et banque",
            "Commerce et échange",
            "Développement économique",
            "Économistes",
        ],
        "description": "Économie : étude des ressources et échanges.",
    },
    "Philosophie": {
        "subcategories": [
            "Métaphysique",
            "Éthique",
            "Épistémologie",
            "Logique",
            "Esthétique",
            "Philosophes",
        ],
        "description": "Philosophie : réflexion sur les grandes questions.",
    },
    "Sciences du vivant et de la Terre": {
        "subcategories": [
            "Biologie cellulaire",
            "Évolution et génétique",
            "Écologie",
            "Géologie",
            "Écosystèmes",
            "Biologistes et géologues",
        ],
        "description": "Biologie, géologie et écologie.",
    },
    "Comment marche l'IA": {
        "subcategories": [
            "Machine Learning",
            "Réseaux de neurones",
            "Traitement du langage naturel",
            "Vision par ordinateur",
            "Algorithmes",
            "Chercheurs en IA",
        ],
        "description": "Comprendre les bases de l'intelligence artificielle.",
    },
}


# Modèles Pydantic pour les requêtes
class ChatRequest(BaseModel):
    theme: str
    subcategory: str
    formula_form: str | None = None
    level: str = "lycéen"
    messages: list[dict[str, str]]
    city: str | None = None


class ThemeResponse(BaseModel):
    theme: str
    description: str
    subcategories: list[str]


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/api/themes")
async def get_themes() -> dict:
    """Retourne la liste de tous les thèmes avec leurs sous-catégories."""
    themes_list = [
        {
            "name": theme,
            "description": info["description"],
            "subcategories": info["subcategories"],
        }
        for theme, info in THEMES.items()
    ]
    return {"themes": themes_list}


@app.get("/api/themes/{theme}/subcategories")
async def get_subcategories(theme: str) -> dict:
    """Retourne les sous-catégories d'un thème donné."""
    if theme not in THEMES:
        raise HTTPException(status_code=404, detail=f"Thème '{theme}' non trouvé")
    return {"subcategories": THEMES[theme]["subcategories"]}


@app.get("/api/formula-forms/{subcategory}")
async def get_formula_forms(subcategory: str) -> dict:
    """Retourne les formes de formules disponibles pour une sous-catégorie."""
    if subcategory in FORMULA_FORMS:
        return {"formula_forms": FORMULA_FORMS[subcategory]}
    return {"formula_forms": []}


@app.get("/api/weather")
async def get_weather(city: str = "Paris") -> dict:
    """Récupère les données météo pour une ville via open-meteo API (gratuit, sans clé)."""
    try:
        async with httpx.AsyncClient() as client:
            # Étape 1: Récupérer les coordonnées de la ville via Geocoding API
            geocoding_response = await client.get(
                "https://geocoding-api.open-meteo.com/v1/search",
                params={
                    "name": city,
                    "count": 1,
                    "language": "fr",
                    "format": "json"
                },
                timeout=5.0
            )

            if geocoding_response.status_code != 200 or not geocoding_response.json().get("results"):
                return {"weather": None, "error": f"Ville '{city}' non trouvée"}

            location = geocoding_response.json()["results"][0]
            latitude = location["latitude"]
            longitude = location["longitude"]
            city_name = location.get("name", city)
            country = location.get("country", "")

            # Étape 2: Récupérer les données météo actuelles
            weather_response = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
                    "timezone": "auto"
                },
                timeout=5.0
            )

            if weather_response.status_code != 200:
                return {"weather": None, "error": "Erreur lors de la récupération des données météo"}

            data = weather_response.json()
            current = data.get("current", {})

            # Mapper les codes météo open-meteo aux descriptions
            weather_codes = {
                0: "Ciel dégagé",
                1: "Peu nuageux",
                2: "Partiellement nuageux",
                3: "Très nuageux",
                45: "Brouillard",
                48: "Brouillard givrant",
                51: "Légère bruine",
                53: "Bruine modérée",
                55: "Bruine intense",
                61: "Pluie légère",
                63: "Pluie modérée",
                65: "Pluie intense",
                71: "Neige légère",
                73: "Neige modérée",
                75: "Neige intense",
                77: "Grains de neige",
                80: "Averses légères",
                81: "Averses modérées",
                82: "Averses violentes",
                85: "Averses de neige légères",
                86: "Averses de neige fortes",
                95: "Orage",
                96: "Orage avec grêle légère",
                99: "Orage avec grêle",
            }

            weather_code = current.get("weather_code", 0)
            description = weather_codes.get(weather_code, "Conditions inconnues")

            return {
                "weather": {
                    "city": f"{city_name}, {country}",
                    "temperature": current.get("temperature_2m"),
                    "description": description,
                    "humidity": current.get("relative_humidity_2m"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "precipitation": current.get("precipitation"),
                }
            }
    except Exception as e:
        return {"weather": None, "error": str(e)}


def detect_style(text: str) -> str:
    """Détecte si le style d'écriture est formel ou informel."""
    text_lower = text.lower()

    # Indicateurs informels
    informal_indicators = [
        r'\bc\s', r'\bça\b', r'\bt[\'u]', r'\by[\'a]', r'\byo\b',
        r'[?!]{2,}', r'\b[a-z]+\d+\b',  # acronymes
        r'\b(lol|omg|wtf|cool|coucou|hey|salut)\b',
        r'[😀-🙏]',  # emojis
        r'\b(fais|dis|donne)(-moi|-nous)\b',  # requêtes directes
    ]

    # Indicateurs formels
    formal_indicators = [
        r'(pourriez|auriez|pourrait)-vous',
        r'(s[\'i]|il vous plaît)',
        r'\b(explique|analyse|développe)\b',
        r'\b(académique|théorique|scientifique)\b',
        r'\b(d[\'u]n|de la|du)\s+point\s+de\s+vue\b',
        r'(ponctuation|grammaire|syntaxe)',
    ]

    import re
    informal_count = sum(1 for pattern in informal_indicators if re.search(pattern, text_lower))
    formal_count = sum(1 for pattern in formal_indicators if re.search(pattern, text_lower))

    # Si la longueur du texte est très courte et sans ponctuation formelle
    if len(text) < 20 and not any(c in text for c in '.,:;'):
        return "informel"

    return "formel" if formal_count >= informal_count else "informel"


@app.post("/api/chat")
async def chat(request: ChatRequest) -> dict:
    """
    Traite une question du utilisateur et retourne la réponse du tuteur.
    Le tuteur adapte son style au style d'écriture de l'utilisateur.
    """

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Clé API Anthropic non configurée",
        )

    if request.theme not in THEMES:
        raise HTTPException(status_code=404, detail=f"Thème '{request.theme}' non trouvé")

    # Détecter le style d'écriture du dernier message utilisateur
    last_user_message = next(
        (msg["content"] for msg in reversed(request.messages) if msg["role"] == "user"),
        ""
    )
    style = detect_style(last_user_message)

    # Adapter le style du tuteur selon le style d'écriture
    if style == "informel":
        style_instruction = """
**Ton conversationnel et accessible** : parle comme à un ami, sois direct et amical.
- Utilise des contractions naturelles
- Saute les formules complexes au profit de l'intuition
- Ajoute des emojis si pertinent
- Sois court et percutant"""
    else:
        style_instruction = """
**Ton professionnel et académique** : sois précis et structuré.
- Utilise un vocabulaire soigné
- Structure clairement avec titres et sous-titres
- Cite les concepts formels
- Fournisse des explications détaillées mais accessibles"""

    # Adapter la profondeur selon le niveau
    level_instruction = ""
    if request.level == "collégien":
        level_instruction = """
**Niveau collégien** : explique avec des concepts très simples, des analogies du quotidien, évite le jargon.
- Utilise des exemples concrets et visuels
- Décompose en étapes très courtes
- Vérifie la compréhension souvent"""
    elif request.level == "lycéen":
        level_instruction = """
**Niveau lycéen** : équilibre entre accessibilité et rigueur mathématique/scientifique.
- Introduis progressivement les formalismes
- Fournisse contexte et intuition avant les formules
- Incluez les détails techniques importants"""
    elif request.level == "étudiant":
        level_instruction = """
**Niveau étudiant** : approche rigoureuse et formelle.
- Utilise le vocabulaire académique
- Inclus preuves et justifications
- Accepte une certaine complexité conceptuelle"""
    elif request.level == "professionnel":
        level_instruction = """
**Niveau professionnel** : approche appliquée et critique.
- Focus sur applications pratiques
- Inclus limites, hypothèses et cas d'usage réels
- Assume une base solide"""

    # Récupérer les données météo si disponibles (open-meteo API)
    weather_info = ""
    if request.city:
        try:
            async with httpx.AsyncClient() as client_http:
                # Récupérer les coordonnées
                geo_response = await client_http.get(
                    "https://geocoding-api.open-meteo.com/v1/search",
                    params={"name": request.city, "count": 1, "format": "json"},
                    timeout=3.0
                )

                if geo_response.status_code == 200:
                    results = geo_response.json().get("results")
                    if results:
                        loc = results[0]
                        # Récupérer la météo
                        weather_response = await client_http.get(
                            "https://api.open-meteo.com/v1/forecast",
                            params={
                                "latitude": loc["latitude"],
                                "longitude": loc["longitude"],
                                "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
                                "timezone": "auto"
                            },
                            timeout=3.0
                        )

                        if weather_response.status_code == 200:
                            data = weather_response.json()
                            current = data.get("current", {})

                            # Mapper les codes météo
                            descriptions = {
                                0: "Ciel dégagé", 1: "Peu nuageux", 2: "Partiellement nuageux",
                                3: "Très nuageux", 45: "Brouillard", 61: "Pluie légère",
                                63: "Pluie modérée", 65: "Pluie intense", 71: "Neige légère",
                                95: "Orage"
                            }
                            desc = descriptions.get(current.get("weather_code", 0), "Conditions variables")

                            weather_info = f"""
**Contexte météo** ({request.city}) :
- Température : {current.get('temperature_2m')}°C
- Conditions : {desc}
- Humidité : {current.get('relative_humidity_2m')}%
- Vent : {current.get('wind_speed_10m')} km/h"""
        except Exception:
            pass  # Ignorer les erreurs météo, ne pas bloquer le chat

    # Construire le contexte du tuteur
    formula_instruction = ""
    if request.formula_form:
        formula_instruction = f"\n**Forme de formule préférée** : utilise la notation '{request.formula_form}' quand tu montres des formules mathématiques."

    system_prompt = f"""Tu es un tuteur expert et passionné en {request.theme}.
Contexte : {THEMES[request.theme]['description']}
{f'Sous-thème : {request.subcategory}' if request.subcategory else ''}{formula_instruction}{weather_info}

{level_instruction}

{style_instruction}

Tes règles d'enseignement (toujours) :
1. **Clarté** : explique simplement, sans jargon inutile
2. **Analogies** : utilise des comparaisons avec le quotidien
3. **Progression** : décompose en étapes logiques
4. **Sources** : cite tes sources pour les faits importants
5. **Comparaison** : si plusieurs perspectives existent, compare-les
6. **Engagement** : pose des questions pour vérifier la compréhension
7. **Formules** : utilise les formules en LaTeX avec $$ pour le bloc ou $ pour l'inline. JAMAIS en ASCII art.

Format : réponds en français."""

    try:
        # Utiliser la conversation API d'Anthropic
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=system_prompt,
            messages=request.messages,
        )

        assistant_message = response.content[0].text

        return {
            "role": "assistant",
            "content": assistant_message,
            "detected_style": style,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la communication avec Claude : {str(e)}",
        )
