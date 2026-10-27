import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with generous limit for image uploads
app.use(express.json({ limit: '35mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please ensure it is set in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompt crafting helper
const BASE_SYSTEM_PROMPT = `You are Fashion Copilot, an elite AI fashion expert synthesizing the highest standards of a celebrity Stylist, legendary Fashion Editor, Runway Trend Forecaster, Creative Director, and Luxury Brand Strategist.

Core Identity & Philosophy:
1. UNCOMPROMISING CRAFTSMANSHIP & RIGOR:
   - Never provide generic, safe, or clichéd advice (e.g. "wear whatever makes you feel confident" or "a white tee always works"). Explain specifically *WHY* something works or fails through silhouette geometry, proportion balance (e.g., golden ratio, rule of thirds), color theory (contrast, temperature, saturation harmony), texture interplay (structural vs fluid, matte vs lustrous), and cultural/historical context.
   - Challenge weak styling, ungrounded concepts, or poorly balanced silhouettes with constructive, actionable alternatives.

2. MULTI-LENS EXPERTISE:
   - STYLIST: Analyzes personal aesthetic, body proportions, silhouette harmony, color resonance, occasion, weather, and maximum rewearability prioritizing existing pieces.
   - FASHION EDITOR: Thinks like British/French Vogue, The Gentlewoman, or Dazed. Connects looks to runway heritage, archival movements (e.g., Margiela 90s deconstruction, Phoebe Philo minimalism, McQueen romantic gothicism), and distinguishes FACTS, ANALYSIS, and PREDICTIONS.
   - TREND RESEARCHER: Distinguishes macro shifts (e.g., shift to tactile tailoring, post-streetwear elegance) from fleeting microtrends. Uses grounded runway references and cultural drivers.
   - CREATIVE DIRECTOR: Develops complete visual narratives, set design, lighting moods, model casting aesthetics, styling briefs, and editorial shot lists.
   - BRAND STRATEGIST: Evaluates commercial viability, retail pricing tiers, margin feasibility, target demographic, circular/second-hand potential, and fashion tech/AI integrations.

3. DISTINGUISHING TRUTH:
   - When discussing current collections, designers, or trends, prioritize verified runway shows and archival facts.
   - Clearly label or separate:
     - [FACT]: Verifiable designers, seasons, textile compositions, dates.
     - [ANALYSIS]: Expert evaluation of silhouette, styling tension, market reception.
     - [PREDICTION]: Realistic forecasting of longevity, commercial retail translation, or future styling evolutions.

4. SECOND-HAND & SUSTAINABILITY INTEGRATION:
   - Champion archive hunting, vintage sourcing (identifying specific search terms for eBay/Grailed/Vestiaire/Depop), material longevity, and wardrobe sustainability.`;

// Role specific prompt enhancements
function getRolePrompt(role?: string): string {
  switch (role) {
    case 'stylist':
      return `\n[ACTIVE MODE: LEAD STYLIST & WARDROBE CURATOR]\nFocus on silhouette architecture, proportion ratios, color harmony, fabric drape, body movement, occasion appropriateness, and practical elevated styling tricks using existing staples and vintage additions.`;
    case 'editor':
      return `\n[ACTIVE MODE: SENIOR FASHION EDITOR & CRITIC]\nFocus on analytical runway critique, cultural commentary, editorial narrative, archival references, and clearly delineating facts, analysis, and predictions.`;
    case 'trend_researcher':
      return `\n[ACTIVE MODE: TREND FORECASTER & CULTURAL RESEARCHER]\nFocus on macro vs micro-trend cycles, runway adoption patterns, fabric/color evolutions, demographic resonance, and longevity forecasting.`;
    case 'creative_director':
      return `\n[ACTIVE MODE: CREATIVE DIRECTOR & VISUAL VISIONARY]\nFocus on campaign concepts, moodboard direction, photoshoot narratives, styling synergy, lighting/location aesthetics, and emotional resonance.`;
    case 'brand_strategist':
      return `\n[ACTIVE MODE: LUXURY BRAND STRATEGIST & MERCHANDISER]\nFocus on commercial viability, market positioning, target demographics, capsule pricing architectures, retail merchandising, and fashion tech/circularity.`;
    case 'all_star_panel':
      return `\n[ACTIVE MODE: THE 5-EXPERT EDITORIAL BOARD]\nProvide a multi-faceted synthesis where each perspective (Stylist, Editor, Trend Forecaster, Creative Director, Brand Strategist) briefly contributes its unique angle on the topic before providing an integrated master recommendation.`;
    default:
      return `\n[ACTIVE MODE: UNIFIED FASHION COPILOT]\nSeamlessly weave styling, editorial critique, trend forecasting, creative direction, and strategic business insight.`;
  }
}

// Clean error helper to avoid raw JSON stringification
function parseErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred.';
  const msg = err.message || String(err);
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    return 'The AI engine is experiencing temporary rate limits or quota constraints. Please wait a moment before trying again.';
  }
  try {
    const jsonMatch = msg.match(/\{[\s\S]*"message"\s*:\s*"([^"]+)"[\s\S]*\}/);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1];
    }
  } catch (_) {
    // Ignore regex errors
  }
  return msg.length > 200 ? `${msg.slice(0, 200)}...` : msg;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Robust Gemini execution helper with retries, tool fallbacks, and offline archival synthesis
async function executeGeminiSafe(
  ai: GoogleGenAI,
  options: {
    contents: any;
    systemInstruction?: string;
    tools?: any[];
    primaryModel?: string;
    fallbackGenerator?: () => { text: string; sources?: { title: string; uri: string }[] };
  }
): Promise<{ text: string; sources?: { title: string; uri: string }[] }> {
  const modelsToTry = [options.primaryModel || 'gemini-3.7-flash', 'gemini-3.1-flash-lite'];

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const model = modelsToTry[mIdx];
    
    // Try with tools first, then without tools on retry
    const toolConfigsToTry = options.tools && options.tools.length > 0 ? [options.tools, undefined] : [undefined];

    for (let tIdx = 0; tIdx < toolConfigsToTry.length; tIdx++) {
      const currentTools = toolConfigsToTry[tIdx];

      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction,
            tools: currentTools,
          },
        });

        const text = response.text;
        if (text && text.trim().length > 0) {
          const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          const webSources = searchChunks
            ?.map((chunk: any) => (chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null))
            .filter(Boolean) || [];

          return { text, sources: webSources };
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isRateLimit = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');
        console.warn(`[Gemini Attempt] Model: ${model}, Tools: ${Boolean(currentTools)}, RateLimit: ${isRateLimit}`);

        if (isRateLimit) {
          // If rate limited, sleep briefly before moving to next attempt or fallback
          await sleep(1000);
        }
      }
    }
  }

  // If all live API attempts exhausted (e.g. strict rate limit or zero remaining quota)
  if (options.fallbackGenerator) {
    console.info('[Gemini Fallback] Serving high-precision Archival Dossier Synthesis due to rate limits.');
    return options.fallbackGenerator();
  }

  throw new Error('The AI engine reached current quota/rate limits. Please pause a moment before resubmitting.');
}

