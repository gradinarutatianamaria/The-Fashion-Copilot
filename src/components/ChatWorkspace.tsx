import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  Image as ImageIcon, 
  Globe, 
  X, 
  Copy, 
  Check, 
  Bookmark, 
  Trash2, 
  ArrowUpRight,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { ChatMessage, FashionRole, SavedLookbookItem } from '../types';
import { PRESET_PROMPTS } from '../data/fashionKnowledge';

interface ChatWorkspaceProps {
  activeRole: FashionRole;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onSaveToLookbook: (item: Omit<SavedLookbookItem, 'id' | 'timestamp'>) => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  activeRole,
  messages,
  setMessages,
  onSaveToLookbook,
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Please upload an image smaller than 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent && !selectedImage) return;

    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: currentImage || undefined,
      expertRole: activeRole,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/fashion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history,
          role: activeRole,
          useSearch,
          image: currentImage,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to receive fashion intelligence.');
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        expertRole: activeRole,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Neural Protocol Notice:**\n\n${err.message || 'The studio intelligence is temporarily recalibrating. Please retry in a few moments.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        expertRole: activeRole,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveItem = (msg: ChatMessage) => {
    onSaveToLookbook({
      title: `${msg.expertRole?.toUpperCase() || 'INTELLIGENCE'}: ${msg.content.slice(0, 45).replace(/[#*]/g, '')}`,
      category: 'styling',
      content: msg.content,
      tags: [msg.expertRole || 'fashion-copilot', 'studio-intelligence'],
    });
    setSavedId(msg.id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const clearChat = () => {
    if (window.confirm('Reset current studio consultation history?')) {
      setMessages([]);
    }
  };

  const displayedPrompts = PRESET_PROMPTS.filter(
    (p) => activeRole === 'all' || activeRole === 'all_star_panel' || p.role === activeRole
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F7F4] overflow-hidden">
      
      {/* Top Utility Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#F8F7F4] border-b border-[#1A1A1A]/10 text-xs text-[#1A1A1A] shrink-0">
        <div className="flex items-center gap-3">
          <span className="label font-bold text-[#1A1A1A]">
            Neural Fashion Stream
          </span>
          <span className="opacity-30">|</span>
          <button
            onClick={() => setUseSearch(!useSearch)}
            className={`flex items-center gap-1.5 label px-2 py-0.5 border transition-all cursor-pointer ${
              useSearch 
                ? 'bg-white text-[#1A1A1A] border-[#1A1A1A] font-semibold' 
                : 'bg-transparent text-[#1A1A1A]/50 border-[#1A1A1A]/10'
            }`}
            title="Search Google for real-time runway seasons, fashion calendar dates, and designer archives"
          >
            <Globe className="w-3 h-3 text-[#1A1A1A]" />
            <span>ORBITAL SEARCH: {useSearch ? 'ACTIVE' : 'OFFLINE'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1 label text-[#1A1A1A]/60 hover:text-red-700 transition-colors"
              title="Clear current stream"
            >
              <Trash2 className="w-3 h-3" />
              <span>PURGE STREAM</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 bg-white">
        
        {/* Welcome Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[400px] max-w-2xl mx-auto text-center py-6">
            <div className="logo-box mb-4 scale-125">
              <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
              Studio Intelligence
            </h2>
            <p className="label max-w-md mb-8 normal-case text-xs text-[#1A1A1A]/70 leading-relaxed font-sans">
              High-precision aesthetic diagnosis, proportion geometry, runway archival retrieval, and luxury brand strategy.
            </p>

            {/* Curated Diagnostic Blueprints */}
            <div className="w-full text-left">
              <p className="label mb-3">Diagnostic Blueprints</p>
              <div className="blueprint-grid">
                {displayedPrompts.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSendMessage(p.prompt)}
                    className="blueprint-card"
                  >
                    <h4>{p.title}</h4>
                    <p>{p.prompt.slice(0, 75)}...</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl mx-auto w-full`}
            >
              {/* Header Label */}
              <div className="flex items-center gap-2 mb-1">
                <span className="label text-[0.6rem]">
                  {isUser ? 'DIRECTOR INPUT' : `${message.expertRole?.toUpperCase() || 'STUDIO'} // ${message.timestamp}`}
                </span>
              </div>

              {/* Message Box */}
              <div
                className={`p-5 sm:p-6 w-full ${
                  isUser
                    ? 'bg-[#F8F7F4] border border-[#1A1A1A]/15 text-[#1A1A1A]'
                    : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]'
                }`}
              >
                {/* User Image Attachment */}
                {message.image && (
                  <div className="mb-4">
                    <img
                      src={message.image}
                      alt="Uploaded reference"
                      className="max-h-80 w-auto object-cover border border-[#1A1A1A]/20"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="fashion-prose text-sm leading-relaxed">
                  <Markdown>{message.content}</Markdown>
                </div>

                {/* Grounding Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#1A1A1A]/10">
                    <p className="label mb-2">Archival Grounding Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 label text-[0.6rem] border border-[#1A1A1A]/10 px-2 py-0.5 hover:border-[#1A1A1A] transition-colors"
                        >
                          <span className="truncate max-w-[200px]">{src.title}</span>
                          <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar for Assistant */}
                {!isUser && (
                  <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#1A1A1A]/10">
                    <button
                      onClick={() => handleCopyMessage(message.id, message.content)}
                      className="flex items-center gap-1 label hover:text-[#1A1A1A] transition-colors"
                    >
                      {copiedId === message.id ? <Check className="w-3 h-3 text-[#1A1A1A]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === message.id ? 'COPIED' : 'COPY'}</span>
                    </button>
                    <button
                      onClick={() => handleSaveItem(message)}
                      className="flex items-center gap-1 label hover:text-[#1A1A1A] transition-colors"
                    >
                      {savedId === message.id ? <Check className="w-3 h-3 text-[#1A1A1A]" /> : <Bookmark className="w-3 h-3" />}
                      <span>{savedId === message.id ? 'SAVED' : 'SAVE TO LOOKBOOK'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="max-w-3xl mx-auto w-full p-6 border border-dashed border-[#1A1A1A]/20 bg-[#F8F7F4] text-center">
            <div className="loader" />
            <h4 className="font-serif text-lg font-semibold text-[#1A1A1A]">
              Synthesizing Studio Intelligence
            </h4>
            <p className="label mt-1 text-[0.6rem]">
              Cross-referencing Runway Collections &amp; Silhouette Physics...
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Thumbnail */}
      {selectedImage && (
        <div className="px-6 py-2 bg-[#F8F7F4] border-t border-[#1A1A1A]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={selectedImage}
              alt="Preview thumbnail"
              className="w-10 h-10 object-cover border border-[#1A1A1A]/20"
            />
            <div>
              <p className="label font-bold text-[#1A1A1A]">Visual Artifact Attached</p>
              <p className="label text-[0.55rem] opacity-60">Multimodal Neural Pipeline</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="p-1 text-[#1A1A1A] hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-4 sm:p-6 bg-[#F8F7F4] border-t border-[#1A1A1A]/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-3 bg-white border border-[#1A1A1A] p-2.5"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors shrink-0"
            title="Attach reference imagery"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Instruct Fashion Copilot as ${activeRole.replace('_', ' ')}...`}
            className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none resize-none max-h-32 py-1 leading-relaxed font-sans"
          />

          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || loading}
            className="px-4 py-2 bg-[#1A1A1A] text-[#F8F7F4] label hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1">
          <span className="label text-[0.55rem]">RETURN TO TRANSMIT · SHIFT + RETURN FOR NEW LINE</span>
          <span className="label text-[0.55rem]">ENGINE: GEMINI 3.7 FLASH // MULTIMODAL</span>
        </div>
      </div>

    </div>
  );
};
