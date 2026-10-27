import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  Plus, 
  X, 
  Copy, 
  Check, 
  Bookmark, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { SavedLookbookItem } from '../types';

interface CapsuleMatrixProps {
  onSaveToLookbook: (item: Omit<SavedLookbookItem, 'id' | 'timestamp'>) => void;
  onSendToChat: (message: string) => void;
}

export const CapsuleMatrix: React.FC<CapsuleMatrixProps> = ({
  onSaveToLookbook,
  onSendToChat,
}) => {
  const [items, setItems] = useState<string[]>([
    'Double-breasted charcoal wool blazer',
    'Oversized crisp white poplin shirt',
    'High-waisted wide-leg pleated trousers (black)',
    'Heavyweight 14oz Japanese raw denim jeans',
    'Chunky black leather loafers with lug sole',
    'Fine-gauge black merino wool turtleneck',
    'Vintage beige trench coat',
    'Black leather pointed ankle boots',
  ]);
  const [newItemText, setNewItemText] = useState<string>('');
  const [aesthetic, setAesthetic] = useState<string>('Refined Sartorial Minimalism with 90s Edge');
  const [lifestyle, setLifestyle] = useState<string>('Creative Studio Work, Gallery Openings, Travel');
  const [budgetTier, setBudgetTier] = useState<string>('Investment core pieces mixed with curated archival/second-hand finds');

  const [loading, setLoading] = useState<boolean>(false);
  const [capsuleResult, setCapsuleResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const presetWardrobes = [
    {
      name: 'Sartorial Minimalist',
      aesthetic: 'Architectural Minimalist (Phoebe Philo / The Row inspired)',
      items: [
        'Boxy charcoal tailored blazer',
        'Wide-leg pleated wool trousers',
        'Heavyweight white crewneck tee',
        'Black silk bias-cut maxi skirt',
        'Black leather Chelsea boots',
        'Oversized ecru cashmere knit',
        'Classic structured leather tote',
      ],
    },
    {
      name: 'Post-Streetwear Utility',
      aesthetic: 'Utilitarian Luxury & Sartorial Edge',
      items: [
        'Cropped wool bomber jacket',
        'Relaxed washed black cargo trousers',
        'Vintage graphic heavyweight tee',
        'Square-toe leather derby shoes',
        'Technical nylon crossbody bag',
        'Oversized poplin button-down shirt',
        'Distressed straight selvedge jeans',
      ],
    },
    {
      name: 'Heritage Archival',
      aesthetic: 'Modern British Heritage & Quiet Sartorialism',
      items: [
        'Harris Tweed houndstooth blazer',
        'Cream fisherman cable knit sweater',
        'Cognac suede Chelsea boots',
        'Raw indigo denim 5-pocket jeans',
        'Waxed cotton field jacket',
        'Chambray tailored workshirt',
        'Silk pocket square & knit tie',
      ],
    },
    {
      name: '90s Helmut Reduction',
      aesthetic: 'Monochrome Reduction & Columnar Lines',
      items: [
        'Unpadded Italian wool suit jacket',
        'High-twist black straight trousers',
        'Fine rib modal tank top',
        'Vintage side-zip leather chelsea boots',
        'Bonded nylon MA-1 jacket',
        'Vintage washed 501 black denim',
      ],
    },
  ];

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    setItems([...items, newItemText.trim()]);
    setNewItemText('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleGenerateCapsule = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setCapsuleResult(null);

    try {
      const res = await fetch('/api/fashion/capsule-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          aesthetic,
          lifestyle,
          budgetTier,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to synthesize capsule matrix.');
      }

      const data = await res.json();
      setCapsuleResult(data.matrix);
    } catch (err: any) {
      console.error('Capsule matrix error:', err);
      setCapsuleResult(`**Capsule Matrix Notice:**\n\nFailed to synthesize wardrobe: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!capsuleResult) return;
    navigator.clipboard.writeText(capsuleResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!capsuleResult) return;
    onSaveToLookbook({
      title: `Capsule: ${aesthetic.slice(0, 45)}`,
      category: 'capsule',
      content: capsuleResult,
      tags: ['capsule-matrix', 'wardrobe-planner', 'cost-per-wear'],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
      
      {/* Center Studio Column: Capsule Form */}
      <main className="lg:col-span-7 studio-col p-6 sm:p-10 overflow-y-auto border-r border-[#1A1A1A]/10 bg-[#F8F7F4]">
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.01em] text-[#1A1A1A] leading-[0.95] mb-2">
          Capsule Matrix
        </h2>
        <p className="label mb-8">
          Combinatorial wardrobe formulas &amp; Cost-per-wear architecture
        </p>

        {/* Blueprint Presets */}
        <p className="label mb-2">Curated Wardrobe Blueprints</p>
        <div className="blueprint-grid mb-8">
          {presetWardrobes.map((pw, idx) => (
            <button
              key={idx}
              onClick={() => {
                setItems(pw.items);
                setAesthetic(pw.aesthetic);
              }}
              className="blueprint-card"
            >
              <h4>{pw.name}</h4>
              <p>{pw.items.length} items // {pw.aesthetic.slice(0, 35)}...</p>
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <div className="field-group">
            <p className="label mb-1">Aesthetic Thesis</p>
            <input
              type="text"
              value={aesthetic}
              onChange={(e) => setAesthetic(e.target.value)}
              className="editorial-input"
              placeholder="e.g. Refined Sartorial Minimalism with 90s Edge"
            />
          </div>

          <div className="field-group">
            <p className="label mb-1">Lifestyle &amp; Context</p>
            <input
              type="text"
              value={lifestyle}
              onChange={(e) => setLifestyle(e.target.value)}
              className="editorial-input"
              placeholder="e.g. Creative Studio Work, Gallery Openings, Travel"
            />
          </div>

          {/* Current Wardrobe Roster */}
          <div className="field-group">
            <div className="flex items-center justify-between mb-2">
              <p className="label">Active Wardrobe Roster ({items.length} Items)</p>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {items.map((item, idx) => (
                <span
                  key={idx}
                  className="chip inline-flex items-center gap-1.5 bg-white text-[#1A1A1A]"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="hover:text-red-700"
                    title="Remove item"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Item Row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Add wardrobe garment (e.g. Washed silk button-down shirt)..."
                className="editorial-input text-base"
              />
              <button
                onClick={handleAddItem}
                className="label px-3 py-2 border border-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-[#F8F7F4] transition-colors shrink-0"
              >
                + ADD
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerateCapsule}
            disabled={loading || items.length === 0}
            className="primary-btn mt-6"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                <span>CALCULATING COMBINATORIAL MATRIX...</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>SYNTHESIZE CAPSULE MATRIX</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Right Column: Output Canvas */}
      <section className="lg:col-span-5 output-col p-6 sm:p-10 flex flex-col justify-between bg-white overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center">
          {loading ? (
            <div className="output-canvas min-h-[380px]">
              <div className="loader" />
              <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
                Synthesizing Capsule Architecture
              </h3>
              <p className="label">Combinatorial Permutations &amp; Cost-Per-Wear</p>
              <p className="label text-[0.55rem] mt-1 opacity-70">
                Formula 3x3 / Vintage Sourcing Cues
              </p>
            </div>
          ) : capsuleResult ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1A1A1A]/10">
                <span className="label">Capsule Matrix Protocol</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 label hover:text-[#1A1A1A] transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#1A1A1A]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'COPIED' : 'COPY'}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 label hover:text-[#1A1A1A] transition-colors ml-2"
                  >
                    {saved ? <Check className="w-3 h-3 text-[#1A1A1A]" /> : <Bookmark className="w-3 h-3" />}
                    <span>{saved ? 'SAVED' : 'SAVE'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSendToChat(
                        `Let's expand on this capsule matrix for ${aesthetic}:\n\n${capsuleResult.slice(0, 400)}...`
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
                <Markdown>{capsuleResult}</Markdown>
              </div>
            </div>
          ) : (
            <div className="output-canvas min-h-[380px]">
              <div className="loader" />
              <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
                Awaiting Matrix Parameters
              </h3>
              <p className="label">Add wardrobe pieces or select a preset</p>
              <p className="label text-[0.55rem] mt-1 opacity-70">
                3x3 Outfit Matrix / Second-hand Search Queries
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#1A1A1A] mt-6 shrink-0">
          <p className="label">System Output 044</p>
          <p className="text-xs text-[#1A1A1A]/70 mt-1">
            Wardrobe matrix computed with combinatorial maximum versatility indexing.
          </p>
        </div>
      </section>

    </div>
  );
};