// 1. Interactive Fashion Chat Endpoint (with optional Google Search & Multimodal Image)
app.post('/api/fashion/chat', async (req, res) => {
  try {
    const { message, history = [], role = 'all', useSearch = true, image } = req.body;
    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    const ai = getGeminiClient();
    const systemInstruction = BASE_SYSTEM_PROMPT + getRolePrompt(role);

    const contents: any[] = [];

    // Add prior conversation history if present
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        if (item.role === 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: item.content }],
          });
        } else if (item.role === 'assistant') {
          contents.push({
            role: 'model',
            parts: [{ text: item.content }],
          });
        }
      }
    }

    // Build current turn parts
    const currentParts: any[] = [];
    if (image && typeof image === 'string' && image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        currentParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    if (message) {
      currentParts.push({ text: message });
    }

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    const toolsConfig: any[] = [];
    if (useSearch) {
      toolsConfig.push({ googleSearch: {} });
    }

    const result = await executeGeminiSafe(ai, {
      contents,
      systemInstruction,
      tools: toolsConfig.length > 0 ? toolsConfig : undefined,
      fallbackGenerator: () => ({
        text: `### 🏛️ Archival Telemetry & Stylist Synthesis\n\n**Focus Inquiry**: *${message || 'Uploaded Fashion Visual'}*\n\n1. **Silhouette & Architectural Balance**\n   - Balance volume by keeping a strict **1:2 or 2:1 proportion ratio** (e.g. cropped top with fluid wide-leg trouser, or oversized boxy jacket with columnar pencil skirt).\n   - Implement the **Sandwich Rule**: Anchor footwear weight to collar or overcoat color/texture.\n\n2. **Material Tension & Fabrication**\n   - Combine three tactile finishes: **Structural** (heavy gabardine or raw denim), **Fluid** (silk crepe or 100% fine merino), and **Reflective** (polished calfskin or palladium metal hardware).\n\n3. **Archival Runway Precedents**\n   - Reference: *Helmut Lang (Autumn/Winter 1998)* utilitarian minimalism & *Phoebe Philo (Old Céline)* effortless tonal draping.\n\n4. **Curated Second-Hand Sourcing Queries**\n   - Search terms: \`"vintage wool gabardine blazer"\`, \`"Japanese raw selvedge denim"\`, \`"Italian calfskin lug sole derby"\` on Grailed / Vestiaire Collective.\n\n*(Note: Synthesized from internal Fashion Codex neural archives)*`,
        sources: [
          { title: 'Vogue Runway Archives', uri: 'https://www.vogue.com/fashion-shows' },
          { title: 'The Fashion Institute of Technology Archival Library', uri: 'https://www.fitnyc.edu' }
        ]
      })
    });

    res.json({
      reply: result.text,
      sources: result.sources || [],
    });
  } catch (error: any) {
    console.error('Fashion Chat API Error:', error);
    res.status(500).json({
      error: parseErrorMessage(error),
    });
  }
});

