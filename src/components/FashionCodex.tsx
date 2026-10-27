import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Copy,
  Check,
  Bookmark,
  ArrowUpRight
} from 'lucide-react';
import { ICONIC_HOUSES, TEXTILE_GUIDE } from '../data/fashionKnowledge';
import { SavedLookbookItem } from '../types';

interface FashionCodexProps {
  onSendToChat: (prompt: string) => void;
  onSaveToLookbook?: (item: Omit<SavedLookbookItem, 'id' | 'timestamp'>) => void;
}

export const FashionCodex: React.FC<FashionCodexProps> = ({ onSendToChat, onSaveToLookbook }) => {
  const [activeSection, setActiveSection] = useState<'trends' | 'houses' | 'textiles' | 'silhouettes'>('trends');

  // Trend Analysis state
  const [customTrend, setCustomTrend] = useState<string>('Y2K Revival & Cyber-Futurism');
  const [subcultureContext, setSubcultureContext] = useState<string>('Cyber-futurism, low-rise deconstruction, pop-punk nostalgia');
  const [trendResult, setTrendResult] = useState<string | null>(null);
  const [trendSources, setTrendSources] = useState<Array<{ title: string; uri: string }>>([]);
  const [loadingTrend, setLoadingTrend] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const curatedTrendArchetypes = [
    {
      name: 'Y2K Revival & Cyber-Futurism',
      subculture: 'Pop-optimism, low-slung waists, metallic nylon, micro-skirts',
      era: 'Late 1990s - Early 2000s',
      status: 'Mainstream Peak',
    },
    {
      name: 'Tactile Sartorialism & 90s Minimalist Reduction',
      subculture: 'Architectural tailoring, raw wool gabardine & unpadded shoulders',
      era: '1990s Helmut Lang / Jil Sander',
      status: 'Permanent Macro Paradigm',
    },
    {
      name: 'Cottagecore & Pastoral Romanticism',
      subculture: 'Rural escapism, empire waists, puffed sleeves, broderie anglaise',
      era: 'Romantic Pastoral / Edwardian',
      status: 'Niche Archival',
    },
    {
      name: 'Post-Streetwear Sartorialism',
      subculture: 'Boxy tailoring meets sportswear ergonomics, loafers with rugby collars',
      era: 'Mid-2020s Hybridization',
      status: 'Growing Macro Trend',
    },
    {
      name: 'Technical Gorpcore & Utilitarian Luxury',
      subculture: 'Gore-Tex performance membranes, alpine trail ergonomics',
      era: 'Functionalist Outdoors',
      status: 'Mature Category',
    },
    {
      name: 'Indie Sleaze & Flash-Lit Grunge',
      subculture: 'Low-fi blog nostalgia, smudged kohl, lived-in leather jackets',
      era: 'Late 2000s Electro-clash',
      status: 'Subcultural Resurgence',
    },
  ];

  const silhouetteRules = [
    {
      title: 'The Rule of Thirds vs. Halves',
      rule: 'Never divide the silhouette into a 50/50 visual split, which causes the torso and legs to fight for dominance.',
      solution: 'Aim for a 1:2 ratio (short top + long high-waisted bottoms) or 2:1 ratio (oversized duster coat + cropped trouser) to create optical dynamic length.',
    },
    {
      title: 'The Sandwich Dressing Rule',
      rule: 'Harmonize an outfit by matching or mirroring the color / weight / texture of your footwear with your topmost layer.',
      solution: 'If wearing heavy black lug-sole derbies, anchor the top with a black wool overcoat or beanie, sandwiching lighter ecru denim in between.',
    },
    {
      title: 'Tactile Tension (The Texture Triad)',
      rule: 'An outfit constructed from only one fabric texture feels flat and clinical regardless of color.',
      solution: 'Combine at least two opposing textural poles: structured matte (wool gabardine/denim) with fluid sheen (silk/viscose) and open-weave rough (mohair/knit).',
    },
    {
      title: 'The Stance & Cuff Break Geometry',
      rule: 'Avoid uncontrolled fabric pooling around ankles which destroys clean columnar drape.',
      solution: 'Choose either a zero-break razor hem grazing the boot collar, or a deliberate wide-leg slouch that stacks cleanly over square-toe soles.',
    },
  ];

  const handleRunTrendAnalysis = async (trendName?: string, context?: string) => {
    const targetTrend = trendName || customTrend;
    const targetContext = context || subcultureContext;
    if (!targetTrend.trim()) return;

    setLoadingTrend(true);
    setTrendResult(null);
    setTrendSources([]);

    try {
      const res = await fetch('/api/fashion/trend-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendName: targetTrend,
          subcultureContext: targetContext,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze trend.');
      }

      const data = await res.json();
      setTrendResult(data.dossier);
      setTrendSources(data.sources || []);
    } catch (err: any) {
      console.error('Trend analysis error:', err);
      setTrendResult(`**Trend Intelligence Notice:**\n\nFailed to complete analysis: ${err.message}`);
    } finally {
      setLoadingTrend(false);
    }
  };

  const handleCopy = () => {
    if (!trendResult) return;
    navigator.clipboard.writeText(trendResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!trendResult) return;
    onSaveToLookbook?.({
      title: `Trend Dossier: ${customTrend}`,
      category: 'editorial',
      content: trendResult,
      tags: ['trend-forecasting', 'macro-radar', customTrend],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F7F4] overflow-hidden">
      
      {/* Sub-navigation Tabs */}
      <div className="px-6 py-3 border-b border-[#1A1A1A]/10 bg-[#F8F7F4] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'trends', label: 'Trend Radar' },
            { id: 'houses', label: 'Archival Houses' },
            { id: 'textiles', label: 'Textile Physics' },
            { id: 'silhouettes', label: 'Silhouette Ratios' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`chip ${activeSection === sec.id ? 'active' : ''}`}
            >
              {sec.label}
            </button>
          ))}
        </div>
        <span className="label hidden md:inline-block">Archival Codex v4.2</span>
      </div>

      {/* Main Section Content */}
      <div className="flex-1 overflow-hidden">
        
        {/* TREND RADAR */}
        {activeSection === 'trends' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
            
            {/* Left Column: Trend Query Form (7 cols) */}
            <main className="lg:col-span-7 studio-col p-6 sm:p-10 overflow-y-auto border-r border-[#1A1A1A]/10 bg-[#F8F7F4]">
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.01em] text-[#1A1A1A] leading-[0.95] mb-2">
                Trend Radar
              </h2>
              <p className="label mb-8">
                Macro cycle forecasting &amp; Longevity curves
              </p>

              {/* Archetypes Blueprint Grid */}
              <p className="label mb-2">Curated Macro Archetypes</p>
              <div className="blueprint-grid mb-8">
                {curatedTrendArchetypes.map((archetype, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCustomTrend(archetype.name);
                      setSubcultureContext(archetype.subculture);
                      handleRunTrendAnalysis(archetype.name, archetype.subculture);
                    }}
                    className={`blueprint-card ${customTrend === archetype.name ? 'selected' : ''}`}
                  >
                    <h4>{archetype.name}</h4>
                    <p>{archetype.subculture.slice(0, 45)}...</p>
                  </button>
                ))}
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div className="field-group">
                  <p className="label mb-1">Trend or Aesthetic Subject</p>
                  <input
                    type="text"
                    value={customTrend}
                    onChange={(e) => setCustomTrend(e.target.value)}
                    className="editorial-input"
                    placeholder="e.g. Y2K Revival, 90s Minimalist Reduction"
                  />
                </div>

                <div className="field-group">
                  <p className="label mb-1">Subcultural Context &amp; Key Pieces</p>
                  <input
                    type="text"
                    value={subcultureContext}
                    onChange={(e) => setSubcultureContext(e.target.value)}
                    className="editorial-input"
                    placeholder="e.g. Cyber-futurism, low-rise deconstruction, pop-punk nostalgia"
                  />
                </div>

                <button
                  onClick={() => handleRunTrendAnalysis()}
                  disabled={loadingTrend || !customTrend.trim()}
                  className="primary-btn mt-6"
                >
                  {loadingTrend ? (
                    <>
                      <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                      <span>ANALYZING MACRO RADAR &amp; LONGEVITY...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>GENERATE TREND INTELLIGENCE DOSSIER</span>
                    </>
                  )}
                </button>
              </div>
            </main>

            {/* Right Column: Output Dossier (5 cols) */}
            <section className="lg:col-span-5 output-col p-6 sm:p-10 flex flex-col justify-between bg-white overflow-y-auto">
              <div className="flex-1 flex flex-col justify-center">
                {loadingTrend ? (
                  <div className="output-canvas min-h-[380px]">
                    <div className="loader" />
                    <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
                      Synthesizing Macro Trend Dossier
                    </h3>
                    <p className="label">Longevity Index &amp; Commercial Viability</p>
                    <p className="label text-[0.55rem] mt-1 opacity-70">
                      Archival Genealogy / Subversive Counter-Cycles
                    </p>
                  </div>
                ) : trendResult ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1A1A1A]/10">
                      <span className="label">Trend Dossier Report</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 label hover:text-[#1A1A1A] transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3 text-[#1A1A1A]" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'COPIED' : 'COPY'}</span>
                        </button>

                        {onSaveToLookbook && (
                          <button
                            onClick={handleSave}
                            className="flex items-center gap-1 label hover:text-[#1A1A1A] transition-colors ml-2"
                          >
                            {saved ? <Check className="w-3 h-3 text-[#1A1A1A]" /> : <Bookmark className="w-3 h-3" />}
                            <span>{saved ? 'SAVED' : 'SAVE'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            onSendToChat(
                              `Let's discuss this macro trend analysis for "${customTrend}":\n\n${trendResult.slice(0, 400)}...`
                            );
                          }}
                          className="flex items-center gap-1 label-dark hover:opacity-75 transition-opacity ml-2"
                        >
                          <span>CHAT</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="fashion-prose text-sm max-h-[520px] overflow-y-auto pr-2">
                      <Markdown>{trendResult}</Markdown>
                    </div>

                    {trendSources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#1A1A1A]/10">
                        <p className="label mb-2">Live Search Citations</p>
                        <div className="flex flex-wrap gap-1.5">
                          {trendSources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chip text-[0.6rem] inline-flex items-center gap-1"
                            >
                              <span>{s.title}</span>
                              <ArrowUpRight className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="output-canvas min-h-[380px]">
                    <div className="loader" />
                    <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
                      Awaiting Trend Query
                    </h3>
                    <p className="label">Select an archetype on the left or enter a custom movement</p>
                    <p className="label text-[0.55rem] mt-1 opacity-70">
                      Historical Genealogy / Longevity Analysis
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#1A1A1A] mt-6 shrink-0">
                <p className="label">System Output 045</p>
                <p className="text-xs text-[#1A1A1A]/70 mt-1">
                  Macro cycle radar computed using cultural sentiment and fashion calendar indexing.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* ARCHIVAL HOUSES */}
        {activeSection === 'houses' && (
          <div className="p-6 sm:p-10 overflow-y-auto h-full">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A] mb-1">
              Archival Fashion Houses
            </h2>
            <p className="label mb-6">Historical Lineage &amp; Aesthetic Signatures</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ICONIC_HOUSES.map((house, idx) => (
                <div key={idx} className="bg-white border border-[#1A1A1A]/10 p-6 flex flex-col justify-between">
                  <div>
                    <span className="label text-[0.6rem]">{house.era}</span>
                    <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mt-1 mb-2">
                      {house.name}
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/70 font-sans leading-relaxed mb-4">
                      {house.keyLegacy}
                    </p>
                    
                    <div className="border-t border-[#1A1A1A]/10 pt-3">
                      <p className="label mb-1">Signature Codes</p>
                      <ul className="text-xs text-[#1A1A1A]/80 list-disc pl-4 space-y-1">
                        {house.signatureCodes.map((s, sIdx) => (
                          <li key={sIdx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => onSendToChat(`Deep-dive into the archival legacy, key runway shows, and styling codes of ${house.name}.`)}
                    className="label mt-6 pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[#1A1A1A] hover:opacity-75"
                  >
                    <span>STUDY ARCHIVE IN CHAT</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEXTILE PHYSICS */}
        {activeSection === 'textiles' && (
          <div className="p-6 sm:p-10 overflow-y-auto h-full">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A] mb-1">
              Textile Physics &amp; Drape Compendium
            </h2>
            <p className="label mb-6">Material Weights, Weave Densities, and Styling Tension</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEXTILE_GUIDE.map((fabric, idx) => (
                <div key={idx} className="bg-white border border-[#1A1A1A]/10 p-6 flex flex-col justify-between">
                  <div>
                    <span className="label text-[0.6rem]">{fabric.bestUse}</span>
                    <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mt-1 mb-2">
                      {fabric.fabric}
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/70 font-sans leading-relaxed mb-4">
                      {fabric.weightDrape}
                    </p>

                    <div className="space-y-2 border-t border-[#1A1A1A]/10 pt-3 text-xs">
                      <div>
                        <span className="label block">Care &amp; Longevity:</span>
                        <span className="text-[#1A1A1A]">{fabric.careLongevity}</span>
                      </div>
                      <div>
                        <span className="label block">Vintage Search Cues:</span>
                        <span className="text-[#1A1A1A] italic">{fabric.vintageSearchTerms.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSendToChat(`How do I style ${fabric.fabric} to maximize its drape dynamics and create tactile tension?`)}
                    className="label mt-6 pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[#1A1A1A] hover:opacity-75"
                  >
                    <span>CONSULT FABRIC IN CHAT</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SILHOUETTES */}
        {activeSection === 'silhouettes' && (
          <div className="p-6 sm:p-10 overflow-y-auto h-full">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A] mb-1">
              Silhouette Proportion Laws
            </h2>
            <p className="label mb-6">The Golden Ratio &amp; Optical Balance Directives</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {silhouetteRules.map((r, idx) => (
                <div key={idx} className="bg-white border border-[#1A1A1A]/10 p-6">
                  <span className="label text-[0.6rem]">DIRECTIVE {idx + 1}</span>
                  <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mt-1 mb-3">
                    {r.title}
                  </h3>
                  <div className="space-y-3 text-xs font-sans">
                    <div>
                      <span className="label block mb-1">The Friction Point:</span>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">{r.rule}</p>
                    </div>
                    <div>
                      <span className="label block mb-1">The Architectural Fix:</span>
                      <p className="text-[#1A1A1A] font-medium leading-relaxed">{r.solution}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSendToChat(`How can I apply "${r.title}" to an everyday wardrobe? Give me 3 concrete look formulas.`)}
                    className="label mt-6 pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[#1A1A1A] hover:opacity-75 w-full"
                  >
                    <span>APPLY LAW IN CHAT</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
