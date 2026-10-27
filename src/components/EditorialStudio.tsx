import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Bookmark, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { EditorialFormState, SavedLookbookItem } from '../types';

interface EditorialStudioProps {
  onSaveToLookbook: (item: Omit<SavedLookbookItem, 'id' | 'timestamp'>) => void;
  onSendToChat: (message: string) => void;
}

export const EditorialStudio: React.FC<EditorialStudioProps> = ({
  onSaveToLookbook,
  onSendToChat,
}) => {
  const [selectedBlueprint, setSelectedBlueprint] = useState<number>(3); // Default to 90s Minimalist Revival
  const [formData, setFormData] = useState<EditorialFormState>({
    theme: 'Pure Reduction: Fluid Columnar Silhouettes',
    targetPublication: 'i-D / Mastermind',
    season: 'Resort / Cruise 2027',
    vibeKeywords: 'High-twist black crepe, sheer slip layering, direct flash photography, Helmut Lang codes',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [editorialResult, setEditorialResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const blueprints = [
    {
      id: 0,
      title: 'Brutalist Sartorialism',
      pub: 'Dazed / Self Service',
      theme: 'Monolithic Shadows: Subversive Tailoring against Raw Concrete',
      season: 'Autumn/Winter 2026/27',
      vibe: 'Sharp padded shoulders, deep charcoal wool, harsh tungsten spotlights, austere restraint',
    },
    {
      id: 1,
      title: 'Romantic Deconstruction',
      pub: 'Vogue Italia / Purple',
      theme: 'Whispering Seams: Antique Lace and Deconstructed Military Gabardine',
      season: 'Spring/Summer 2027',
      vibe: 'Exposed basting threads, bias-cut silk organza, foggy dawn palette, melancholic beauty',
    },
    {
      id: 2,
      title: 'Neo-Equestrian Heritage',
      pub: 'Gentlewoman / Holiday',
      theme: 'The Sovereign Horizon: Tactile Tweed, Riding Leather & Modern Utility',
      season: 'Autumn/Winter 2026/27',
      vibe: 'Burnished bridle leather, British lovat tweed, muted moss & umber, crisp morning mist',
    },
    {
      id: 3,
      title: '90s Minimalist Revival',
      pub: 'i-D / Mastermind',
      theme: 'Pure Reduction: Fluid Columnar Silhouettes',
      season: 'Resort / Cruise 2027',
      vibe: 'High-twist black crepe, sheer slip layering, direct flash photography, Helmut Lang codes',
    },
  ];

  const handleSelectBlueprint = (idx: number) => {
    setSelectedBlueprint(idx);
    const bp = blueprints[idx];
    setFormData({
      theme: bp.theme,
      targetPublication: bp.pub,
      season: bp.season,
      vibeKeywords: bp.vibe,
    });
  };

  const handleGenerateEditorial = async () => {
    if (!formData.theme.trim()) return;
    setLoading(true);
    setEditorialResult(null);

    try {
      const res = await fetch('/api/fashion/generate-editorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate editorial concept.');
      }

      const data = await res.json();
      setEditorialResult(data.editorial);
    } catch (err: any) {
      console.error('Editorial concept error:', err);
      setEditorialResult(`**Editorial Direction Notice:**\n\nFailed to generate concept: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!editorialResult) return;
    navigator.clipboard.writeText(editorialResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!editorialResult) return;
    onSaveToLookbook({
      title: `Editorial: ${formData.theme.slice(0, 45)}`,
      category: 'editorial',
      content: editorialResult,
      tags: ['creative-direction', 'photoshoot-concept', formData.targetPublication],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
      
      {/* Center Studio Column: Form Studio */}
      <main className="lg:col-span-7 studio-col p-6 sm:p-10 overflow-y-auto border-r border-[#1A1A1A]/10 bg-[#F8F7F4]">
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.01em] text-[#1A1A1A] leading-[0.95] mb-2">
          Editorial Direction
        </h2>
        <p className="label mb-8">
          Pitch generation &amp; Narrative architecture
        </p>

        {/* Blueprint Grid (Variation 11 2x2 architecture) */}
        <div className="blueprint-grid mb-8">
          {blueprints.map((bp) => {
            const isSelected = selectedBlueprint === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp.id)}
                className={`blueprint-card ${isSelected ? 'selected' : ''}`}
              >
                <h4>{bp.title}</h4>
                <p>{bp.pub}</p>
              </button>
            );
          })}
        </div>

        {/* Field Groups */}
        <div className="space-y-6">
          <div className="field-group">
            <p className="label mb-1">Core Thesis</p>
            <input
              type="text"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              className="editorial-input"
              placeholder="e.g. Pure Reduction: Fluid Columnar Silhouettes"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="field-group">
              <p className="label mb-1">Target Publication</p>
              <input
                type="text"
                value={formData.targetPublication}
                onChange={(e) => setFormData({ ...formData, targetPublication: e.target.value })}
                className="editorial-input"
                placeholder="e.g. i-D / Mastermind"
              />
            </div>

            <div className="field-group">
              <p className="label mb-1">Season / Cycle</p>
              <input
                type="text"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="editorial-input"
                placeholder="e.g. Resort / Cruise 2027"
              />
            </div>
          </div>

          <div className="field-group">
            <p className="label mb-1">Material Cues &amp; Aesthetic Vibe</p>
            <textarea
              rows={2}
              value={formData.vibeKeywords}
              onChange={(e) => setFormData({ ...formData, vibeKeywords: e.target.value })}
              className="editorial-textarea"
              placeholder="High-twist black crepe, sheer slip layering, direct flash photography, Helmut Lang codes"
            />
          </div>

          <button
            onClick={handleGenerateEditorial}
            disabled={loading || !formData.theme.trim()}
            className="primary-btn mt-6"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                <span>SYNTHESIZING EDITORIAL ARCHITECTURE...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                <span>SYNTHESIZE EDITORIAL PITCH</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Right Column: Output & Narrative Canvas */}
      <section className="lg:col-span-5 output-col p-6 sm:p-10 flex flex-col justify-between bg-white overflow-y-auto">
        
        {/* Output Canvas Area */}
        <div className="flex-1 flex flex-col justify-center">
          {loading ? (
            <div className="output-canvas min-h-[380px]">
              <div className="loader" />
              <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
                Drafting Editorial Direction
              </h3>
              <p className="label">Neural Cross-referencing</p>
              <p className="label text-[0.55rem] mt-1 opacity-70">
                Archival Runway / Beauty Protocols
              </p>
            </div>
          ) : editorialResult ? (
            <div className="flex-1 flex flex-col">
              {/* Output Toolbar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1A1A1A]/10">
                <span className="label">Synthesized Blueprint</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 label hover:text-[#1A1A1A] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#1A1A1A]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'COPIED' : 'COPY'}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 label hover:text-[#1A1A1A] transition-colors ml-2"
                    title="Save to Lookbook"
                  >
                    {saved ? <Check className="w-3 h-3 text-[#1A1A1A]" /> : <Bookmark className="w-3 h-3" />}
                    <span>{saved ? 'SAVED' : 'SAVE'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSendToChat(
                        `Let's expand on this editorial pitch for "${formData.theme}":\n\n${editorialResult.slice(0, 400)}...`
                      );
                    }}
                    className="flex items-center gap-1 label-dark hover:opacity-75 transition-opacity ml-2"
                    title="Transmit to Chat"
                  >
                    <span>CHAT</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Formatted Content */}
              <div className="fashion-prose text-sm max-h-[520px] overflow-y-auto pr-2">
                <Markdown>{editorialResult}</Markdown>
              </div>
            </div>
          ) : (
            <div className="output-canvas min-h-[380px]">
              <div className="loader" />
              <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
                Drafting Editorial Direction
              </h3>
              <p className="label">Neural Cross-referencing</p>
              <p className="label text-[0.55rem] mt-1 opacity-70">
                Archival Runway / Beauty Protocols
              </p>
              <p className="text-xs text-[#1A1A1A]/60 italic mt-6 max-w-xs font-serif">
                Select any curated blueprint on the left or enter your bespoke thesis, then click Synthesize.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Telemetry Card */}
        <div className="pt-4 border-t border-[#1A1A1A] mt-6 shrink-0">
          <p className="label">System Output 042</p>
          <p className="text-xs text-[#1A1A1A]/70 mt-1">
            Ready for narrative synthesis. All vectors aligned to current seasonal shifts.
          </p>
        </div>

      </section>

    </div>
  );
};