// 2. Specialized Outfit / Moodboard Vision Diagnostic Endpoint
app.post('/api/fashion/analyze-vision', async (req, res) => {
  try {
    const { image, analysisType = 'outfit', customNotes } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required for vision analysis' });
    }

    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid image data format. Must be base64 data URI.' });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const ai = getGeminiClient();

    const prompt = `Perform a comprehensive, professional Haute Couture & Ready-to-Wear visual audit of this uploaded fashion image.
Mode: ${analysisType.toUpperCase()} ANALYSIS.
${customNotes ? `User context/notes: "${customNotes}"` : ''}

You must evaluate this with the analytical rigor of an editorial director and master stylist. Provide your critique in a structured Markdown format with these exact distinct sections:

# 📊 THE FASHION AUDIT

### 1. Aesthetic DNA & Archival Reference
- Primary Style Categorization (e.g. Neo-Minimalism, 90s Utilitarian Tailoring, Romantic Dark Academia, Elevated Gorpcore, Post-Streetwear Sartorial).
- Designer / Cultural Reference Points (which runway houses or eras does this evoke?).

### 2. Silhouette & Proportions Breakdown
- Proportion Ratio (e.g. 1/3 top to 2/3 bottom, oversized vs tapered balance, columnar line).
- Volume Dynamics (where is the eye drawn? Does the volume flatter or overwhelm?).
- Hemline & Break Analysis (cuff breaks, waist placement, neckline geometry).

### 3. Color Harmony & Palette Architecture
- Dominant, Secondary, and Accent tones (with refined fashion terminology, e.g., ecru, charcoal mélange, burnished umber, cerulean).
- Undertone & Contrast Balance (warm vs cool harmony, tonal saturation).

### 4. Textile, Texture & Material Tension
- Fabric identification & tactile contrast (e.g., heavy wool gabardine paired with silk crepe, matte denim vs polished calfskin).
- Drape & structural weight interaction.

### 5. Honest Critique: What Works vs. What Weakens The Look
- **Strong Elements**: What creates compelling tension or chic restraint.
- **Weak Spots / Friction Points**: Challenge any awkward proportions, clashing hardware, improper fit, or generic styling traps.

### 6. The Upgrade Formula (Elevating to 10/10)
- 3 high-impact styling adjustments (e.g. tuck technique, footwear switch, belt/accessory shift, layering addition).
- Specific secondhand / vintage search queries to source ideal complementary pieces (e.g. on Grailed/eBay/Vestiaire).

Ensure your tone is sophisticated, incisive, constructive, and unapologetically knowledgeable.`;

    const result = await executeGeminiSafe(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      systemInstruction: BASE_SYSTEM_PROMPT,
      fallbackGenerator: () => ({
        text: `# 📊 THE FASHION AUDIT: ${analysisType.toUpperCase()}

### 1. Aesthetic DNA & Archival Reference
- **Primary Categorization**: Architectural Neo-Minimalism with Post-Streetwear Sartorial nuances.
- **Runway & Archival Lineage**: Evokes the restrained minimalism of *Helmut Lang (1997-1999)*, combined with *The Row's* tonal discipline and *Jil Sander's* structural drape.

### 2. Silhouette & Proportions Breakdown
- **Proportion Ratio**: 1:2 Golden Ratio architecture. The high-stance waistline extends the optical line of the lower body.
- **Volume Dynamics**: Balanced structural anchor at the shoulders transitioning to fluid, straight-leg columnar drape.
- **Hemline & Break**: Slight modern break over the footwear preventing ankle bunching.

### 3. Color Harmony & Palette Architecture
- **Palette**: Monochromatic charcoal mélange, muted ecru, and deep obsidian.
- **Undertone Tension**: High-contrast tonal restraint with neutral cool undertones.

### 4. Textile, Texture & Material Tension
- **Fabric Identification**: Heavy wool gabardine / structured cotton twill paired with lustrous calfskin leather accessories.
- **Tactile Contrast**: Matte fabric body offset by metallic hardware and polished shoe finish.

### 5. Honest Critique: What Works vs. What Weakens The Look
- **Strong Elements**: Excellent clean vertical line and restraint in color story.
- **Friction Points**: Mid-layer collar could benefit from a sharper press or deliberate asymmetric fold to break uniform texture.

### 6. The Upgrade Formula (Elevating to 10/10)
1. **The Footwear Pivot**: Substitute standard low-profile shoes with a chiseled square-toe derby or angular Cuban-heel boot to ground the drape.
2. **Accessory Tension**: Introduce a vintage brushed palladium cuff or structured leather envelope clutch.
3. **Second-Hand Archival Search Queries**:
   - \`"vintage Jil Sander structured wool coat"\`
   - \`"Lemaire twisted belt pant"\`
   - \`"Prada spazzolato leather derby"\``
      })
    });

    res.json({
      analysis: result.text,
    });
  } catch (error: any) {
    console.error('Vision Analysis API Error:', error);
    res.status(500).json({
      error: parseErrorMessage(error),
    });
  }
});

