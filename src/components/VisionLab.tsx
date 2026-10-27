import React, { useState, useRef } from 'react';
import Markdown from 'react-markdown';
import { 
  Upload, 
  Eye, 
  Sparkles, 
  Check, 
  Bookmark, 
  Copy, 
  ArrowRight
} from 'lucide-react';
import { SAMPLE_OUTFIT_IMAGES } from '../data/fashionKnowledge';
import { SavedLookbookItem } from '../types';

interface VisionLabProps {
  onSaveToLookbook: (item: Omit<SavedLookbookItem, 'id' | 'timestamp'>) => void;
  onSendToChat: (message: string, image?: string) => void;
}

export const VisionLab: React.FC<VisionLabProps> = ({
  onSaveToLookbook,
  onSendToChat,
}) => {
  const [currentImage, setCurrentImage] = useState<string | null>(SAMPLE_OUTFIT_IMAGES[0].imageUrl);
  const [analysisType, setAnalysisType] = useState<string>('outfit');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Please upload an image smaller than 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCurrentImage(event.target?.result as string);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const runVisualAudit = async () => {
    if (!currentImage) return;
    setLoading(true);
    setAnalysisResult(null);

    try {
      let base64Payload = currentImage;
      if (currentImage.startsWith('http')) {
        const resp = await fetch(currentImage);
        const blob = await resp.blob();
        const reader = new FileReader();
        base64Payload = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/fashion/analyze-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Payload,
          analysisType,
          customNotes: customNotes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Visual audit failed with status ${res.status}`);
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error('Vision audit error:', err);
      setAnalysisResult(`**Visual Audit Notice:**\n\nFailed to complete diagnosis: ${err.message || 'Please retry with a clear fashion image.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!analysisResult) return;
    onSaveToLookbook({
      title: `Optical Audit: ${analysisType.toUpperCase()} Proportion Scan`,
      category: 'vision',
      content: analysisResult,
      tags: ['optical-vision', 'silhouette-proportions', analysisType],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
      
      {/* Center Studio Column: Optical Controls */}
      <main className="lg:col-span-7 studio-col p-6 sm:p-10 overflow-y-auto border-r border-[#1A1A1A]/10 bg-[#F8F7F4]">
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.01em] text-[#1A1A1A] leading-[0.95] mb-2">
          Optical Vision Lab
        </h2>
        <p className="label mb-8">
          Proportion scans &amp; Silhouette geometry audit
        </p>

        {/* Image Preview & Upload Container */}
        <div className="mb-8 border border-[#1A1A1A]/10 bg-white p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1A1A1A]/10">
            <span className="label font-bold text-[#1A1A1A]">Target Visual Scan</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="label flex items-center gap-1.5 px-3 py-1 border border-[#1A1A1A] bg-[#F8F7F4] hover:bg-[#1A1A1A] hover:text-[#F8F7F4] transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>UPLOAD LOOK</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full bg-[#1A1A1A] overflow-hidden flex items-center justify-center">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Target subject"
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="label text-[#F8F7F4]/60">Select or upload visual subject</p>
            )}
            <div className="absolute inset-0 border border-white/20 pointer-events-none p-3 flex flex-col justify-between">
              <span className="label text-white/70 text-[0.55rem]">OPTICAL SENSOR // ACTIVE</span>
              <span className="label text-white/70 text-[0.55rem] text-right">RULE OF THIRDS GRID ENGAGED</span>
            </div>
          </div>
        </div>

        {/* Archival Sample Presets (Variation 11 Blueprint Grid) */}
        <p className="label mb-2">Archival Diagnostic Targets</p>
        <div className="blueprint-grid mb-8">
          {SAMPLE_OUTFIT_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                setCurrentImage(sample.imageUrl);
                setAnalysisResult(null);
              }}
              className={`blueprint-card ${currentImage === sample.imageUrl ? 'selected' : ''}`}
            >
              <h4>{sample.title}</h4>
              <p>{sample.description}</p>
            </button>
          ))}
        </div>

        {/* Custom Diagnostic Inquiries */}
        <div className="field-group mb-6">
          <p className="label mb-1">Specific Styling Inquiries or Occasion Context</p>
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            className="editorial-input"
            placeholder="e.g. Audit pant break, shoulder seam width, and recommend shoe alternatives"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={runVisualAudit}
          disabled={loading || !currentImage}
          className="primary-btn"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
              <span>RUNNING OPTICAL VISION AUDIT...</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>EXECUTE OPTICAL PROPORTION AUDIT</span>
            </>
          )}
        </button>
      </main>

      {/* Right Column: Output & Proportion Analysis Canvas */}
      <section className="lg:col-span-5 output-col p-6 sm:p-10 flex flex-col justify-between bg-white overflow-y-auto">
        
        <div className="flex-1 flex flex-col justify-center">
          {loading ? (
            <div className="output-canvas min-h-[380px]">
              <div className="loader" />
              <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
                Scanning Optical Proportions
              </h3>
              <p className="label">Silhouette Tension &amp; Fabric Break</p>
              <p className="label text-[0.55rem] mt-1 opacity-70">
                Rule of Thirds / Color Harmony / Upgrade Formula
              </p>
            </div>
          ) : analysisResult ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1A1A1A]/10">
                <span className="label">Optical Audit Report</span>
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
                        `Let's discuss this optical proportion audit:\n\n${analysisResult.slice(0, 400)}...`,
                        currentImage || undefined
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
                <Markdown>{analysisResult}</Markdown>
              </div>
            </div>
          ) : (
            <div className="output-canvas min-h-[380px]">
              <div className="loader" />
              <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
                Awaiting Optical Subject
              </h3>
              <p className="label">Upload an outfit or select an archival target</p>
              <p className="label text-[0.55rem] mt-1 opacity-70">
                Rule of Thirds / Color Harmony / Upgrade Formula
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#1A1A1A] mt-6 shrink-0">
          <p className="label">System Output 043</p>
          <p className="text-xs text-[#1A1A1A]/70 mt-1">
            Optical scan calibrated to golden ratio geometry and archival silhouette balance.
          </p>
        </div>

      </section>

    </div>
  );
};
