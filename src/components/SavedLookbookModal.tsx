import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  Bookmark, 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Tag
} from 'lucide-react';
import { SavedLookbookItem } from '../types';

interface SavedLookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SavedLookbookItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const SavedLookbookModal: React.FC<SavedLookbookModalProps> = ({
  isOpen,
  onClose,
  items,
  onDeleteItem,
  onClearAll,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<SavedLookbookItem | null>(items[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((i) => i.category === selectedCategory);

  const handleCopy = (item: SavedLookbookItem) => {
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = () => {
    const textContent = items
      .map(
        (it) =>
          `# ${it.title} [${it.category.toUpperCase()}]\nDate: ${it.timestamp}\nTags: ${it.tags.join(', ')}\n\n${it.content}\n\n---\n`
      )
      .join('\n');

    const blob = new Blob([textContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fashion-copilot-lookbook-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#F8F7F4] border-[1.5px] border-[#1A1A1A] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F8F7F4] border-b-[1.5px] border-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="logo-box">
              <Bookmark className="w-4 h-4 text-[#1A1A1A]" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] leading-none">
                ARCHIVAL LOOKBOOK
              </h2>
              <p className="label mt-0.5">
                {items.length} saved artifacts // Editorial, Vision & Matrix telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={handleExportAll}
                className="flex items-center gap-1.5 label text-[#1A1A1A] border border-[#1A1A1A]/20 px-3 py-1.5 hover:border-[#1A1A1A] bg-white transition-all"
                title="Download all saved items as Markdown"
              >
                <Download className="w-3 h-3 text-[#1A1A1A]" />
                <span>EXPORT MARKDOWN</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 border border-[#1A1A1A]/20 text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Artifact List */}
          <div className="w-80 border-r border-[#1A1A1A]/10 bg-white flex flex-col shrink-0">
            {/* Filter Chips */}
            <div className="p-3 border-b border-[#1A1A1A]/10 flex gap-1 overflow-x-auto scrollbar-none">
              {['all', 'editorial', 'styling', 'capsule', 'vision'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1A1A1A]/5">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="label">No saved artifacts found</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = (activeItem?.id || items[0]?.id) === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveItem(item)}
                      className={`p-3.5 cursor-pointer transition-colors text-left ${
                        isSelected ? 'bg-[#F8F7F4] border-l-2 border-[#1A1A1A]' : 'hover:bg-[#F8F7F4]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="label text-[0.6rem]">{item.category}</span>
                        <span className="label text-[0.55rem] opacity-60">{item.timestamp}</span>
                      </div>
                      <h4 className="font-serif text-base font-semibold text-[#1A1A1A] line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#1A1A1A]/60 line-clamp-2 mt-0.5 font-sans">
                        {item.content.slice(0, 120).replace(/[*#]/g, '')}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Clear All Footer */}
            {items.length > 0 && (
              <div className="p-3 border-t border-[#1A1A1A]/10 bg-[#F8F7F4] flex justify-between items-center">
                <button
                  onClick={onClearAll}
                  className="flex items-center gap-1 label text-red-700 hover:underline"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Purge Vault</span>
                </button>
                <span className="label text-[0.6rem]">{items.length} Artifacts</span>
              </div>
            )}
          </div>

          {/* Right Artifact Preview */}
          <div className="flex-1 flex flex-col bg-[#F8F7F4] overflow-y-auto p-6 md:p-8">
            {activeItem ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#1A1A1A]/10">
                  <div>
                    <span className="label">{activeItem.category} // {activeItem.timestamp}</span>
                    <h3 className="font-serif text-3xl font-semibold text-[#1A1A1A] mt-1">
                      {activeItem.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(activeItem)}
                      className="flex items-center gap-1 label text-[#1A1A1A] border border-[#1A1A1A]/20 bg-white px-3 py-1.5 hover:border-[#1A1A1A]"
                    >
                      {copiedId === activeItem.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === activeItem.id ? 'COPIED' : 'COPY'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteItem(activeItem.id)}
                      className="p-1.5 border border-[#1A1A1A]/20 bg-white text-red-700 hover:border-red-700"
                      title="Delete artifact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {activeItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-6">
                    {activeItem.tags.map((tag, idx) => (
                      <span key={idx} className="chip">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="fashion-prose flex-1">
                  <Markdown>{activeItem.content}</Markdown>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="loader" />
                <h4 className="font-serif text-xl font-semibold text-[#1A1A1A] mb-1">
                  No Artifact Selected
                </h4>
                <p className="label">
                  Choose a saved item from the index on the left
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