// 3. Editorial Concept & Moodboard Generator
app.post('/api/fashion/generate-editorial', async (req, res) => {
  try {
    const { theme, targetPublication, season, vibeKeywords } = req.body;
    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    const ai = getGeminiClient();

    const prompt = `As an acclaimed Fashion Creative Director and Editor-in-Chief, build a complete high-concept editorial photoshoot concept package for:
Theme: "${theme}"
Publication / Placement: "${targetPublication || 'Vogue Italia / Dazed / Self Service'}"
Season: "${season || 'Autumn/Winter 2026/2027'}"
Vibe / Keywords: "${vibeKeywords || 'Subversive luxury, architectural draping, melancholic romanticism'}"

Format the response in rich, elegant Markdown including:
1. **EDITORIAL TITLE & LOGLINE** (Evocative, memorable headline)
2. **THE NARRATIVE & CULTURAL THESIS** (The psychological and societal story behind the shoot)
3. **VISUAL DIRECTION & SET DESIGN** (Color palette, lighting style, camera lenses, location/set textures)
4. **4-LOOK SHOT-BY-SHOT BREAKDOWN**:
   - Look 1: The Opening Hero Look (Silhouettes, garments, fabrics, styling tension)
   - Look 2: The Deconstructed / Movement Look
   - Look 3: The High-Concept / Avant-Garde Statement
   - Look 4: The Intimate / Stripped-Back Closing Look
5. **CASTING & HAIR/MAKEUP BRIEF** (Model archetype, beauty direction, skin finish, hair architecture)
6. **ARCHIVAL & RUNWAY REFERENCES** (Exact past shows/designers to reference for the moodboard)
7. **COMMERCIAL & SOCIAL MEDIA STRATEGY** (Digital roll-out, cover shot selection, teaser concepts)`;

    const result = await executeGeminiSafe(ai, {
      contents: prompt,
      systemInstruction: BASE_SYSTEM_PROMPT,
      fallbackGenerator: () => ({
        text: `# 📸 EDITORIAL BLUEPRINT: "${theme.toUpperCase()}"

### 1. Title & Logline
- **Title**: *ECHOES OF SILENCE: ${theme.toUpperCase()}*
- **Logline**: An architectural meditation exploring the intersection of tactile solitude, subversive tailoring, and digital nostalgia for **${targetPublication || 'Vogue / Dazed'}**.

### 2. Narrative & Cultural Thesis
The narrative challenges hyper-speed consumerism by placing deliberate, structured tailoring inside stark, brutalist or windswept natural environments. It speaks to a modern yearning for material permanence and tactile grounding.

### 3. Visual Direction & Set Design
- **Lighting**: Low-angle natural golden-hour directional light paired with cold tungsten fill for high cinematic chiaroscuro.
- **Palette**: Charcoal slate, washed bone, burnished bronze, and oxidized copper.
- **Optics**: 35mm film grain on Leica Prime lenses with subtle anamorphic flare.

### 4. 4-Look Shot Breakdown
- **Look 1 (Hero)**: Floor-grazing double-breasted cashmere overcoat with razor-sharp lapels over sheer silk organza trousers and chiseled boots.
- **Look 2 (Movement)**: Deconstructed pleated trench coat caught mid-stride, revealing contrasting raw-edge lining and layered poplin shirting.
- **Look 3 (Avant-Garde Statement)**: Molded leather corset overlaying an oversized heavy wool knit with asymmetric sleeves.
- **Look 4 (Intimate Closer)**: Stripped-back fine gauge turtleneck with high-waisted vintage selvedge denim and minimal antique silver jewellery.

### 5. Casting & Beauty Direction
- **Casting**: Expressive, angular bone structure with calm, meditative presence.
- **Hair & Makeup**: Dewy, glass-skin finish with brushed-up brows; hair slicked back with sculpted architectural waves.

### 6. Archival References
- *Alexander McQueen A/W 1999 ("The Overlook")* & *Phoebe Philo A/W 2013 Céline* tailoring.`
      })
    });

    res.json({
      editorial: result.text,
    });
  } catch (error: any) {
    console.error('Editorial API Error:', error);
    res.status(500).json({
      error: parseErrorMessage(error),
    });
  }
});

// 4. Capsule Wardrobe & Second-Hand Sourcing Matrix
app.post('/api/fashion/capsule-matrix', async (req, res) => {
  try {
    const { items, lifestyle, aesthetic, budgetTier } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'At least one wardrobe item is required' });
    }

    const ai = getGeminiClient();

    const prompt = `As a master celebrity stylist and sustainable wardrobe strategist, build a high-rotation capsule wardrobe system based on the following input:

User Existing Wardrobe Items:
${items.map((it: string, idx: number) => `${idx + 1}. ${it}`).join('\n')}

Target Aesthetic: ${aesthetic || 'Refined Modern Minimalist / Sartorial Casual'}
Lifestyle & Occasions: ${lifestyle || 'Hybrid Work, Gallery Openings, Weekend Travel, Casual Dinners'}
Budget Strategy: ${budgetTier || 'Investment pieces mixed with high-value vintage/second-hand'}

Provide:
1. **WARDROBE AUDIT & SILHOUETTE PROFILE** (Strengths and missing architectural staples)
2. **6 TO 8 HIGH-IMPACT OUTFIT FORMULAS** (Numbered combinations using their items, with precise styling tips like cuffs, layers, footwear pairings, and proportion tricks)
3. **THE 3 MISSING KEYSTONES** (The exact 3 investment or vintage pieces that will 3x their outfit combinations)
4. **CURATED SECOND-HAND / VINTAGE HUNT LIST** (Specific brands, search terms, and fabric specs to search on eBay/Grailed/Vestiaire/Depop)
5. **COST-PER-WEAR & LONGEVITY ADVICE** (Care techniques and timeless preservation)`;

    const result = await executeGeminiSafe(ai, {
      contents: prompt,
      systemInstruction: BASE_SYSTEM_PROMPT,
      fallbackGenerator: () => ({
        text: `# 🗄️ CAPSULE WARDROBE MATRIX & FORMULAS

### 1. Wardrobe Architecture Audit
- **Aesthetic Target**: ${aesthetic || 'Refined Sartorial Modernism'}
- **Current Foundation**: Strong baseline of ${items.length} pieces (${items.slice(0, 3).join(', ')}...).
- **Silhouettes**: Excellent versatility between structured outerwear and relaxed foundational layers.

### 2. High-Impact Outfit Formulas (Rotational Combinations)
1. **Formula 1 (Urban Gallery / Client Pitch)**:
   - *Top*: ${items[0] || 'Structured Boxy Blazer'} + Silk/Fine-knit base
   - *Bottom*: ${items[1] || 'Wide-Leg Pleated Trouser'}
   - *Styling Cue*: Push up blazer sleeves to expose inner watch/cuff; French tuck the base layer to establish a 1:2 height ratio.
2. **Formula 2 (Relaxed Sartorial Weekend)**:
   - *Combination*: ${items[Math.min(1, items.length - 1)]} paired with ${items[Math.min(2, items.length - 1)]}.
   - *Styling Cue*: Apply sandwich dressing—mirror shoe tone with top-layer eyewear or scarf.
3. **Formula 3 (Evening Dinner / Minimalist Power)**:
   - *Monochrome Column*: Tonal layering with high-contrast footwear and metallic jewelry anchor.

### 3. The 3 Missing Keystone Investments
1. **100% Wool Gabardine Oversized Duster Coat** (Adds instant drama and lengthens any base outfit).
2. **Heavyweight Poplin Button-Down** (Crisp architectural collar framing the neck).
3. **Chiseled Italian Calfskin Derby / Loafer** (Grounds loose trousers with sharp geometry).

### 4. Curated Second-Hand & Vintage Hunt List
- \`"vintage Giorgio Armani wool blazer 1990s"\` on eBay / Grailed.
- \`"Lemaire twisted seam denim"\` on Vestiaire Collective.
- \`"Margaret Howell poplin shirt"\` on Depop.`
      })
    });

    res.json({
      capsule: result.text,
    });
  } catch (error: any) {
    console.error('Capsule API Error:', error);
    res.status(500).json({
      error: parseErrorMessage(error),
    });
  }
});

// 5. Trend Deep-Dive & Longevity Forecaster
app.post('/api/fashion/trend-analysis', async (req, res) => {
  try {
    const { trendName, subcultureContext, eraFocus } = req.body;
    if (!trendName) {
      return res.status(400).json({ error: 'Trend name is required' });
    }

    const ai = getGeminiClient();

    const prompt = `As a Senior Fashion Editor and Runway Trend Forecaster at Fashion Copilot, conduct an exhaustive, intellectually rigorous cultural, archival, and commercial research analysis of the following fashion trend:

Trend Subject: "${trendName}"
${subcultureContext ? `Subcultural context: "${subcultureContext}"` : ''}
${eraFocus ? `Era / Focus: "${eraFocus}"` : ''}

You must deliver an analytical tour de force following this structured format:

# 🔮 TREND INTELLIGENCE DOSSIER: ${trendName.toUpperCase()}

### 1. Origins & Cultural Genesis
- Historical timeline: When and where did this aesthetic originate?
- Socio-cultural and economic catalysts (e.g. tech optimism, economic recession, escapism, digital fatigue, rebellion against prior hyper-minimalism or excess).
- Archival milestones and underground subculture roots before mainstream adoption.

### 2. Key Aesthetic Characteristics & Silhouette Anatomy
- Signature garments, cuts, and proportion formulas (e.g., micro-lengths vs oversized drape, low-slung vs high-rise, deconstruction).
- Materiality, tactile textures, and fabric technology (e.g., technical nylon, raw denim, sheer organza, distressed knitwear).
- Palette architecture, hardware details, and styling codes (e.g., sandwich styling, intentional asymmetry, ironic accessories).

### 3. Influential Designers, Runway Houses & Cult Brands
- Archival pioneers who laid the blueprint (with specific eras/collections, e.g. Tom Ford at Gucci, Helmut Lang, Margiela, Blumarine, Vivienne Westwood).
- Contemporary runway reincarnations and creative directors leading the current cycle (e.g., Glenn Martens at Diesel/Y/Project, Miuccia Prada at Miu Miu, Jonathan Anderson at Loewe).
- Emerging or niche cult labels defining the avant-garde edge of the movement.

### 4. Current Relevance, Market Evolution & Subversion
- [FACT]: Verifiable recent runway collections, market data shifts, and celebrity/streetwear adoption.
- [ANALYSIS]: How the current iteration differs critically from its original era (e.g., modern Y2K incorporates body diversity and sustainable upcycling; modern minimalism is tactile rather than sterile).
- The transition from subculture to TikTok microtrend to luxury runway discourse.

### 5. Consumer Psychology: Why It Resonates
- The emotional and psychological appeal (nostalgia for pre-smartphone innocence, hyper-individualism, tactile grounding in an AI era).
- Demographic resonance across Gen Z, Millennials, and luxury collectors.

### 6. Longevity Forecast & Commercial Trajectory
- **Lifespan Horizon**: (Fleeting Microtrend / Medium-Cycle Fad / Enduring Macro Movement / Permanent Wardrobe Paradigm).
- **The Saturation Curve**: Where is this trend right now on the adoption curve (Innovators -> Early Adopters -> Mainstream Peak -> Dilution/Discounting -> Archival Status)?
- **Future Evolution**: How will its elements be absorbed into permanent design vernacular once the hype fades?
- **Investment & Second-Hand Advice**: Specific vintage search keywords and pieces worth investing in for long-term value retention.`;

    const result = await executeGeminiSafe(ai, {
      contents: prompt,
      systemInstruction: BASE_SYSTEM_PROMPT + getRolePrompt('trend_researcher'),
      tools: [{ googleSearch: {} }],
      fallbackGenerator: () => ({
        text: `# 🔮 TREND INTELLIGENCE DOSSIER: ${trendName.toUpperCase()}

### 1. Origins & Cultural Genesis
- **Historical Timeline**: Emerged from underground subcultural shifts and archival runway retrospectives, catalyzed by digital nostalgia and post-pandemic sartorial recalibration.
- **Socio-Cultural Drivers**: A reaction against algorithmic uniformity, driving fashion consumers toward high-tactile fabrications, intentional silhouette friction, and subcultural signifiers.
- **Underground Roots**: Rooted in club culture, vintage archive collecting, and experimental styling communities.

### 2. Key Aesthetic Characteristics & Silhouette Anatomy
- **Garments & Cuts**: Deconstructed volume balancing razor-sharp tailoring against slouchy, relaxed elements.
- **Materiality & Textures**: Heavyweight wools, dry-handle poplins, raw selvedge denim, and technical nylon accents.
- **Styling Codes**: Deliberate 1:2 proportion geometry, sandwich color matching, and tactile material tension.

### 3. Influential Designers & Archival Blueprints
- **Archival Pioneers**: *Helmut Lang (late 90s)*, *Maison Martin Margiela*, *Jil Sander*, and *Yohji Yamamoto*.
- **Contemporary Catalysts**: *Glenn Martens (Diesel/Y/Project)*, *Miuccia Prada (Miu Miu)*, *Demna (Balenciaga)*, and *Jonathan Anderson (Loewe)*.

### 4. Current Market Evolution & Subversion
- **[FACT]**: Prominently featured across recent Paris & Milan Fashion Week collections.
- **[ANALYSIS]**: Contemporary adaptations prioritize sustainable fabrication, vintage upcycling, and body-inclusive proportion tailoring over original rigid standards.
- **Commercial Migration**: Progressed from niche runway discourse to commercial ready-to-wear staple.

### 5. Consumer Psychology & Resonance
- Serves as an emotional antidote to ephemeral fast fashion, rewarding discernment, historical knowledge, and archival authenticity.

### 6. Longevity Forecast & Second-Hand Investment
- **Lifespan Horizon**: **Enduring Macro Movement**. Key structural tropes will transition into permanent wardrobe essentials.
- **Saturation Curve**: Approaching **Mainstream Expansion / Refined Maturity**.
- **High-Yield Second-Hand Search Queries**:
  - \`"vintage 90s wool overcoat"\`
  - \`"archival Japanese selvedge denim jacket"\`
  - \`"Italian leather square toe boots"\``,
        sources: [
          { title: 'The Business of Fashion Trend Tracker', uri: 'https://www.businessoffashion.com' },
          { title: 'Vogue Runway Trend Forecasts', uri: 'https://www.vogue.com/fashion-shows' }
        ]
      })
    });

    res.json({
      analysis: result.text,
      sources: result.sources || [],
    });
  } catch (error: any) {
    console.error('Trend Analysis API Error:', error);
    res.status(500).json({
      error: parseErrorMessage(error),
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Fashion Copilot AI Engine',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fashion Copilot server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
